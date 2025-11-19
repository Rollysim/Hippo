import { GoogleGenAI, Type, Schema } from "@google/genai";

// We do not create the instance globally to ensure we pick up the key if it changes (though typically static in this env)
// But per instructions, we initialize with process.env.API_KEY

const cardSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A very short, punchy title for the note (max 5 words).",
    },
    summary: {
      type: Type.STRING,
      description: "A single sentence summary of the core concept.",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 key tags or concepts related to this text.",
    },
    question: {
      type: Type.STRING,
      description: "An active recall question that tests the user's understanding of the core concept. Do not make it a Yes/No question.",
    },
  },
  required: ["title", "summary", "keywords", "question"],
};

const weeklySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    highlight: { type: Type.STRING, description: "One short, memorable sentence worth remembering from the provided text context." },
    suggestion: { type: Type.STRING, description: "A one-sentence action item for next week based on the content." },
  },
  required: ["highlight", "suggestion"],
};

export const generateCardMetadata = async (text: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text and extract metadata for a flashcard:\n\n"${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardSchema,
        temperature: 0.3, // Low temperature for consistent extraction
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateWeeklyInsights = async (texts: string[]) => {
   if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Combine texts but limit length to avoid token limits if necessary (though 2.5 flash has large context)
  const combinedContext = texts.slice(0, 20).join("\n---\n");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here are the notes I saved this week. Generate a weekly summary insight:\n\n${combinedContext}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: weeklySchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
     throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini API Error (Weekly):", error);
    return { highlight: "Keep learning!", suggestion: "Review your cards daily." };
  }
}