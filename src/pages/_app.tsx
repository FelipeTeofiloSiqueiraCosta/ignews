import "../styles/global.scss";
import { AppProps } from "next/app";
import Header from "../components/Header";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { PrismicProvider } from "@prismicio/react";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "../services/prismic";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  //quando da um f5 na pagina as informações se o user ta logado ou não
  //vao chegar atravez da pageProps ali
  return (
    <SessionProvider session={session}>
      <Header />
      <PrismicProvider internalLinkComponent={(props) => <Link {...props} />}>
        <PrismicPreview repositoryName={repositoryName}>
          <Component {...pageProps} />
        </PrismicPreview>
      </PrismicProvider>
    </SessionProvider>
  );
}

export default MyApp;
