export const getStripeCheckoutReturnUrls = (frontUrl) => {
    const baseUrl = String(frontUrl).replace(/\/+$/, "");

    return {
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`
    };
};
