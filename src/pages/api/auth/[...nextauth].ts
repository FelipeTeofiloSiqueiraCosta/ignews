import NextAuth from "next-auth";
import { query as q } from "faunadb";
import GithubProvider from "next-auth/providers/github";

import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // authorization: {
      //   url: "https://github.com/login/oauth/authorize",
      //   params: {scope: 'read:user'},
      // },
    }),
  ],
  callbacks: {
    async session({ session }) {
      //permite agente modificar os dados dentro do hook useSession
      try {
        session.user.email;

        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );

        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch {
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
    async signIn({ user, account, profile }) {
      //metodo chamado toda vez que o user fazer login
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            //se
            q.Not(
              //não
              q.Exists(
                //existe um usuário
                q.Match(
                  // onde (esse match pode ser comparado com o where)
                  q.Index("user_by_email"),
                  q.Casefold(user.email) //normaliza para letra minuscula
                ) //indice = email
              )
            ),
            //Create() é para fazer uma inserção, (primeira parametro é qual a collection que queremos interir e p
            // segundo é o data (os dados))
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(
              //select
              q.Match(
                // onde (esse match pode ser comparado com o where)
                q.Index("user_by_email"),
                q.Casefold(user.email) //normaliza para letra minuscula
              ) //indice = email
            )
          )
        ); //essa forma de escrita se chama fql
        return true;
      } catch {
        return false;
      }
    },
  },
});
