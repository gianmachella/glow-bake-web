import { Resend } from "resend";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validate";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(1),
});

export async function POST(req) {
  const { data, response } = await parseJsonBody(req, contactSchema);
  if (response) return response;
  const { name, email, message } = data;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const text = `
New contact message from Glow Bake

Name: ${name}
Email: ${email}

Message:
${message}
`;

  try {
    await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: "glowbakesosweet@gmail.com",
      subject: "New Contact Message",
      text,
      reply_to: email,
    });

    return new Response("Message sent", { status: 200 });
  } catch (error) {
    console.error("Resend error:", error);
    return new Response("Email error", { status: 500 });
  }
}
