import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import SubscribeButton from "../components/SubscribeButton";
import { stripe } from "../services/stripe";
import styles from "./home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | Ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, Welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount}</span> month
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <Image
          src="/images/avatar.svg"
          alt="Girl Coding"
          width={100}
          height={100}
        />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  //tudo aqui dentro dessa função está rodando no servidor node
  const price = await stripe.prices.retrieve("price_1LUXOqJZKbzukAQr1EUDpxwu", {
    // expand: ['product'] //expand serve para eu ter aceso a todas as informações do produto
  }); //retrieve é para um preço só
  //esse parametro dentro do retrieve é o id do produto
  //console.log(price);

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100), //preço em tipo number (vem sempre em centavos por isso a divisao com 100)
  };

  return {
    props: {
      product,
    }, //tudo que estiver aqui dentro é mostrado dentro do componente pela props
    revalidate: 60 * 60 * 24, // 24 horas (segundos * minutos * horas)
  };
};
