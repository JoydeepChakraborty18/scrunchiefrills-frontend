import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Missing recipient email." });
  }

  const recipientName = name ? name.trim().split(" ")[0] : "Scrunchiefriller";

  try {
    const data = await resend.emails.send({
      // Until your custom domain DNS (hello@scrunchiefrills.com) is verified in Resend,
      // Resend provides 'onboarding@resend.dev' for instant delivery.
      from: process.env.EMAIL_FROM || "Scrunchiefrills™ <onboarding@resend.dev>",
      reply_to: "hello@scrunchiefrills.com",
      to: [email],
      subject: "Welcome to the Frill Club! 🎀 Your Mane Character Era Starts Now ✨",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Scrunchiefrills</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #FFF5F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #FFE4EE; overflow: hidden; box-shadow: 0 4px 12px rgba(224, 33, 113, 0.08);">
              
              <!-- 🌸 Brand Header Banner -->
              <tr>
                <td align="center" style="padding: 32px 20px 20px; background-color: #FFF0F6; border-bottom: 2px dashed #FFD1E3;">
                  <h1 style="margin: 0; font-family: Georgia, serif; font-style: italic; font-size: 28px; color: #E02171; letter-spacing: -0.5px;">
                    Scrunchiefrills<span style="font-family: sans-serif; font-size: 12px; vertical-align: super; font-style: normal; font-weight: bold;">TM</span>
                  </h1>
                  <p style="margin: 6px 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #888888;">
                    Slay the frill way 💗
                  </p>
                </td>
              </tr>

              <!-- 🎀 Welcome Content Body -->
              <tr>
                <td style="padding: 36px 32px 24px; color: #333333; line-height: 1.6;">
                  <h2 style="margin: 0 0 16px; font-size: 20px; color: #111111; font-weight: 800;">
                    Hey ${recipientName}! 💗
                  </h2>
                  <p style="margin: 0 0 16px; font-size: 14px; color: #555555;">
                    Welcome to the <strong>Frill Club</strong>! We are beyond thrilled to have you join our hair-loving community.
                  </p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #555555;">
                    Here at our Kolkata studio, we believe scrunchies shouldn't just hold your hair—they should make an unapologetic statement. Every cloud-sized scrunchie in our collection is handcrafted with extra volume, premium fabrics, and true <strong>#ManeCharacterEnergy</strong>.
                  </p>

                  <!-- 🛍️ Perks Card -->
                  <div style="background-color: #FFF9FB; border: 1px solid #FFD9E8; border-radius: 16px; padding: 18px; margin-bottom: 24px;">
                    <p style="margin: 0 0 10px; font-size: 12px; font-weight: 900; color: #E02171; text-transform: uppercase; letter-spacing: 1px;">
                      Your Club Privileges:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #444444; line-height: 1.8;">
                      <li><strong>Volume Guaranteed:</strong> Fluffy statement scrunchies that never slip or tug.</li>
                      <li><strong>Multi-Buy Rewards:</strong> Automatic tier savings and surprises on combo stacks.</li>
                      <li><strong>Pan-India Shipping:</strong> Fast, tracked dispatch powered by Delhivery & Shiprocket.</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://scrunchiefrills.com/shop" style="display: inline-block; background-color: #E02171; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 14px 28px; border-radius: 50px; box-shadow: 0 4px 10px rgba(224, 33, 113, 0.25);">
                      Explore The Collection ✨
                    </a>
                  </div>

                  <p style="margin: 24px 0 0; font-size: 13px; color: #666666;">
                    Have styling questions or want to show off your frills? Tag us on Instagram <strong>@scrunchiefrills</strong> or simply reply to this email!
                  </p>

                  <p style="margin: 20px 0 0; font-size: 13px; font-style: italic; color: #E02171; font-weight: bold;">
                    Keep spreading the frills, <br>
                    Team Scrunchiefrills™ 🎀
                  </p>
                </td>
              </tr>

              <!-- 📍 Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: #0A0F1C; color: #888888; font-size: 11px; text-align: center;">
                  <p style="margin: 0 0 6px; color: #FF85B3; font-weight: bold;">
                    SCRUNCHIEFRILLS™ &bull; Handcrafted in Kolkata, West Bengal
                  </p>
                  <p style="margin: 0; color: #666666;">
                    Chaturanga Building, 1st Floor, 39/B/2, Mohit Colony, James Long Sarani, Silpara, Behala, Kolkata 700008
                  </p>
                </td>
              </tr>

            </table>
          </body>
        </html>
      `
    });

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error("Welcome email dispatch failed:", error);
    // Return 200 with error details so client registration is never blocked
    return res.status(200).json({ success: false, error: error.message });
  }
}