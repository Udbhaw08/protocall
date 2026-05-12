import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 3001;
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Only allow requests from the frontend origin
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Server misconfigured: missing STRIPE_SECRET_KEY" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === "whsec_replace_me") {
    return res.status(500).json({ error: "Server misconfigured: missing STRIPE_WEBHOOK_SECRET" });
  }

  const signature = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        console.log(`Stripe event received: ${event.type}`);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json());

// 20 analysis requests per IP per hour — enough for real users, blocks abuse
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again in an hour." },
});
app.use("/api/", limiter);

// Health check — Railway/Render needs this to confirm the server started
app.get("/health", (_req, res) => res.json({ ok: true }));

const stripePrices = {
  plus: process.env.STRIPE_PLUS_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
};

app.post("/api/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Server misconfigured: missing STRIPE_SECRET_KEY" });
  }

  const { plan } = req.body;
  const priceId = stripePrices[plan];
  if (!priceId || priceId === "price_replace_me") {
    return res.status(400).json({
      error: "Invalid or unconfigured plan. Add the Stripe price ID, not product ID, to server/.env.",
    });
  }

  const appUrl = process.env.APP_URL || "http://localhost:5173";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}?checkout=success`,
      cancel_url: `${appUrl}?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    res.status(500).json({ error: "Could not create checkout session" });
  }
});

app.post("/api/analyze", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured: missing GEMINI_API_KEY" });
  }

  const { config, history } = req.body;
  if (!config || !history) {
    return res.status(400).json({ error: "Missing config or history in request body" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const transcript = history
      .map((h) => `${h.role === "user" ? "Candidate" : "Interviewer"}: ${h.text}`)
      .join("\n");

    const prompt = `
    Analyze the following mock interview transcript for a ${config.difficulty} ${config.role} position.
    The focus areas were: ${config.focus.join(", ")}.

    TRANSCRIPT:
    ${transcript}

    Evaluate the candidate on a scale of 1-100 for Clarity, Confidence, and Communication.
    Also provide overall score, technical knowledge assessment, strengths, weaknesses, and concrete recommendations.
  `;

    const response = await ai.models.generateContent({
      model: process.env.ANALYSIS_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            clarity: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            communication: { type: Type.NUMBER },
            technicalKnowledge: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "overallScore", "clarity", "confidence", "communication",
            "technicalKnowledge", "strengths", "weaknesses", "recommendations",
          ],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ ...data, transcript });
  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

app.listen(PORT, () => console.log(`Protocall proxy running on port ${PORT}`));
