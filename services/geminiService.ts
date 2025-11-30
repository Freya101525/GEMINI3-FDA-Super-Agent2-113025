import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

export interface AIConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemInstruction?: string;
  responseMimeType?: string;
  provider?: 'gemini' | 'openai';
}

// Helper for OpenAI
const callOpenAI = async (apiKey: string, prompt: string, config: AIConfig): Promise<string> => {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: config.model || "gpt-4o-mini",
                messages: [
                    { role: "system", content: config.systemInstruction || "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ],
                max_tokens: config.maxTokens || 4096,
                temperature: config.temperature ?? 0.7,
                // OpenAI supports JSON mode for newer models if response_format is set
                ...(config.responseMimeType === 'application/json' ? { response_format: { type: "json_object" } } : {})
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`OpenAI API Error: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (error) {
        console.error("OpenAI Execution Error:", error);
        throw error;
    }
};

// Helper for Gemini
const callGemini = async (apiKey: string, prompt: string, config: AIConfig): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        // Default values
        const modelName = config.model || 'gemini-2.5-flash';
        const maxTokens = config.maxTokens || 4096;
        const temperature = config.temperature ?? 0.7;

        const requestConfig: any = {
          maxOutputTokens: maxTokens,
          temperature: temperature,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ]
        };

        if (config.systemInstruction) {
          requestConfig.systemInstruction = config.systemInstruction;
        }

        if (config.responseMimeType) {
            requestConfig.responseMimeType = config.responseMimeType;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: requestConfig
        });
        
        // Check for text existence
        if (response.text) {
            return response.text;
        }

        // Deep dive into candidates if text is missing
        const candidate = response.candidates?.[0];
        if (candidate) {
            if (candidate.finishReason && candidate.finishReason !== 'STOP') {
                throw new Error(`Gemini stopped generation. Reason: ${candidate.finishReason}`);
            }
            // Attempt to grab text from parts if the getter failed
            const part = candidate.content?.parts?.[0];
            if (part?.text) return part.text;
        }

        return "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

export const generateText = async (prompt: string, overrideKey: string | undefined, config: AIConfig): Promise<string> => {
  const provider = config.provider || 'gemini';
  
  // 1. Determine Key
  // If OpenAI, strictly use overrideKey (passed from state) or process.env.OPENAI_API_KEY if we had it.
  // If Gemini, use overrideKey or process.env.API_KEY.
  
  let effectiveKey = overrideKey;
  if (!effectiveKey && provider === 'gemini') {
      effectiveKey = process.env.API_KEY; 
  }

  if (!effectiveKey) {
    throw new Error(`Missing API Key for provider: ${provider}. Please check Settings.`);
  }

  // 2. Route Request
  if (provider === 'openai') {
      return callOpenAI(effectiveKey, prompt, config);
  } else {
      return callGemini(effectiveKey, prompt, config);
  }
};