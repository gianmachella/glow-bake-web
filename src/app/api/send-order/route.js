// app/api/send-order/route.js
import { Resend } from "resend";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const body = await req.json();
  const {
    name,
    lastName,
    email,
    phone,
    address,
    deliveryMethod,
    deliveryDay,
    notes,
    total,
    items,
  } = body;

  if (!email || !email.includes("@")) {
    console.error("Invalid email:", email);
    return new Response("Invalid email", { status: 400 });
  }

  // 📦 Guardar en DB
  try {
    // 1. Buscar o crear Customer
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name,
        lastName,
        phone,
        address,
      },
      create: {
        name,
        lastName,
        email,
        phone,
        address,
      },
    });

    // 2. Guardar cada venta en Sales
    for (const item of items) {
      await prisma.sale.create({
        data: {
          cookieId: item.id, // 👈 asegúrate que en tu FE mandes `id` de la cookie
          customerId: customer.id,
          quantity: item.quantity,
          total: item.price * item.quantity,
        },
      });
    }
  } catch (err) {
    console.error("❌ Error saving order in DB:", err);
    return new Response("Error saving order", { status: 500 });
  }

  // 📧 Enviar emails (lo mismo que ya tenías)
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemList = items
    .map((item) => {
      const flavorList =
        item.flavors && Object.keys(item.flavors).length > 0
          ? `<ul style="margin: 4px 0 10px 0; padding-left: 1em; font-size: 14px;">
              ${Object.entries(item.flavors)
                .filter(([_, qty]) => qty > 0)
                .map(([flavor, qty]) => `<li>${flavor}: ${qty}</li>`)
                .join("")}
            </ul>`
          : "";

      return `<li style="margin-bottom: 10px;">
                <strong>${item.quantity}</strong> x ${item.name} - $${item.price.toFixed(2)}
                ${flavorList}
              </li>`;
    })
    .join("");

  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <div style="text-align: center;">
        <img src="https://glowbake.com/images/logo-circle.png" alt="Glow Bake" style="max-width: 200px; margin-bottom: 20px;" />
        <h2 style="color: #d63384;">Thank you for your order, ${name} ${lastName}!</h2>
      </div>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Method:</strong> ${deliveryMethod}</p>
      <p><strong>Address:</strong> ${
        deliveryMethod === "Pickup"
          ? "5614 Mystic Glade Way, Princeton, TX 75407"
          : address
      }</p>
      <p><strong>${deliveryMethod} Day:</strong> ${deliveryDay}${
        deliveryMethod === "Pickup" && deliveryDay === "Other"
          ? " (⚠️ Minimum purchase is 10 cookies for this service)"
          : ""
      }</p>
      <p><strong>Notes:</strong> ${notes || "None"}</p>
      <h3>Your Order:</h3>
      <ul>${itemList}</ul>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
      <hr />
      <p>Please send your payment to:</p>
      <p><strong>Zelle:</strong> 945-400-5808</p>
      <p><strong>Venmo:</strong> @EleanaMachella</p>
      <p style="font-weight: bold; color: #d63384;">Thank you for choosing Glow Bake!</p>
    </div>
  `;

  const ownerMessage = `
New order received!

Customer: ${name} ${lastName}  
Email: ${email}  
Phone: ${phone}  
Method: ${deliveryMethod}  
Address: ${
    deliveryMethod === "Pickup"
      ? "5614 Mystic Glade Way, Princeton, TX 75407"
      : address
  }  
${deliveryMethod} Day: ${deliveryDay}
Notes: ${notes || "None"}

Order:
${items
  .map((item) => {
    const flavors =
      item.flavors && Object.keys(item.flavors).length > 0
        ? Object.entries(item.flavors)
            .filter(([_, qty]) => qty > 0)
            .map(([flavor, qty]) => `    - ${flavor}: ${qty}`)
            .join("\n")
        : "";
    return `- ${item.quantity} x ${item.name} ($${item.price.toFixed(2)})${
      flavors ? "\n" + flavors : ""
    }`;
  })
  .join("\n")}
Total: $${total.toFixed(2)}
`;

  try {
    await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: email,
      subject: "Your Glow Bake Order Confirmation",
      html: htmlMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });

    await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: "glowbakesosweet@gmail.com",
      subject: `📦 New Order Received - ${name} `,
      text: ownerMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });

    return new Response("Order saved and emails sent!", { status: 200 });
  } catch (err) {
    console.error("Resend error:", err?.response?.data || err);
    return new Response("Error sending emails", { status: 500 });
  }
}
