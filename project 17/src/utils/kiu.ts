export interface KIUResult {
  materialComplexity: number;
  baselineKnowledge: number;
  graduatedScore: number;
  level: string;
}

export function calculateKIU(text: string): KIUResult {
  // Analyze text complexity to determine education level
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.length / wordCount;
  const sentenceCount = text.split(/[.!?]+/).length;
  const avgSentenceLength = wordCount / sentenceCount;
  
  // Determine education level based on text complexity
  let level: string;
  let materialComplexity: number;
  let baselineKnowledge: number;

  // New KIU values: Middle School = 1 KIU/hour, PhD = 10 KIUs/hour
  if (avgWordLength > 7 && avgSentenceLength > 25) {
    level = "PhD Level";
    materialComplexity = 10; // 10 KIUs/hour
    baselineKnowledge = 0;
  } else if (avgWordLength > 6 && avgSentenceLength > 20) {
    level = "Master's Level";
    materialComplexity = 7; // 7 KIUs/hour
    baselineKnowledge = 0;
  } else if (avgWordLength > 5 && avgSentenceLength > 15) {
    level = "Undergraduate Level";
    materialComplexity = 5; // 5 KIUs/hour
    baselineKnowledge = 0;
  } else if (avgWordLength > 4 && avgSentenceLength > 12) {
    level = "High School Level";
    materialComplexity = 2; // 2 KIUs/hour
    baselineKnowledge = 0;
  } else {
    level = "Middle School Level";
    materialComplexity = 1; // 1 KIU/hour
    baselineKnowledge = 0;
  }

  // Calculate reading time in hours (12 minutes = 1 hour of learning)
  const wordsPerMinute = 200; // Average reading speed
  const readingTimeMinutes = wordCount / wordsPerMinute;
  const learningTimeHours = readingTimeMinutes / 12;

  // Calculate final KIU score
  const graduatedScore = materialComplexity * learningTimeHours;

  return {
    materialComplexity,
    baselineKnowledge,
    graduatedScore: Math.round(graduatedScore * 100) / 100, // Round to 2 decimal places
    level
  };
}