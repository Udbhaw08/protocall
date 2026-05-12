const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const startCheckout = async (plan) => {
    const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Checkout failed. Please try again.");
    }

    const data = await response.json();
    if (!data.url) {
        throw new Error("Checkout session did not return a redirect URL.");
    }

    window.location.href = data.url;
};
