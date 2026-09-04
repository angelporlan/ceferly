import { GoogleGenAI } from "@google/genai";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const MODEL_ALIASES = {
    "openrouter-gpt-oss-120b": "openai/gpt-oss-120b",
    "openrouter-deepseek-r1t2-chimera-free": "tngtech/deepseek-r1t2-chimera:free",
    "gemini-flash": "gemini-3.5-flash",
    "gemini-flash-3.5": "gemini-3.5-flash",
    "gemini-3.5": "gemini-3.5-flash"
};

export const resolveAiModel = (model) => MODEL_ALIASES[model] || model;

export const createGeminiCompletion = async ({
    prompt,
    model = process.env.GEMINI_MODEL || "gemini-3.5-flash",
    temperature = 0.4
}) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: resolveAiModel(model),
        contents: prompt,
        config: {
            temperature,
            responseMimeType: "application/json"
        }
    });

    return response.text;
};

export const createOpenRouterChatCompletion = async ({
    model,
    messages,
    temperature = 0.4,
    extraHeaders = {}
}) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost",
            "X-Title": process.env.OPENROUTER_APP_NAME || "ceferly",
            ...extraHeaders
        },
        body: JSON.stringify({
            model: resolveAiModel(model),
            messages,
            temperature
        })
    });

    const payload = await response.text();

    if (!response.ok) {
        throw new Error(
            `OpenRouter request failed with status ${response.status}: ${payload}`
        );
    }

    return JSON.parse(payload);
};
