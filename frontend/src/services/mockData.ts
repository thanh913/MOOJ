import { faker } from '@faker-js/faker';
// Import specific types from the /types directory
import { Problem } from '../types/problem';
import { Submission, SubmissionCreate, SubmissionStatus, ErrorDetail } from '../types/submission';
import { User, UserRole } from '../types/user';

// Helper to create a mock user
const createMockUser = (id: number): User => ({
  id,
  username: faker.internet.userName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement([UserRole.User, UserRole.Moderator, UserRole.Admin]),
  created_at: faker.date.past().toISOString(),
});

// Generate mock problems matching the ../types/problem.ts structure
export const generateMockProblems = (count = 10): Problem[] => {
  const problems: Problem[] = [];
  for (let i = 1; i <= count; i++) {
    const creatorId = faker.number.int({ min: 1, max: 5 });
    problems.push({
      id: i,
      title: faker.lorem.sentence(faker.number.int({ min: 3, max: 7 })).replace('.', ''),
      statement: `# ${faker.lorem.words(3)}\n\n${faker.lorem.paragraph()}\n\n$$ ${faker.lorem.words(5)} $$`,
      difficulty: faker.number.int({ min: 1, max: 90 }) / 10, // Generate 1.0 to 9.0
      topics: faker.helpers.arrayElements(faker.lorem.words(10).split(' '), faker.number.int({ min: 1, max: 4 })),
      is_published: faker.datatype.boolean(0.9), // 90% chance published
      created_at: faker.date.past().toISOString(),
      created_by_id: creatorId,
      creator: createMockUser(creatorId),
    });
  }
  return problems;
};

// Generate mock error details
const generateMockErrors = (): ErrorDetail[] => {
  const count = faker.number.int({ min: 0, max: 3 });
  const errors: ErrorDetail[] = [];
  for (let i = 0; i < count; i++) {
    errors.push({
      id: `mock-err-${faker.string.uuid()}`,
      type: faker.helpers.arrayElement(['logical', 'calculation', 'formatting', 'completeness']),
      location: `Step ${faker.number.int({ min: 1, max: 5 })}`,
      description: faker.lorem.sentence(),
      severity: faker.helpers.arrayElement(['low', 'medium', 'high']),
      status: 'active',
    });
  }
  return errors;
};

// Generate a single mock submission
export const generateMockSubmission = (id: number, problemId?: number): Submission => {
  const status = faker.helpers.arrayElement<SubmissionStatus>([
    SubmissionStatus.Pending, 
    SubmissionStatus.Processing, 
    SubmissionStatus.Completed, 
    SubmissionStatus.EvaluationError,
    SubmissionStatus.Appealing
  ]);
  
  const errors = [
    SubmissionStatus.Completed, 
    SubmissionStatus.EvaluationError, 
    SubmissionStatus.Appealing
  ].includes(status) ? generateMockErrors() : [];
  
  const score = status === SubmissionStatus.Completed ? faker.number.int({ min: 0, max: 100 }) : undefined;
  const feedback = status === SubmissionStatus.Completed ? `# Mock Feedback\n\n${faker.lorem.paragraph()}` : undefined;

  return {
    id: id,
    problem_id: problemId ?? faker.number.int({ min: 1, max: 10 }),
    solution_text: `\\text{Solution attempt } ${id}\n${faker.lorem.paragraph()}\n$$ ${faker.lorem.sentence()} $$`,
    submitted_at: faker.date.past().toISOString(),
    status: status,
    score: score,
    feedback: feedback,
    errors: errors,
    appeal_attempts: status === SubmissionStatus.Appealing ? faker.number.int({ min: 0, max: 4 }) : 0,
  };
};

// Create a new mock submission (simulating API creation response)
let nextSubmissionId = 100; // Start mock IDs high
export const createMockSubmission = (data: SubmissionCreate): Submission => {
  const newId = nextSubmissionId++;
  return {
    id: newId,
    problem_id: data.problem_id,
    solution_text: data.solution_text,
    submitted_at: new Date().toISOString(),
    status: SubmissionStatus.Pending, // Always starts as pending
    score: undefined,
    feedback: undefined,
    errors: [],
    appeal_attempts: 0,
  };
};

// Additional mock data generation functions
export const getRandomProblemTitle = (): string => {
  const titles = [
    'Prove the Pythagorean Theorem',
    'Solve the Quadratic Equation',
    'Find the Derivative',
    'Evaluate the Integral',
    'Prove by Induction',
    'Solve the System of Equations',
    'Find the Maximum Value',
    'Compute the Probability',
    'Prove the Identity',
    'Find the Limit',
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

export const getRandomProblemStatement = (): string => {
  return `This is a sample problem statement. It would typically contain mathematical notation formatted using LaTeX.
  
\\begin{align}
f(x) = x^2 + 2x + 1
\\end{align}

Prove or solve the problem using mathematical reasoning.`;
};

export const getRandomSubset = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 