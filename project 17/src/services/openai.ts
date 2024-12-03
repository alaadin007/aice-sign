import OpenAI from 'openai';
import { config } from '../config/env';
import type { Assessment, LearningUnit } from '../types/assessment';
import { calculateKIU } from '../utils/kiu';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true
});

async function generateLearningUnit(text: string): Promise<LearningUnit> {
  const kiu = calculateKIU(text);
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  const learningTimeHours = readingTimeMinutes / 12;
  const cpdPoints = Math.ceil(learningTimeHours);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert in educational content analysis. Analyze the provided text and:
        1. Generate a concise, professional title
        2. Create a 2-3 line summary
        3. The academic level has been determined as: ${kiu.level}
        4. Reading time has been calculated as: ${readingTimeMinutes} minutes
        5. KIU has been calculated as: ${kiu.graduatedScore}
        6. CPD points have been calculated as: ${cpdPoints}

        Format response as JSON:
        {
          "title": "Professional, concise title",
          "summary": "2-3 line summary",
          "level": "${kiu.level}",
          "readingTime": ${readingTimeMinutes},
          "kiu": ${kiu.graduatedScore},
          "cpdPoints": ${cpdPoints}
        }`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "");
}

export async function generateAssessment(text: string): Promise<Assessment> {
  try {
    // First, analyze the text for accuracy and generate a learning unit
    const [accuracyResponse, learningUnit] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert fact-checker. Analyze the provided text and determine its accuracy. Focus on identifying any factual errors, inconsistencies, or misleading information. Provide a brief assessment of the text's overall accuracy and reliability."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3
      }),
      generateLearningUnit(text)
    ]);

    // Generate MCQ questions
    const questionsResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert in creating educational assessments. Create 5 multiple-choice questions based on the provided text. Each question should:
          1. Test understanding of key concepts
          2. Have exactly 4 options
          3. Include only one correct answer
          4. Be challenging but fair
          5. Include a brief explanation for the correct answer

          Format the response as a JSON array:
          {
            "questions": [
              {
                "question": "Question text",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctAnswer": 0,
                "explanation": "Why this answer is correct"
              }
            ]
          }`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const accuracy = accuracyResponse.choices[0].message.content || "";
    const { questions } = JSON.parse(questionsResponse.choices[0].message.content || "");

    return {
      questions,
      originalText: text,
      accuracy,
      learningUnit
    };
  } catch (error) {
    console.error('Error generating assessment:', error);
    throw new Error('Failed to generate assessment. Please try again.');
  }
}