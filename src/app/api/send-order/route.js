import { Resend } from "resend";

export async function POST(req) {
  const body = await req.json();

  const { name, lastName, email, phone, address, deliveryDay, total, items } =
    body;

  if (!email || !email.includes("@")) {
    console.error("Invalid email:", email);
    return new Response("Invalid email", { status: 400 });
  }

  const resend = new Resend("re_19Q7Hfn8_M244cDRgMMCpuYmRCju4og25");

  const itemList = items
    .map(
      (item) => `- ${item.quantity} x ${item.name} ($${item.price.toFixed(2)})`
    )
    .join("\n");

  const clientMessage = `
Thank you for your order, ${name} ${lastName}!

Here are your order details:
----------------------------
Email: ${email}
Phone: ${phone}
Address: ${address}
Delivery Day: ${deliveryDay}

Your order:
${itemList}

Total: $${total.toFixed(2)}

----------------------------
 Please send your payment to:

Zelle: 945-400-5808  
Venmo: @EleanaMachella

We'll start preparing your order as soon as we receive the payment.
Thank you for choosing Glow Bake!
`;

  const ownerMessage = `
New order received!

Customer: ${name} ${lastName}  
Email: ${email}  
Phone: ${phone}  
Address: ${address}  
Delivery Day: ${deliveryDay}

Order:
${itemList}

Total: $${total.toFixed(2)}
`;

  try {
    // Send to customer
    const clientRes = await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",

      to: email,
      subject: "Your Glow Bake Order Confirmation",
      text: clientMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });

    console.log("Client email response:", clientRes);

    // Send to owner
    const ownerRes = await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",

      to: "glowbakesosweet@gmail.com",
      subject: "📦 New Order Received",
      text: ownerMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });

    console.log("Owner email response:", ownerRes);

    return new Response("Emails sent!", { status: 200 });
  } catch (err) {
    console.error("Resend error:", err?.response?.data || err);
    return new Response("Error sending emails", { status: 500 });
  }
}
