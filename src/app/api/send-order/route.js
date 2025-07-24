import nodemailer from "nodemailer";

export async function POST(req) {
  const data = await req.json();
  const { name, lastName, email, address, phone, deliveryDay, total, items } =
    data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const itemList = items
    .map(
      (item) => `- ${item.quantity} x ${item.name} ($${item.price.toFixed(2)})`
    )
    .join("\n");

  // Email para el cliente
  const clientMessage = `
Hi ${name} 👋

Thank you for your order from Glow Bake - So Sweet! 🍪✨

Here are your order details:
-----------------------------
Name: ${name} ${lastName}
Email: ${email}
Phone: ${phone}
Address: ${address}
Delivery Day: ${deliveryDay}

Order Summary:
${itemList}

Total: $${total.toFixed(2)}

💳 To complete your payment:
- Zelle: 945 400 5808
- Venmo: @EleanaMachella

Please make your payment to confirm the order. We’ll notify you once it’s ready!

Thanks again!
Glow Bake - So Sweet
`;

  // Email para tu esposa
  const ownerMessage = `
📦 New Order Received!

Customer: ${name} ${lastName}
Email: ${email}
Phone: ${phone}
Address: ${address}
Delivery Day: ${deliveryDay}

Order Details:
${itemList}

Total to collect: $${total.toFixed(2)}
`;

  try {
    // Enviar al cliente
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Glow Bake - Order Details & Payment Info",
      text: clientMessage,
    });

    // Enviar a tu esposa
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "glowbakesosweet@gmail.com",
      subject: "New Order - Glow Bake",
      text: ownerMessage,
    });

    return new Response("Emails sent", { status: 200 });
  } catch (err) {
    console.error("Email error:", err);
    return new Response("Error sending emails", { status: 500 });
  }
}
