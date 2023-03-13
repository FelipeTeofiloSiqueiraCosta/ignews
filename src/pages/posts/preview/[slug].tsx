import { GetStaticPaths, GetStaticProps } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import styles from "../post.module.scss";
import { RichText } from "prismic-dom";
import { createClient } from "../../../services/prismic";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface IPreviewProps {
  post: {
    updatedAt: string;
    slug: string;
    content: string;
    title: string;
  };
}

export default function PostPreview({ post }: IPreviewProps) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} Ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/" prefetch>
              <a>Subscribe Now 😜</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
//só existe em paginas que tem parametros nas rotas
export const getStaticPaths: GetStaticPaths = () => {
  // serve para quando queremos gerar páginas estáticas ex: /posts/preview/ashdhaushda.html
  // quando damos um npm run build ele vai gerar essa página pra gente
  // no caso passei um array vazio pq n quero gerar pagina estaticaq quero que meus
  // previews sejam carregados quando a primeira pessoa acessar o preview
  // dai ele vai ficar statico na memoria do server
  // dai a prox pessoa acessa e pega la da memoria até acabar o tempo
  // poderia ser:
  /*  paths: [
      {
        params: {
          slug: "no-que-diz-respeito-a-arquiteturaclient-side-ou-lado",
        },
      },
    ], */

  return {
    paths: [],
    // fallback: true => abre a tela e carrega seus elementos caso a aplicação
    // nao esteja gerada staticamente pelo nosso servidor next
    // fallback: false => se o post não foi gerado de forma estática, ele vai retornar um 404

    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = createClient({});

  const result = await prismic.getByUID("publication", String(slug));

  result.data.content[0].text = result.data.content[0].text.substring(
    0,
    parseInt(`${result.data.content[0].text.length / 3}`)
  );
  result.data.content[0].text += "...";

  const post = {
    slug,
    title: RichText.asText(result.data.title),
    content: RichText.asHtml(result.data.content),
    updatedAt: new Date(result.last_publication_date).toLocaleDateString(
      "pt-Br",
      { day: "2-digit", month: "long", year: "numeric" }
    ),
  };

  return {
    props: { post },
    redirect: 60 * 30,
  };
};
