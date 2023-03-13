/* import Prismic from "@prismicio/client"; */

/* export function getPrismicClient(req?: unknown) {
  const prismic = Prismic.createClient(process.env.PRISMIC_ACCESS_TOKEN, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
  return prismic;
}
 */

import * as prismic from "@prismicio/client";
import * as prismicNext from "@prismicio/next";
import { NextApiRequest, PreviewData } from "next";
import { NextIncomingMessage } from "next/dist/server/request-meta";
import sm from "../../sm.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName = prismic.getRepositoryName(sm.apiEndpoint);

// Update the routes array to match your project's route structure
/** @type {prismic.ClientConfig['routes']} **/
const routes = [
  {
    type: "publication",
    path: "/posts",
  },
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config {prismicNext.CreateClientConfig} - Configuration for the Prismic client.
 */

interface IConfig {
  req?:
    | NextApiRequest
    | (NextIncomingMessage & { cookies: Partial<{ [key: string]: string }> });
  previewData?: PreviewData;
}

export const createClient = ({ req, previewData }: IConfig) => {
  const client = prismic.createClient(sm.apiEndpoint, {
    routes,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  prismicNext.enableAutoPreviews({
    client,
    previewData: previewData,
    req,
  });

  return client;
};
