export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface LearningUnit {
  title: string;
  summary: string;
  level: string;
  readingTime: number;
  kiu: number;
  cpdPoints: number;
}

export interface Assessment {
  questions: Question[];
  originalText: string;
  accuracy: string;
  learningUnit: LearningUnit;
}