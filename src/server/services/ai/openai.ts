import OpenAI from "openai";
import { z } from "zod";

// Define the expected JSON structure from the AI's response using Zod
const AIResponseSchema = z.object({
  votes: z.array(
    z.object({
      candidateName: z.string(),
      voteCount: z.number(),
    }),
  ),
  tamperingSigns: z.array(z.string()),
  isLegible: z.boolean(),
});

export type DeclarationAnalysisResult = z.infer<typeof AIResponseSchema>;

/**
 * Analyzes a declaration form image using an OpenAI-compatible Vision API.
 *
 * @param {string} imageUrl - The publicly accessible URL of the image to analyze.
 * @returns {Promise<DeclarationAnalysisResult>} - The structured analysis result.
 */
export async function analyzeDeclarationForm(
  imageUrl: string,
): Promise<DeclarationAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set.");
  }

  // Initialize the OpenAI client here to avoid build errors
  // when the environment variable is not set.
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert electoral document analyst. Your task is to analyze an image of a polling station's declaration of results form. Extract the vote count for each candidate listed. Also, identify any potential signs of tampering or irregularities. Respond with a valid JSON object matching this Zod schema: ${JSON.stringify(
            AIResponseSchema.shape,
          )}.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this declaration form.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI response was empty.");
    }

    // Parse and validate the JSON response against our schema
    const parsedResult = AIResponseSchema.parse(JSON.parse(content));
    return parsedResult;
  } catch (error) {
    console.error("Error analyzing declaration form with AI:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`AI response did not match expected schema: ${error.message}`);
    }
    throw new Error("Failed to analyze declaration form.");
  }
}