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
      (item) =>
        `<li><strong>${item.quantity}</strong> x ${item.name} - $${item.price.toFixed(2)}</li>`
    )
    .join("");

  const htmlMessage = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
    <div style="text-align: center;">
      <img src="https://glowbake.com/images/logo-gb.png" alt="Glow Bake" style="max-width: 200px; margin-bottom: 20px;" />
      <h2 style="color: #d63384;">Thank you for your order, ${name} ${lastName}!</h2>
    </div>

    <p>Here are your order details:</p>
    <hr />
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Delivery Day:</strong> ${deliveryDay}</p>

    <h3>Your Order:</h3>
    <ul>${itemList}</ul>

    <p><strong>Total:</strong> $${total.toFixed(2)}</p>

    <hr />
    <p>Please send your payment to:</p>
    <p><strong>Zelle:</strong> 945-400-5808</p>
    <p><strong>Venmo:</strong> @EleanaMachella</p>

    <p>We'll start preparing your order as soon as we receive the payment.</p>
    <p style="font-weight: bold; color: #d63384;">Thank you for choosing Glow Bake!</p>

    <div style="margin-top: 30px; text-align: center;">
      <a href="https://www.instagram.com/glow.bake/" style="margin: 0 10px;">
        <img src="https://glowbake.com/images/instagram.png" alt="Instagram" style="width: 24px; height: 24px;" />
      </a>
      <a href="https://www.facebook.com/profile.php?id=61578248566814" style="margin: 0 10px;">
        <img src="https://glowbake.com/images/facebook.png" alt="Facebook" style="width: 24px; height: 24px;" />
      </a>
    </div>
  </div>
`;

  const ownerMessage = `
New order received!

Customer: ${name} ${lastName}  
Email: ${email}  
Phone: ${phone}  
Address: ${address}  
Delivery Day: ${deliveryDay}

Order:
${items.map((item) => `- ${item.quantity} x ${item.name} ($${item.price.toFixed(2)})`).join("\n")}

Total: $${total.toFixed(2)}
`;

  try {
    const clientRes = await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: email,
      subject: "Your Glow Bake Order Confirmation",
      html: htmlMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });

    console.log("Client email response:", clientRes);

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
