import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Primero eliminamos los items de la venta (por la relación de la DB)
    await prisma.saleItem.deleteMany({
      where: { saleId: id },
    });

    // Luego eliminamos la venta
    const deletedSale = await prisma.sale.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Sale deleted", deletedSale });
  } catch (error) {
    console.error("❌ DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customerEmail, items, deliveryDay, paymentMethod, total } = body;

    // 1. Manejo del Cliente (Upsert para no duplicar)
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

    // 2. Guardar la venta en la DB
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

    // 3. Envío de Email (Solo si hay email real)
    if (customerEmail && customerEmail.includes("@")) {
      const itemListHtml = items
        .map(
          (item) => `
          <li style="margin-bottom: 10px; list-style: none; border-bottom: 1px solid #eee; padding-bottom: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>${item.quantity}x</strong> ${item.name}</span>
              <span style="font-weight: bold;">$${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          </li>`,
        )
        .join("");

      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #fce7f3; padding: 30px; border-radius: 20px;">
          <div style="text-align: center;">
            <img src="https://glowbake.com/images/logo-circle.png" alt="Glow Bake" style="max-width: 150px; margin-bottom: 20px;" />
            <h2 style="color: #d63384; margin: 0;">Thank you for your purchase!</h2>
            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase;">In-Store Receipt</p>
          </div>
          
          <div style="margin: 25px 0; border-top: 2px dashed #fce7f3; border-bottom: 2px dashed #fce7f3; padding: 20px 0;">
            <h3 style="font-size: 16px; color: #333;">Order Summary:</h3>
            <ul style="padding: 0; margin: 0;">${itemListHtml}</ul>
          </div>

          <div style="background: #fff1f2; padding: 20px; border-radius: 15px; text-align: right;">
            <span style="font-weight: bold; color: #d63384; margin-right: 10px;">TOTAL PAID</span>
            <span style="font-size: 24px; font-weight: bold; color: #000;">$${total.toFixed(2)}</span>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Payment Method: <strong>${paymentMethod}</strong></p>
            <p>Location: <strong>Princeton, TX</strong></p>
            <p style="color: #d63384; font-weight: bold; margin-top: 15px;">@glowbake</p>
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: "Glow Bake <hello@glowbake.com>", // 👈 Usando el verificado
          to: customerEmail,
          subject: "Your Glow Bake Receipt 🍪",
          html: htmlMessage,
          reply_to: "glowbakesosweet@gmail.com",
        });
      } catch (emailErr) {
        console.error("❌ Error enviando el recibo:", emailErr);
      }
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("❌ POS Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
