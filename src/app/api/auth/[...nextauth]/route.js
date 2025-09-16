import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const user = await PrismaClient.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("❌ Usuario no encontrado");
            return null;
          }

          console.log("🔑 Password recibido:", credentials.password);
          console.log("🔐 Password en DB:", user.password);

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("🔎 Resultado compare:", isValid);

          if (!isValid) {
            console.log("❌ Password incorrecto");
            return null;
          }

          console.log("✅ Login correcto para", user.email);

          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error("🔥 Error en authorize:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
