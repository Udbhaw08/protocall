const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const generateEvaluation = async (config, history) => {
    const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, history }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Analysis request failed. Please try again.");
    }

    return response.json();
};
