import { aiService } from "./ai.service";
import { DbModule, DbTranscript } from "../../data/database";

export interface LessonChatInput {
  module: DbModule;
  transcripts: DbTranscript[];
  userMessage: string;
  chatHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
}

export interface LessonChatOutput {
  answer: string;
  relatedConcept: string;
}

export class LessonChatService {
  async respondToQuestion(input: LessonChatInput): Promise<LessonChatOutput> {
    const transcriptText = input.transcripts
      .map(t => `[${t.timestamp}] (${t.concept}): ${t.content}`)
      .join("\n");

    const prompt = `You are PathAI's AI Teaching Assistant embedded inside the lesson "${input.module.title}".
Category: ${input.module.category}
Key Concepts: ${input.module.concepts.join(", ")}

LESSON TRANSCRIPT:
${transcriptText}

STUDENT QUESTION:
"${input.userMessage}"

INSTRUCTIONS:
1. Answer clearly, accurately, and concisely (2-4 sentences).
2. Root your answer directly in the concepts taught in this lesson.
3. Identify the most relevant concept from the lesson.
4. Output ONLY valid JSON:
{
  "answer": "Your concise, insightful explanation...",
  "relatedConcept": "Exact concept name"
}`;

    const fallback: LessonChatOutput = {
      answer: `In this lesson on ${input.module.title}, we focus on ${input.module.concepts.join(", ")}. In Python, checking 'num % 2 == 0' ensures that only numbers cleanly divisible by 2 with remainder 0 are treated as even numbers before accumulating.`,
      relatedConcept: input.module.concepts[0] || "Conditional Iteration"
    };

    return await aiService.generateJSON<LessonChatOutput>(prompt, fallback);
  }
}

export const lessonChatService = new LessonChatService();
