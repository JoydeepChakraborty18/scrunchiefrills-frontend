import admin from "firebase-admin";

/**
 * 🔐 Robust RSA Private Key Formatter
 * Handles double-escaped newlines, raw strings, and JSON quotes cleanly.
 */
function getFormattedPrivateKey() {
  let key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  // Strip wrapping quotes if present
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }

  // Replace literal '\n' characters with real newlines
  return key.replace(/\\n/g, "\n");
}

// 🛡️ Initialize Firebase Admin SDK safely (Singleton Pattern)
if (!admin.apps.length) {
  try {
    const privateKey = getFormattedPrivateKey();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, "");
    const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, "");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // 🛡️ Verify Secret Token
  const incomingSecret = req.headers["x-sync-secret"];
  const expectedSecret = process.env.SYNC_SECRET_KEY;

  if (!incomingSecret || incomingSecret !== expectedSecret) {
    return res.status(401).json({ error: "Unauthorized: Invalid sync secret token." });
  }

  try {
    const db = admin.firestore();
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "No product payload supplied." });
    }

    const batch = db.batch();

    products.forEach((prod) => {
      const docId = prod.id || prod.sku;
      if (!docId) return;

      const docRef = db.collection("products").doc(docId);

      // Parse arrays safely
      const parsedTags = typeof prod.tags === "string"
        ? prod.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : Array.isArray(prod.tags) ? prod.tags : [];

      const parsedImages = typeof prod.images === "string"
        ? prod.images.split(",").map((img) => img.trim()).filter(Boolean)
        : Array.isArray(prod.images) ? prod.images : [];

      const parsedSimilarIds = typeof prod.similarProductIds === "string"
        ? prod.similarProductIds.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(prod.similarProductIds) ? prod.similarProductIds : [];

      const primaryImage = parsedImages.length > 0
        ? parsedImages[0]
        : prod.image || "/images/ScrunchiefrillsComingSoon1.png";

      const cleanProductData = {
        id: docId,
        sku: prod.sku || docId,
        name: prod.name || "Scrunchie",
        collection: prod.collection || "The Debut Lot",
        fabric: prod.fabric || "Premium Satin",
        sizeTier: prod.sizeTier || "Cloud (XXL)",
        diameter: prod.diameter || '44" * 6.5" approximately',
        elasticStretch: prod.elasticStretch || "Stretches approximately up to 12 inches",
        price: Number(prod.price) || 249,
        compareAtPrice: Number(prod.compareAtPrice) || 315,
        description: prod.description || "",
        washcare: prod.washcare || "",
        tags: parsedTags,
        images: parsedImages,
        image: primaryImage,
        stockCount: Number(prod.stockCount) >= 0 ? Number(prod.stockCount) : 1,
        similarProductIds: parsedSimilarIds,
        starRating: Number(prod.starRating) || 5.0,
        reviews: prod.reviews || [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(docRef, cleanProductData, { merge: true });
    });

    await batch.commit();

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized ${products.length} products to Firestore!`,
    });
  } catch (error) {
    console.error("Firestore Webhook sync execution error:", error);
    return res.status(500).json({ error: error.message });
  }
}