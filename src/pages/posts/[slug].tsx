import { GetServerSideProps, GetStaticProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import styles from "./post.module.scss";
import { RichText } from "prismic-dom";
import { createClient } from "../../services/prismic";

interface IProps {
  post: {
    updatedAt: string;
    slug: string;
    content: string;
    title: string;
  };
}

export default function Post({ post }: IProps) {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  previewData,
  params,
  req,
}) => {
  const session = await getSession({ req });

  const { slug } = params;

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: "/",
        permanent: false, //pq o redirecionamento não é permanente
      },
    };
  }

  const prismic = createClient({ previewData, req });

  const result = await prismic.getByUID("publication", String(slug));

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
  };
};
