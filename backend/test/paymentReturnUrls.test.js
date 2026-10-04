import test from "node:test";
import assert from "node:assert/strict";
import { getStripeCheckoutReturnUrls } from "../src/services/paymentReturnUrls.js";

test("Stripe checkout returns to the React success and cancel routes", () => {
    assert.deepEqual(getStripeCheckoutReturnUrls("https://ceferly.test/"), {
        success_url: "https://ceferly.test/payment/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://ceferly.test/payment/cancel"
    });
});

test("Stripe checkout return URLs preserve a configured base path", () => {
    assert.deepEqual(getStripeCheckoutReturnUrls("https://ceferly.test/app/"), {
        success_url: "https://ceferly.test/app/payment/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://ceferly.test/app/payment/cancel"
    });
});
