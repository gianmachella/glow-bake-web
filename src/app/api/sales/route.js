import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

// 1. LISTAR VENTAS (GET)
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { cookie: true } },
      },
    });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching sales" },
      { status: 500 },
    );
  }
}

// 2. CREAR VENTA (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    const { customerEmail, items, deliveryDay, paymentMethod, total } = body;

    const finalEmail = customerEmail
      ? customerEmail.toLowerCase()
      : "event.customer@glowbake.com";

    const customer = await prisma.customer.upsert({
      where: { email: finalEmail },
      update: { name: customerEmail ? "Event Customer" : "Walk-in Customer" },
      create: {
        email: finalEmail,
        name: customerEmail ? "Event Customer" : "Walk-in Customer",
        lastName: "POS Order",
      },
    });

    const sale = await prisma.sale.create({
      data: {
        total,
        deliveryDay,
        deliveryMethod: "Pickup",
        customerId: customer.id,
        items: {
          create: items.map((item) => ({
            cookieId: item.cookieId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { cookie: true } } },
    });

    // --- LÓGICA DE EMAIL CORREGIDA ---
    // Inicializamos Resend solo si tenemos la KEY y el EMAIL para evitar errores en Build
    if (
      customerEmail &&
      customerEmail.includes("@") &&
      process.env.RESEND_API_KEY
    ) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const itemListHtml = items
        .map(
          (item) => `
          <li style="margin-bottom: 10px; list-style: none; border-bottom: 1px solid #eee; padding-bottom: 8px; display: flex; justify-content: space-between;">
            <span><strong>${item.quantity}x</strong> ${item.name}</span>
            <span style="font-weight: bold;">$${(item.quantity * item.price).toFixed(2)}</span>
          </li>`,
        )
        .join("");

      const htmlMessage = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; border: 1px solid #fce7f3; padding: 40px 30px; border-radius: 24px; background-color: #ffffff;">
    
    <div style="text-align: center;">
      <img src="https://glowbake.com/images/logo-circle.png" alt="Glow Bake" style="max-width: 120px; margin-bottom: 20px;" />
      <h1 style="color: #d63384; margin: 0; font-size: 26px; font-weight: 700;">Sweet Thanks!</h1>
      <p style="color: #6b7280; font-size: 15px; margin-top: 8px;">
        We’re so happy you stopped by today. Your support means the world to our small bakery!
      </p>
    </div>

    <div style="margin: 30px 0; border-top: 2px dashed #fce7f3; border-bottom: 2px dashed #fce7f3; padding: 25px 0;">
      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 15px;">Order Summary</h3>
      <ul style="padding: 0; margin: 0; list-style: none;">
        ${itemListHtml}
      </ul>
    </div>

    <div style="background: #fff1f2; padding: 20px; border-radius: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
        <span style="font-weight: bold; color: #be185d; font-size: 12px; text-transform: uppercase;">Payment Method</span>
        <span style="color: #4b5563; font-size: 14px; font-weight: 600;">${paymentMethod}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #fecdd3; pt: 10px; margin-top: 10px; padding-top: 10px;">
        <span style="font-weight: bold; color: #be185d; font-size: 13px; text-transform: uppercase;">Amount Paid</span>
        <span style="font-size: 24px; font-weight: 800; color: #d63384;">$${total.toFixed(2)}</span>
      </div>
    </div>

    <div style="text-align: center; margin-top: 35px;">
      <p style="color: #4b5563; font-size: 15px; margin-bottom: 5px;">We hope you enjoy every single bite!</p>
      <p style="color: #d63384; font-weight: bold; font-size: 16px; margin: 0;">See you soon,</p>
      <p style="color: #d63384; font-weight: bold; font-size: 18px; margin-top: 2px;">The Glow Bake Team 🍪</p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 12px;">Follow our sweet journey on Instagram</p>
      <a href="https://www.instagram.com/glow.bake?igsh=NzByd3RqdDR5MzB4&utm_source=qr" 
         style="background-color: #d63384; color: #ffffff; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
         @glow.bake
      </a>
    </div>
  </div>
`;

      try {
        await resend.emails.send({
          from: "Glow Bake <hello@glowbake.com>",
          to: customerEmail,
          subject: "Your Glow Bake Receipt 🍪",
          html: htmlMessage,
          reply_to: "glowbakesosweet@gmail.com",
        });
      } catch (e) {
        console.error("Email error:", e);
      }
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ELIMINAR VENTA (DELETE)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 },
      );
    }

    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    const deletedSale = await prisma.sale.delete({ where: { id: id } });

    return NextResponse.json({ message: "Sale deleted", deletedSale });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
