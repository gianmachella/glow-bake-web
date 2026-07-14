// app/api/send-order/route.js
import { Resend } from "resend";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validate";
import { apiError } from "@/lib/apiResponse";
import { computeLineItems } from "@/lib/discounts";
import { startOfDay } from "@/lib/dateWindow";

const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  flavors: z.record(z.string(), z.number()).optional(),
});

const orderSchema = z.object({
  name: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  address: z.string().trim().optional(),
  deliveryMethod: z.enum(["Pickup", "Delivery"]),
  deliveryDay: z.string().min(1),
  notes: z.string().optional(),
  total: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative().optional().default(0),
  items: z.array(orderItemSchema).min(1),
});

export async function POST(req) {
  try {
    const { data, response } = await parseJsonBody(req, orderSchema);
    if (response) return response;
    const {
      name,
      lastName,
      email,
      phone,
      address,
      deliveryMethod,
      deliveryDay,
      notes,
      items,
      deliveryFee,
    } = data;

    // 🔒 Recompute prices/total from the database — never trust client-submitted
    // per-item price, so automatic cookie discounts (and the base price) can't be spoofed.
    const cookieIds = items.map((item) => item.id);
    const cookies = await prisma.cookie.findMany({
      where: { id: { in: cookieIds } },
    });
    const cookieById = new Map(cookies.map((c) => [c.id, c]));

    const missingIds = cookieIds.filter((id) => !cookieById.has(id));
    if (missingIds.length > 0) {
      return apiError("One or more items in your cart are no longer available", 400);
    }

    const now = new Date();
    const activeAutoDiscounts = await prisma.autoDiscount.findMany({
      where: {
        cookieId: { in: cookieIds },
        active: true,
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: startOfDay(now) } }] }],
      },
    });
    const discountsByCookieId = activeAutoDiscounts.reduce((acc, d) => {
      (acc[d.cookieId] ||= []).push(d);
      return acc;
    }, {});

    // 🎁 Automatically apply active web promotions (fixed or volume/bulk) —
    // recomputed server-side from the DB, same as auto-discounts, so nothing
    // client-submitted is trusted.
    const activeWebPromotions = await prisma.webPromotion.findMany({
      where: {
        active: true,
        OR: [{ cookieId: null }, { cookieId: { in: cookieIds } }],
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: startOfDay(now) } }] },
        ],
      },
    });
    const globalDiscounts = [];
    for (const wp of activeWebPromotions) {
      if (wp.cookieId) {
        (discountsByCookieId[wp.cookieId] ||= []).push(wp);
      } else {
        globalDiscounts.push(wp); // no cookieId = applies to every cookie
      }
    }

    const { items: computedItems, subtotal } = computeLineItems(
      items.map((item) => ({ ...item, price: cookieById.get(item.id).price })),
      discountsByCookieId,
      globalDiscounts,
      now
    );

    const total = subtotal;

    // 1️⃣ Crear o conectar cliente, crear venta con items.
    const sale = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email },
        update: { name, lastName, phone, address },
        create: { name, lastName, email, phone, address },
      });

      const newSale = await tx.sale.create({
        data: {
          customer: { connect: { id: customer.id } },
          total: total + (deliveryMethod === "Delivery" ? deliveryFee : 0),
          deliveryDay, // 👈 ahora sí es válido
          deliveryMethod,
          items: {
            create: computedItems.map((item) => ({
              cookieId: item.id,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: { cookie: true },
          },
        },
      });

      return newSale;
    });

    // 📧 Emails
    const resend = new Resend(process.env.RESEND_API_KEY);

    const itemList = computedItems
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
                  <strong>${item.quantity}</strong> x ${item.name} - $${item.unitPrice.toFixed(2)}
                  ${flavorList}
                </li>`;
      })
      .join("");

    const deliveryItem =
      deliveryMethod === "Delivery"
        ? `<li style="margin-bottom: 10px; font-weight: bold; color: #d63384;">
             Delivery Fee - $${deliveryFee.toFixed(2)}
           </li>`
        : "";

    const grandTotal =
      total + (deliveryMethod === "Delivery" ? deliveryFee : 0);

    // 📧 Cliente
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
        <p><strong>${deliveryMethod} Day:</strong> ${deliveryDay}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
        <h3>Your Order:</h3>
        <ul>
          ${itemList}
          ${deliveryItem}
        </ul>
        <p style="font-size: 22px; font-weight: bold; margin-top: 15px; color: #000;">
          Total: $${grandTotal.toFixed(2)}
        </p>
        ${
          deliveryMethod === "Delivery"
            ? `<p style="margin-top: 15px; color: #d63384;">
                🚚 Remember, deliveries are made on the selected day starting at 4:30 pm.<br/>
                The exact delivery time will depend on the number of orders that day and the distance.
               </p>`
            : ""
        }
        <hr />
        <p>Please send your payment to:</p>
        <p><strong>Zelle:</strong> 945-400-5808</p>
        <p><strong>Venmo:</strong> NO MORE </p>
        <p style="font-weight: bold; color: #d63384;">Thank you for choosing Glow Bake!</p>
      </div>
    `;

    // 📧 Owner
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
${computedItems
  .map((item) => {
    const flavors =
      item.flavors && Object.keys(item.flavors).length > 0
        ? Object.entries(item.flavors)
            .filter(([_, qty]) => qty > 0)
            .map(([flavor, qty]) => `    - ${flavor}: ${qty}`)
            .join("\n")
        : "";
    return `- ${item.quantity} x ${item.name} ($${item.unitPrice.toFixed(2)})${
      flavors ? "\n" + flavors : ""
    }`;
  })
  .join("\n")}
${deliveryMethod === "Delivery" ? `- Delivery Fee: $${deliveryFee.toFixed(2)}` : ""}
Total: $${grandTotal.toFixed(2)}
`;

    const { error: customerEmailError } = await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: email,
      subject: "Your Glow Bake Order Confirmation",
      html: htmlMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });
    if (customerEmailError) {
      console.error("Resend error (customer email):", { name: customerEmailError.name, message: customerEmailError.message, statusCode: customerEmailError.statusCode });
    }

    const { error: ownerEmailError } = await resend.emails.send({
      from: "Glow Bake <hello@glowbake.com>",
      to: "glowbakesosweet@gmail.com",
      subject: `📦 New Order Received - ${name} `,
      text: ownerMessage,
      reply_to: "glowbakesosweet@gmail.com",
    });
    if (ownerEmailError) {
      console.error("Resend error (owner email):", { name: ownerEmailError.name, message: ownerEmailError.message, statusCode: ownerEmailError.statusCode });
    }

    return new Response(JSON.stringify(sale), { status: 200 });
  } catch (err) {
    console.error("❌ Error processing order:", err);
    return new Response("Error processing order", { status: 500 });
  }
}
