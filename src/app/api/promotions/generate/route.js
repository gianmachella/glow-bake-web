import { NextResponse } from "next/server";
// IMPORTANTE: Si usas Resend, deja la siguiente línea. Si usas Nodemailer, cámbiala.
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Guardar en la Base de Datos
    const newPromo = await prisma.promotion.create({
      data: { email: email.toLowerCase() },
    });

    // 2. Configurar el QR y el Email
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${newPromo.id}`;

    // 3. Enviar el Email (Copia el estilo de tus otras APIs aquí)
    await resend.emails.send({
      from: "GlowBake <hello@glowbake.com>", // Usa tu dominio verificado
      to: email,
      subject: "Your Sweet Treat for the Lucas Farmers Market! 🍪",
      html: `
  <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #fce7f3; border-radius: 20px; overflow: hidden;">
    <div style="background-color: #ec4899; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-style: italic;">GlowBake</h1>
    </div>
    <div style="padding: 30px; text-align: center; background-color: white;">
      <h2 style="color: #333;">Your Market Coupon!</h2>
      
      <div style="background-color: #fff5f5; border: 1px solid #feb2b2; padding: 10px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: bold;">
          ⚠️ ONLY VALID AT LUCAS FARMERS MARKET
        </p>
      </div>

      <p style="color: #666;">Show this QR code at our booth to redeem:</p>
      <p style="font-size: 26px; font-weight: bold; color: #ec4899; margin: 15px 0;">$1 OFF per cookie</p>
      
      <div style="margin: 20px 0;">
        <img src="${qrUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 4px solid #fce7f3;" />
      </div>
      
      <p style="font-size: 11px; color: #999; line-height: 1.4;">
        * This coupon is <strong>not valid for website or online purchases</strong>.<br>
        * One-time use per customer at the physical booth in Lucas, TX.
      </p>
    </div>
  </div>
`,
    });

    return NextResponse.json(
      { message: "Coupon sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    // Si el email ya existe en la tabla Promotion
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This email has already claimed a coupon." },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
