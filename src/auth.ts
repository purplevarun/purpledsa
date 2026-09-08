import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const username = String(credentials.username ?? "").trim();
        const password = String(credentials.password ?? "");

        if (!username || !password) {
          return null;
        }

        const existing = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (existing) {
          if (!existing.passwordHash || !verifyPassword(password, existing.passwordHash)) {
            return null;
          }

          return {
            id: existing.id,
            name: existing.name ?? existing.username,
            username: existing.username,
          };
        }

        const passwordHash = hashPassword(password);
        const created = await db
          .insert(users)
          .values({
            username,
            name: username,
            passwordHash,
          })
          .returning({
            id: users.id,
            name: users.name,
            username: users.username,
          });

        const user = created[0];
        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.username,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
});
