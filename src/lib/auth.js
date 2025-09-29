import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("👉 Credentials recibidas:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Faltan credenciales");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("🔍 Usuario en DB:", user);

          if (!user) {
            console.log("❌ Usuario no encontrado");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("🔑 Password válida?", isValid);

          if (!isValid) {
            console.log("❌ Password incorrecto");
            return null;
          }

          console.log("✅ Login correcto para", user.email);

          // 👇 devolvemos todo lo que necesitan los callbacks
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.email, // NextAuth a veces requiere este campo
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
