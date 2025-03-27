import { Problem, Submission, SubmissionData } from '../models/types';

// Generate mock problems for development
export const generateMockProblems = (): Problem[] => [
  {
    id: 1,
    title: 'Prove the Pythagorean Theorem',
    statement: `# Pythagorean Theorem\n\nProve that in a right-angled triangle, the square of the length of the hypotenuse equals the sum of squares of the other two sides.\n\n$$a^2 + b^2 = c^2$$\n\nWhere $a$ and $b$ are the lengths of the legs, and $c$ is the length of the hypotenuse.`,
    difficulty: 3,
    topics: ['Geometry', 'Triangles', 'Algebra'],
    created_at: '2023-01-15T10:30:00Z',
    created_by: 1, // Mock moderator ID
    is_published: true
  },
  {
    id: 2,
    title: 'Prove the Quadratic Formula',
    statement: `# Quadratic Formula\n\nProve that the roots of the quadratic equation $ax^2 + bx + c = 0$ are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`,
    difficulty: 4,
    topics: ['Algebra', 'Equations'],
    created_at: '2023-01-20T14:15:00Z',
    created_by: 1, // Mock moderator ID
    is_published: true
  },
  {
    id: 3,
    title: 'Prove the Fundamental Theorem of Calculus',
    statement: `# Fundamental Theorem of Calculus\n\nProve that if $f$ is continuous on $[a, b]$ and $F$ is an antiderivative of $f$ on $[a, b]$, then:\n\n$$\\int_{a}^{b} f(x) dx = F(b) - F(a)$$`,
    difficulty: 7,
    topics: ['Calculus', 'Integration'],
    created_at: '2023-02-01T09:45:00Z',
    created_by: 2, // Different mock moderator ID
    is_published: true
  },
];

// Generate a mock submission for development
export const generateMockSubmission = (id: number, problemId = 1): Submission => {
  const statuses: Array<'pending' | 'processing' | 'completed' | 'failed'> = ['pending', 'processing', 'completed', 'failed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id,
    problem_id: problemId,
    user_id: 1,
    content_type: 'direct',
    content: 'Let c be the hypotenuse of the right triangle, and a and b be the other two sides. We can construct a square with side length a + b...',
    latex_content: randomStatus === 'completed' ? 'Let $c$ be the hypotenuse of the right triangle, and $a$ and $b$ be the other two sides. We can construct a square with side length $a + b$...' : undefined,
    score: randomStatus === 'completed' ? Math.floor(Math.random() * 100) : undefined,
    feedback: randomStatus === 'completed' ? 'Good attempt, but you need to be more rigorous in steps 3-5.' : undefined,
    status: randomStatus,
    submitted_at: new Date().toISOString(),
  };
};

// Create a mock submission during development
export const createMockSubmission = (data: SubmissionData): Submission => {
  return {
    id: Math.floor(Math.random() * 10000),
    problem_id: data.problem_id,
    user_id: 1,
    content_type: data.content_type,
    content: data.content,
    status: 'pending',
    submitted_at: new Date().toISOString(),
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