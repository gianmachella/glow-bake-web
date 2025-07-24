import { Resend } from "resend";

export async function POST(req) {
  const body = await req.json();
  const { name, email, message } = body;

  if (!email || !email.includes("@") || !name || !message) {
    return new Response("Invalid input", { status: 400 });
  }

  const resend = new Resend("re_19Q7Hfn8_M244cDRgMMCpuYmRCju4og25");

  const text = `
New contact message from Glow Bake

Name: ${name}
Email: ${email}

Message:
${message}
`;

  try {
    const response = await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: "glowbakesosweet@gmail.com",
      subject: "New Contact Message",
      text,
      reply_to: email,
    });

    console.log("Contact email sent:", response);
    return new Response("Message sent", { status: 200 });
  } catch (error) {
    console.error("Resend error:", error);
    return new Response("Email error", { status: 500 });
  }
}
