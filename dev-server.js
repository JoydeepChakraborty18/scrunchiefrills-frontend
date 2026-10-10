import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import checkShippingRateHandler from "./api/check-shipping-rate.js";
import createOrderHandler from "./api/create_order.js";
import verifyPaymentHandler from "./api/verify-razorpay-payment.js";
import createShiprocketOrderHandler from "./api/create_shiprocket_order.js";

const app = express();
app.use(cors());
app.use(express.json());

app.all("/api/check-shipping-rate", (req, res) => checkShippingRateHandler(req, res));
app.all("/api/create_order", (req, res) => createOrderHandler(req, res));
app.all("/api/verify-razorpay-payment", (req, res) => verifyPaymentHandler(req, res));
app.all("/api/create_shiprocket_order", (req, res) => createShiprocketOrderHandler(req, res));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 [LOCAL API] Backend listening at http://localhost:${PORT}`);
});