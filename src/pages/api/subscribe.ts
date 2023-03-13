import { query } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async function Subscribe(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "POST") {
    //verificar se o metodo da requisição é post

    const session = await getSession({ req: request }); //pegando usuário logado

    const user = await fauna.query<User>( //pegando usuario por email
      query.Get(
        query.Match(
          query.Index("user_by_email"),
          query.Casefold(session.user.email)
        )
      )
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      // verificando se existe um usuario cadastrano do fauna ja com esse customer_id
      const stripeCustomer = await stripe.customers.create({
        //criando customer/comprador/cliente no painel do stripe
        email: session.user.email,
        // metadata
      });
      await fauna.query(
        query.Update(query.Ref(query.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );
      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, //quem esta comprando esse produto
      payment_method_types: ["card"], //pagamento por cartao
      billing_address_collection: "required", // aqui eu quero obrigar que o usuario preencha o campo de endereço,
      // caso eu nao quisesse eu colocaria auto
      line_items: [
        {
          //itens que vai ter dentro do carrinho
          price: "price_1LUXOqJZKbzukAQr1EUDpxwu",
          quantity: 1,
        },
      ],
      mode: "subscription", //pagamento recorrente,
      allow_promotion_codes: true, //para cupos de descontos caso eu tenha

      success_url: process.env.STRIPE_SUCCESS_URL, //quando der sucesso usuario vai ser redirecionado para essa url
      cancel_url: process.env.STRIPE_CANCEL_URL, //quando usuario cancela a requisicao
    });

    return response.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    response.setHeader("Allow", "POST"); //explicando pra quem ta fazendo a requisicao que essa rota aceita post apenas
    response.status(405).end("Method not Allowed"); //.end é usado para responder sem nehum dado (.json e tals)
    //status 405 é pra method nao permitido
  }
}
