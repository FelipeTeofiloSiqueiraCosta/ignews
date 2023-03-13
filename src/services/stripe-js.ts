import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
    const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) //dai aqui agente passa uma chave publica la do stripe,
    // voce pode encontrar essa chave na area de desenvolvedor depous em chaves da api (https://dashboard.stripe.com/test/apikeys)
    return stripeJs
}