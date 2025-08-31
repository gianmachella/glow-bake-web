import { Resend } from "resend";

export async function POST(req) {
  const body = await req.json();
  const {
    name,
    lastName,
    email,
    phone,
    address,
    deliveryDay,
    notes,
    total,
    items,
  } = body;

  if (!email || !email.includes("@")) {
    console.error("Invalid email:", email);
    return new Response("Invalid email", { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY); // 👈 usa env var, no hardcode

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

    <p>Here are your order details:</p>
    <hr />
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Delivery Day:</strong> ${deliveryDay}</p>
    <p><strong>Notes:</strong> ${notes || "None"}</p>

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

    return new Response("Emails sent!", { status: 200 });
  } catch (err) {
    console.error("Resend error:", err?.response?.data || err);
    return new Response("Error sending emails", { status: 500 });
  }
}
