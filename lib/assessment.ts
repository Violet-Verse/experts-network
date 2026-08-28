// Correct answers live only here, a lib/ file imported exclusively by
// api/*.ts (server-side). Never import this from src/ — that would bundle
// the answer key into the client JS.

export interface AssessmentQuestion {
  id: string;
  type: "multiple_choice" | "true_false";
  question: string;
  choices: string[];
  correctIndex: number;
}

export interface PublicAssessmentQuestion {
  id: string;
  type: "multiple_choice" | "true_false";
  question: string;
  choices: string[];
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    type: "multiple_choice",
    question: 'What is a "prompt" in the context of AI models?',
    choices: [
      "The instructions or input text you give an AI model to generate a response",
      "A type of computer chip used to run AI",
      "An error message the AI produces",
      "The AI's internal training log",
    ],
    correctIndex: 0,
  },
  {
    id: "q2",
    type: "true_false",
    question:
      "True or False: AI models are explicitly programmed with a rule for every possible question they might be asked.",
    choices: ["True", "False"],
    correctIndex: 1,
  },
  {
    id: "q3",
    type: "multiple_choice",
    question: "Which best describes how large language models learn?",
    choices: [
      "By memorizing a fixed lookup table of question-answer pairs",
      "By finding statistical patterns in large amounts of text during training",
      "By connecting to the internet in real time to look up every answer",
      "By asking a human for the correct answer during every conversation",
    ],
    correctIndex: 1,
  },
  {
    id: "q4",
    type: "true_false",
    question:
      'True or False: "Hallucination" in AI refers to the model generating confident-sounding but false or fabricated information.',
    choices: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "q5",
    type: "multiple_choice",
    question: 'What does "fine-tuning" mean?',
    choices: [
      "Increasing the size of the model's training dataset only",
      "Further training an existing pretrained model on a narrower, specific dataset to specialize its behavior",
      "Manually rewriting the model's code line by line",
      "Turning off certain features of the AI to make it faster",
    ],
    correctIndex: 1,
  },
  {
    id: "q6",
    type: "true_false",
    question:
      "True or False: A larger number of parameters always guarantees a model performs better at every real-world task.",
    choices: ["True", "False"],
    correctIndex: 1,
  },
  {
    id: "q7",
    type: "multiple_choice",
    question: "What does RLHF stand for?",
    choices: [
      "Random Language Heuristic Function",
      "Reinforcement Learning from Human Feedback",
      "Rapid Learning for Hardware Frameworks",
      "Recursive Loop for High Frequency",
    ],
    correctIndex: 1,
  },
  {
    id: "q8",
    type: "true_false",
    question:
      "True or False: By default, a base language model does not have live access to the internet unless it's specifically connected to a tool that provides it.",
    choices: ["True", "False"],
    correctIndex: 0,
  },
  {
    id: "q9",
    type: "multiple_choice",
    question: "What is one common way researchers try to reduce bias in an AI model's outputs?",
    choices: [
      "Ignoring the training data entirely",
      "Curating and diversifying training data, plus human review of outputs",
      "Making the model bigger with more parameters",
      "Removing all human feedback from the process",
    ],
    correctIndex: 1,
  },
  {
    id: "q10",
    type: "multiple_choice",
    question: 'What is "training data"?',
    choices: [
      "The set of examples an AI model learns patterns from before it's deployed",
      "A log of every conversation the AI has ever had with users",
      "The physical servers that run the AI model",
      "A password required to access the AI model",
    ],
    correctIndex: 0,
  },
];

export const PASSING_SCORE = 7;

export function getPublicQuestions(): PublicAssessmentQuestion[] {
  return ASSESSMENT_QUESTIONS.map(({ id, type, question, choices }) => ({
    id,
    type,
    question,
    choices,
  }));
}

export function gradeAnswers(answers: Record<string, number>): { score: number; total: number } {
  let score = 0;
  for (const q of ASSESSMENT_QUESTIONS) {
    if (answers[q.id] === q.correctIndex) score += 1;
  }
  return { score, total: ASSESSMENT_QUESTIONS.length };
}
