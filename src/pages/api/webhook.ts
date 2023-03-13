import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
    const chuncks = []
    for await (const chunk of readable){
        chuncks.push(
            typeof chunk == "string" ? Buffer.from(chunk): chunk
        );
    }
    return Buffer.concat(chuncks)
}

// por padrão o next tem um formato de entender a requisição, ele entende que toda requisição vai ir como um json
// ou com envio de form, no caso a requisição vai vir como uma Stream/Readable
//  então eu tenho que desabilitar o entendimenteo padrão do next sobre a requisição
// por isso construimos esse config abaixo:

export const config = {
    api:{
        bodyParser: false
    }
}

const relevantEvent = new Set([ //set é um array com nada repitido dentro
    'checkout.session.completed', //foi feita a compra do plano
    // 'customer.subscription.created', // evento de criacao de usuario no stripe
    'customer.subscription.updated', // evento de atualizacao de user no stripe
    'customer.subscription.deleted', // evento de deletar assinatura no stripe
])      

export default async (req: NextApiRequest, res: NextApiResponse) => { //req é um readable por padrão
    if( req.method==="POST"){
        const buf = await buffer(req);
        const secret = req.headers['stripe-signature'];
        
        let event: Stripe.Event;
        
        try {
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        const {type} = event; //pegando tipo do event
        
        // console.log(type)
        if(relevantEvent.has(type)){
            try{
                switch(type){
                    // case 'customer.subscription.created':
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':

                        const subscription = event.data.object as Stripe.Subscription;

                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            // type==="customer.subscription.created"
                            false
                        );

                        break; 
                    case 'checkout.session.completed':
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;
                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        )
                        break;
                    default:
                        throw new Error(`Unhandled event type ${event.type}`);
                }
            }catch (err){
                
                return res.json({error: 'Webhook hadler failed'})
            }
        }

        res.status(200).json({received: true})
    }else{
        res.setHeader('Allow','POST'); //explicando pra quem ta fazendo a requisicao que essa rota aceita post apenas
        res.status(405).end('Method not Allowed'); //.end é usado para responder sem nehum dado (.json e tals)
        //status 405 é pra method nao permitido
    }
}