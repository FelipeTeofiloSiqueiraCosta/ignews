import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction =  false
) {
    const userRef = await fauna.query(
        q.Select(
            "ref", //quero pegar apenas a ref
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    );

    const subscription = await stripe.subscriptions.retrieve(subscriptionId); //pegando dados da subscription com o id subscriptionId

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    if(createAction){
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                {data: subscriptionData}
            )
        )
    }else{
        //doi metodos para atualizar algo dentro do fauna o update e o replace
        // o update eu atualizo alguns campos dentro do registro o replace ele simplemente substitui
        await fauna.query(
            q.Replace( 
                q.Select(
                    'ref',
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                {data: subscriptionData}
            ) 
        )
    }
    


}