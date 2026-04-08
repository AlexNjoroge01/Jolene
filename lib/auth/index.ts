import Credentials from "next-auth/providers/credentials"
import NextAuth, { type DefaultSession } from "next-auth"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { developers } from "@/lib/db/schema"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: "hod" | "developer"
      developerId: string
    }
  }

  interface User {
    role: "hod" | "developer"
    developerId: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        if (parsed.data.password !== "password") return null

        const userRecord = await db.query.developers.findFirst({
          where: eq(developers.email, parsed.data.email),
        })

        if (!userRecord) return null

        return {
          id: userRecord.id.toString(),
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.email === "hod@goip.local" ? "hod" : "developer",
          developerId: userRecord.id.toString(),
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.developerId = user.developerId
      }
      return token
    },
    async session({ session, token }) {
      const role = token.role as "hod" | "developer" | undefined
      const developerId = token.developerId as string | undefined
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.role = role ?? "developer"
        session.user.developerId = developerId ?? ""
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})
