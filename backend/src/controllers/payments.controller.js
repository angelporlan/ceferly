import Stripe from "stripe";
import { User } from "../models/User.js";
import "dotenv/config";

const stripe = new Stripe(process.env.ENV === "PROD" ? process.env.STRIPE_SECRET_KEY_PROD : process.env.STRIPE_SECRET_KEY_TEST);

const getFrontUrl = () => {
    const rawUrl = process.env.ENV === "TEST" ? process.env.URL_FRONT_TEST : process.env.URL_PROD;
    if (!rawUrl) return "http://localhost:4200";
    return rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`;
};

const getBackendUrl = () => {
    const PORT = process.env.ENV === "TEST" ? process.env.PORT_TEST : process.env.PORT_PROD || 4000;
    const URL = process.env.ENV === "TEST" ? process.env.URL_TEST : process.env.URL_PROD || "http://localhost";
    return `${URL}:${PORT}`;
};

const FRONT_URL = getFrontUrl();
const BACKEND_URL = getBackendUrl();
console.log("Stripe Redirect URL Base:", FRONT_URL);
console.log("Backend URL Base:", BACKEND_URL);

export const createSessionPremium = async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Premium Subscription",
                        description: "40 daily AI queries\nIncludes everything in Pro plan\nExclusive content\nPersonalized performance analysis\n1-on-1 tutoring sessions\nOfficial completion certificates",
                        images: [`${BACKEND_URL}/public/images/stripe-image.png`],
                    },
                    unit_amount: 1999,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${FRONT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONT_URL}/cancel`,
        metadata: {
            userId: req.user.id,
            role: "premium",
        },
    });
    return res.json(session);
};

export const createSessionPro = async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: "Pro Subscription",
                        description: "15 daily AI queries\nUnlimited access to all exercises\nAdvanced performance statistics\nFull exam simulations",
                        images: [`${BACKEND_URL}/public/images/stripe-image.png`],
                    },
                    unit_amount: 999,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${FRONT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONT_URL}/cancel`,
        metadata: {
            userId: req.user.id,
            role: "pro",
        },
    });
    return res.json(session);
};

export const verifySession = async (req, res) => {
    console.log("verifySession called with body:", req.body);
    const { sessionId } = req.body;

    if (!sessionId) {
        console.log("No sessionId provided");
        return res.status(400).json({ message: "Session ID is required" });
    }

    try {
        console.log("Retrieving session from Stripe:", sessionId);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log("Session retrieved:", { payment_status: session.payment_status, metadata: session.metadata });

        if (session.payment_status !== "paid") {
            console.log("Payment not completed:", session.payment_status);
            return res.status(400).json({ message: "Payment not completed", status: session.payment_status });
        }

        const { userId, role } = session.metadata;
        console.log("Metadata extracted:", { userId, role });

        if (!userId || !role) {
            console.log("Missing userId or role in metadata");
            return res.status(400).json({ message: "Invalid session metadata" });
        }

        console.log(`Finding user ${userId}...`);
        const user = await User.findByPk(userId);

        if (!user) {
            console.log("User not found:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Updating user ${userId} from role ${user.subscription_role} to ${role}`);
        user.subscription_role = role;
        user.subscription_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();
        console.log("User updated successfully");

        return res.json({ success: true, role });
    } catch (error) {
        console.error("Session verification error:", error.message);
        return res.status(500).json({ message: "Error verifying session" });
    }
};
