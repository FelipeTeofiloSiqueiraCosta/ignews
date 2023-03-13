import { GetStaticProps } from "next";
import Head from "next/head";
import React from "react";
import { createClient } from "../../services/prismic";
import styles from "./styles.module.scss";
import { RichText } from "prismic-dom";
import Link from "next/link";
interface IProps {
  posts: [
    {
      updatedAt: string;
      id: string;

      content: string;
      title: string;
    }
  ];
}

export default function Posts({ posts }: IProps) {
  return (
    <>
      <Head>
        <title>Posts Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((item) => {
            return (
              <Link href={`/posts/${item.id}`} key={item.id}>
                <a>
                  <time>{item.updatedAt}</time>

                  <strong>{item.title}</strong>

                  <p>{item.content}</p>
                </a>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = createClient({ previewData });

  const response = await prismic.getAllByType("publication", {
    fetch: ["publication.title", "publication.content"],
    pageSize: 100,
  });

  const posts = response.map((post) => {
    return {
      id: post.uid,
      title: RichText.asText(post.data.title),
      content:
        post.data.content.find((content) => content.type == "paragraph")
          ?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-Br",
        { day: "2-digit", month: "long", year: "numeric" }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
