// src/middleware.ts (o raíz según tu estructura)
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log("Middleware corriendo en:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      // 👇 Aquí está la clave: si no hay token => no entra
      authorized: ({ token }) => {
        if (!token) return false;
        return true;
      },
    },
    pages: {
      signIn: "/login", // Redirección si no hay sesión
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"], // protege dashboard y subrutas
};
