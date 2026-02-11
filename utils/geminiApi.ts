/**
 * Gemini API Utility - Direct fetch-based integration
 * Supports: Chat, TTS, Translation (K'iche'), and Image Generation
 * API Key is stored/read from AsyncStorage so users can configure it in Settings.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ayuda_gt_gemini_api_key';

const SYSTEM_PROMPT = `Eres un asistente de Ayuda Niños GT. Tu objetivo es ayudar a niños y personas en Guatemala. 
Solo debes responder preguntas relacionadas con servicios de emergencia, ayuda, salud, seguridad o información general DENTRO de Guatemala. 
Si te preguntan algo fuera de este contexto o de otro país, declina amablemente diciendo que tu propósito es ayudar específicamente en Guatemala.
Mantén un tono calmado, empático y directo.

REGLAS DE FORMATO ESTRICTAS:
1. Usa "###" para títulos de secciones.
2. Cada elemento de una lista (1., 2., o *) DEBE ir en una LÍNEA NUEVA separada.
3. Usa negritas (**texto**) solo para palabras clave o números de teléfono.
4. NUNCA escribas una lista seguida en la misma línea (ej. NO hagas: "1. A 2. B").`;

export type Message = {
    role: 'user' | 'model';
    text: string;
    image?: string;
    isSystem?: boolean;
};

// --- API Key Management ---
export const saveApiKey = async (key: string): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEY, key);
};

export const getApiKey = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(STORAGE_KEY);
};

export const removeApiKey = async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEY);
};

// --- Chat ---
export const sendMessageToGemini = async (prompt: string, history: Message[] = []): Promise<string> => {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) {
            return "⚠️ No hay API Key configurada. Ve a Ajustes para agregar tu clave de Gemini.";
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                        { role: "user", parts: [{ text: prompt }] }
                    ]
                })
            }
        );

        const data = await response.json();
        if (data.error) {
            return `⚠️ Error de API: ${data.error.message || 'Verifica tu API Key en Ajustes.'}`;
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar eso. Intenta de nuevo.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Lo siento, hubo un error de conexión. Verifica tu internet.";
    }
};

// --- Translation ---
export const translateText = async (text: string, language: string): Promise<string> => {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) return "⚠️ API Key no configurada.";

        const cleanText = text.replace(/\*/g, '').replace(/#/g, '');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Traduce solo las instrucciones clave de este texto al idioma ${language} de Guatemala. Usa formato limpio y listas: ${cleanText}` }] }]
                })
            }
        );

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo traducir.";
    } catch (error) {
        console.error("Translation Error:", error);
        return "Error al traducir.";
    }
};

// --- Image Generation ---
export const generateImage = async (context: string): Promise<string | null> => {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) return null;

        const cleanContext = context.replace(/\*/g, '').replace(/#/g, '');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: `Simple educational medical illustration for children: ${cleanContext}. Clean, safe, non-scary, white background, minimal vector style.` }],
                    parameters: { sampleCount: 1 }
                })
            }
        );

        const data = await response.json();
        const base64 = data.predictions?.[0]?.bytesBase64Encoded;
        return base64 ? `data:image/png;base64,${base64}` : null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
};

// --- TTS ---
export const generateTTS = async (text: string): Promise<string | null> => {
    try {
        const apiKey = await getApiKey();
        if (!apiKey) return null;

        const cleanText = text.replace(/\*/g, '').replace(/#/g, '');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Say calmly and supportively in Spanish: ${cleanText}` }] }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
                    }
                })
            }
        );

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
        console.error("TTS Error:", error);
        return null;
    }
};
