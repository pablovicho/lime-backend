import OpenAI, { toFile } from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export interface NoteGenerationResult {
  summary: string;
  clinicalNote: string;
}

// OpenAI Whisper API
export async function transcribeAudio(
  audioFilePath: string
): Promise<TranscriptionResult> {
  try {
    const fileBuffer = await fs.promises.readFile(audioFilePath);
    const fileName = audioFilePath.split('/').pop() || 'audio.mp3';
    
    const file = await toFile(fileBuffer, fileName);

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    return {
      text: transcription.text,
      duration: transcription.duration,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// Summary
export async function generateClinicalNote(
  transcribedText: string
): Promise<NoteGenerationResult> {
  try {
    const prompt = `You are a medical scribe assistant. Given the following transcribed audio from a healthcare consultation, create a structured clinical note.

Transcribed Text:
${transcribedText}

Please provide:
1. A brief summary (2-3 sentences)
2. A detailed clinical note in SOAP format (Subjective, Objective, Assessment, Plan) if applicable, or a well-structured narrative note.

Format your response as JSON with the following structure:
{
  "summary": "Brief summary here",
  "clinicalNote": "Detailed clinical note here"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional medical scribe. Generate accurate, concise clinical documentation.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(responseContent);

    return {
      summary: result.summary || "No summary generated",
      clinicalNote: result.clinicalNote || result.clinical_note || transcribedText,
    };
  } catch (error) {
    console.error("Note generation error:", error);
    throw new Error("Failed to generate clinical note");
  }
}

export async function processAudioNote(audioFilePath: string): Promise<{
  transcription: TranscriptionResult;
  note: NoteGenerationResult;
}> {
  // Use both services, transcribe and summarize
  const transcription = await transcribeAudio(audioFilePath);
  const note = await generateClinicalNote(transcription.text);

  return {
    transcription,
    note,
  };
}
