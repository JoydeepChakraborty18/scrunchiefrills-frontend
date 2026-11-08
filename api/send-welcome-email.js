import { Resend } from "resend";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default async function handler(reqOrEvent, resOrContext) {
  const isExpress = typeof resOrContext?.status === "function";
  const isWebStandard = typeof Response !== "undefined";

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const sendResponse = (statusCode, payload) => {
    if (isExpress) return resOrContext.status(statusCode).json(payload);
    if (isWebStandard) {
      return new Response(JSON.stringify(payload), {
        status: statusCode,
        headers: corsHeaders,
      });
    }
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  };

  const method = reqOrEvent?.method || reqOrEvent?.httpMethod || "POST";

  if (method === "OPTIONS") {
    return sendResponse(200, {});
  }

  if (method !== "POST") {
    return sendResponse(405, { error: "Method Not Allowed" });
  }

  let body = {};
  try {
    if (typeof reqOrEvent?.json === "function") {
      body = await reqOrEvent.json();
    } else if (typeof reqOrEvent?.body === "string") {
      body = JSON.parse(reqOrEvent.body);
    } else if (reqOrEvent?.body) {
      body = reqOrEvent.body;
    }
  } catch {
    return sendResponse(400, { error: "Malformed request payload." });
  }

  const { email, name } = body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendResponse(400, { error: "A valid email address is required." });
  }

  const rawResendKey = process.env.RESEND_API_KEY;
  const resendApiKey = rawResendKey ? rawResendKey.replace(/["'\s]/g, "").trim() : "";

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping welcome email.");
    return sendResponse(200, {
      success: false,
      message: "Email service unconfigured; registration was unaffected.",
    });
  }

  const resend = new Resend(resendApiKey);
  const rawEmailFrom = process.env.EMAIL_FROM;
  const fromEmail = rawEmailFrom.replace(/["']/g, "").trim();

  const firstName = name ? name.split(" ")[0] : "Scrunchiefriller";
  
  // Publicly hosted URL of the Bestseller background image
  const backgroundImageUrl = "https://scrunchiefrills.com/images/SFBestsellers.png";

  const welcomeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to the Frill Club!</title>
    </head>
    <body style="margin:0; padding:0; background-color:#FFF5F8; background-image:url('${backgroundImageUrl}'); background-repeat:repeat; background-position:center top; background-size:auto; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#2D2D2D;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" background="${backgroundImageUrl}" style="background-color:#FFF5F8; background-image:url('${backgroundImageUrl}'); background-repeat:repeat; background-position:center top; padding:36px 16px;">
        <tr>
          <td align="center">
            <!-- Central Card Wrapper (Solid white background for crisp legibility) -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px; background-color:#FFFFFF; border:3px solid #111111; border-radius:28px; box-shadow:8px 8px 0px #E02171; overflow:hidden;">
              
              <!-- Brand Header Banner -->
              <tr>
                <td align="center" style="background-color:#FFF0F6; border-bottom:3px solid #111111; padding:32px 20px;">
                  <span style="font-size:36px; line-height:1;">🎀</span>
                  <h1 style="margin:12px 0 0; font-size:26px; font-weight:900; color:#E02171; text-transform:uppercase; letter-spacing:1.5px;">
                    Scrunchiefrills™
                  </h1>
                  <p style="margin:6px 0 0; font-size:11px; font-weight:800; color:#444444; text-transform:uppercase; letter-spacing:2px;">
                    Slay The Frill Way ✨
                  </p>
                </td>
              </tr>

              <!-- Main Content Body -->
              <tr>
                <td style="padding:36px 30px 24px;">
                  <h2 style="margin:0 0 14px; font-size:20px; font-weight:900; color:#111111;">
                    Hey ${firstName}! 💖
                  </h2>
                  <p style="margin:0 0 14px; font-size:13px; line-height:1.7; color:#4A4A4A; font-weight:500;">
                    Welcome to <strong>Scrunchiefrills™</strong>! You are officially part of our inner circle of volume lovers and statement hair stylists.
                  </p>
                  <p style="margin:0 0 20px; font-size:13px; line-height:1.7; color:#4A4A4A; font-weight:500;">
                    Every single scrunchie is handcrafted in our Kolkata studio using ultra-luxe, snag-free satin and zero-pull elastics designed for genuine <strong>#ManeCharacterEnergy</strong>.
                  </p>

                  <!-- Value Proposition Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFF9FB; border:2px dashed #E02171; border-radius:18px; margin:22px 0; padding:18px;">
                    <tr>
                      <td style="padding:7px 0; font-size:12px; color:#222222; font-weight:600; line-height:1.5;">
                        🛍️ <strong style="color:#111111;">Debut Lot Privilege:</strong> Enjoy promotional launch pricing across all our signature handmade pieces.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0; font-size:12px; color:#222222; font-weight:600; line-height:1.5;">
                        🎮 <strong style="color:#111111;">Arcade Rewards:</strong> Play Cyclone inside your profile workspace to unlock exclusive tier discounts.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:7px 0; font-size:12px; color:#222222; font-weight:600; line-height:1.5;">
                        🚚 <strong style="color:#111111;">Reliable Pan-India Delivery:</strong> Fast courier dispatch via Shiprocket (Free shipping on WB orders ₹999+ / National ₹1999+).
                      </td>
                    </tr>
                  </table>

                  <!-- Primary CTA Button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0 12px;">
                    <tr>
                      <td align="center">
                        <a href="https://scrunchiefrills.com/shop" style="display:inline-block; background-color:#E02171; color:#FFFFFF; text-decoration:none; font-size:13px; font-weight:900; text-transform:uppercase; letter-spacing:1px; padding:15px 36px; border-radius:16px; border:2px solid #111111; box-shadow:3px 3px 0px #111111;">
                          Explore The Collection 🎀
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Social & Community Strip -->
              <tr>
                <td style="background-color:#FFF0F6; border-top:2px dashed #FFD1E3; padding:14px 24px; text-align:center;">
                  <p style="margin:0; font-size:11px; font-weight:700; color:#E02171;">
                    Tag us in your styling videos <a href="https://www.instagram.com/scrunchiefrills" style="color:#111111; text-decoration:underline;">@scrunchiefrills</a> — we’d love to see your looks! 📸
                  </p>
                </td>
              </tr>

              <!-- Footer Details -->
              <tr>
                <td style="background-color:#FAFAFA; border-top:2px solid #EEEEEE; padding:22px 24px; text-align:center;">
                  <p style="margin:0 0 6px; font-size:11px; font-weight:700; color:#666666;">
                    Scrunchiefrills™ Studio & Fulfillment Warehouse • Behala, Kolkata 700008, West Bengal
                  </p>
                  <p style="margin:0; font-size:10px; color:#999999;">
                    Have questions? Chat with our studio team at <a href="mailto:hello@scrunchiefrills.com" style="color:#E02171; text-decoration:none; font-weight:700;">hello@scrunchiefrills.com</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Welcome to the Frill Club! 🎀 Your Mane Character Era Starts Now ✨",
      html: welcomeHtml,
    });

    if (error) {
      console.error("Resend API Delivery Error:", error);
      return sendResponse(502, { error: error.message });
    }

    return sendResponse(200, {
      success: true,
      id: data?.id,
      message: "Welcome email delivered successfully.",
    });
  } catch (err) {
    console.error("Failed to execute send-welcome-email:", err);
    return sendResponse(500, { error: err.message || "Failed to dispatch email." });
  }
}