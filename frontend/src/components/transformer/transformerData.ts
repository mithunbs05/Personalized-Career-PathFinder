export type LearningMode = 'video' | 'coding';
export type MasteryLevel = 'Novice' | 'Developing' | 'Proficient' | 'Mastered';
export type ChallengeDifficulty = 'Beginner' | 'Guided Challenge' | 'Standard Challenge' | 'Advanced Challenge';

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number; // seconds
  duration: number;  // seconds
  transcript: string;
  codeDemo?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
  isHidden?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  problemStatement: string;
  instructions: string[];
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation: string }>;
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  hints: string[];
  concepts: string[];
}

export interface TransformerModule {
  id: string;
  stageId: number;
  stageTitle: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  objectives: string[];
  keyTakeaways: string[];
  chapters: VideoChapter[];
  challenge: CodingChallenge;
  tags: string[];
  initialConceptScore: number;
  initialPracticeScore: number;
  initialTestsPassed: number;
  initialTotalTests: number;
  initialMastery: MasteryLevel;
  initialRecommendation: string;
}

export interface LearnerProgress {
  moduleId: string;
  videoWatchedPercent: number;
  currentChapterIndex: number;
  videoTimePosition: number;
  writtenCode: string;
  testResults: Record<string, 'pass' | 'fail' | 'pending'>;
  hintsUsed: number;
  attempts: number;
  masteryLevel: MasteryLevel;
  conceptScore: number;
  practiceScore: number;
  testsPassed: number;
  totalTests: number;
  recommendation: string;
  currentDifficulty: ChallengeDifficulty;
  lastMode: LearningMode;
}

export const TRANSFORMER_MODULES: TransformerModule[] = [
  {
    id: 'mod-py-loops',
    stageId: 2,
    stageTitle: 'Python for AI',
    title: 'Python Loops & Iteration Patterns (Core Python)',
    subtitle: 'Master the mechanics of for-loops, iterators, conditional accumulation, and list comprehension in Python.',
    description: 'Master the mechanics of for-loops, iterators, conditional accumulation, and list comprehension in Python — foundational tools for AI data pipelines.',
    duration: '25 mins',
    initialConceptScore: 100,
    initialPracticeScore: 60,
    initialTestsPassed: 3,
    initialTotalTests: 5,
    initialMastery: 'Developing',
    initialRecommendation: 'You understand Python loops conceptually, but your edge-case accuracy is still developing. Recommended: Try one more guided challenge before moving to nested loops.',
    objectives: [
      'Master for-loops and sequence iteration in Python',
      'Implement conditional filtering inside loops (even/odd checks)',
      'Apply accumulation variables and accumulator patterns',
      'Optimize loops using list comprehensions and generators'
    ],
    keyTakeaways: [
      'Iteration is the bedrock of dataset parsing, batching, and tensor transformations in AI',
      'The modulo operator (x % 2 == 0) allows precise conditional filtering',
      'List comprehensions offer faster execution and cleaner syntax than manual append loops'
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'Core Mechanics of For-Loops',
        startTime: 0,
        duration: 150,
        transcript: 'Welcome to this module on Python loops. Unlike traditional C-style loops with counter increments, Python treats loops as first-class sequence traversals.',
        codeDemo: `# Basic accumulation loop\nnumbers = [1, 2, 3, 4, 5, 6]\neven_sum = 0\n\nfor num in numbers:\n    if num % 2 == 0:\n        even_sum += num\n\nprint(f"Sum of evens: {even_sum}")  # 12`
      },
      {
        id: 'ch2',
        title: 'Conditional Filtering & Predicates',
        startTime: 150,
        duration: 200,
        transcript: "When filtering data during iteration, we test each item against a predicate. For instance, testing for even numbers using 'num % 2 == 0'.",
        codeDemo: `# Handling edge cases\ndef sum_even_numbers(numbers):\n    if not numbers:\n        return 0\n    total = 0\n    for n in numbers:\n        if n % 2 == 0:\n            total += n\n    return total\n\nprint(sum_even_numbers([]))           # 0\nprint(sum_even_numbers([1, 3, 5]))     # 0\nprint(sum_even_numbers([-2, -4, 3]))   # -6`
      },
      {
        id: 'ch3',
        title: 'The Accumulator Pattern',
        startTime: 350,
        duration: 190,
        transcript: 'Notice the accumulator pattern: initialize your result sum before entering the loop, then accumulate only matching values.',
        codeDemo: `# Pythonic comprehension one-liner\ndef sum_even_comprehension(numbers):\n    return sum([n for n in numbers if n % 2 == 0])\n\nprint(sum_even_comprehension([10, 15, 20, 25]))  # 30`
      },
      {
        id: 'ch4',
        title: 'Summary & Transition to Practice',
        startTime: 540,
        duration: 180,
        transcript: "Now, let's transition straight into the interactive coding challenge to write this logic and verify all edge cases!",
        codeDemo: `def sum_even_numbers(numbers):\n    return sum(n for n in numbers if n % 2 == 0)`
      }
    ],
    challenge: {
      id: 'chal-py-even-sum',
      title: 'Sum of Even Numbers in a List',
      difficulty: 'Guided Challenge',
      problemStatement: 'Write a Python function called `sum_even_numbers(numbers)` that iterates through a list of numbers and calculates the sum of all even numbers.',
      instructions: [
        'Iterate through the `numbers` list',
        'Check if each number is even using `num % 2 == 0`',
        'Accumulate all even numbers into a running sum',
        'Return the total sum (return 0 if the list is empty or contains no even numbers)'
      ],
      constraints: [
        'Input `numbers` can be empty: `[]` -> return `0`',
        'Can contain negative even numbers (e.g. `-2`, `-4`)',
        'Must handle lists with zero values correctly (`0 % 2 == 0` is `True`)',
        'Time complexity should be O(n)'
      ],
      examples: [
        {
          input: 'numbers = [1, 2, 3, 4, 5, 6]',
          output: '12',
          explanation: 'Even numbers are 2, 4, 6. Sum = 2 + 4 + 6 = 12.'
        },
        {
          input: 'numbers = [1, 3, 5]',
          output: '0',
          explanation: 'No even numbers present, return 0.'
        },
        {
          input: 'numbers = [-2, 4, -6, 7]',
          output: '-4',
          explanation: '-2 + 4 + (-6) = -4.'
        }
      ],
      starterCode: `def sum_even_numbers(numbers):\n    """\n    Iterates through a list of numbers and calculates the sum of all even numbers.\n    \n    Args:\n        numbers (list of int): List of integers to process.\n        \n    Returns:\n        int: The sum of all even numbers in the list.\n    """\n    total = 0\n    for num in numbers:\n        # TODO: Check if num is even and add it to total\n        total += num  # Hint: Currently adding all numbers!\n    return total\n\n# --- Test your solution ---\nif __name__ == "__main__":\n    sample = [1, 2, 3, 4, 5, 6]\n    print(f"Result for {sample}: {sum_even_numbers(sample)} (Expected: 12)")\n`,
      solutionCode: `def sum_even_numbers(numbers):\n    total = 0\n    for num in numbers:\n        if num % 2 == 0:\n            total += num\n    return total`,
      testCases: [
        { id: 'tc1', input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12', description: 'Standard list with mixed odd & even' },
        { id: 'tc2', input: '[2, 4, 6, 8, 10]', expectedOutput: '30', description: 'All even numbers' },
        { id: 'tc3', input: '[1, 3, 5, 7, 9]', expectedOutput: '0', description: 'All odd numbers (should return 0)' },
        { id: 'tc4', input: '[]', expectedOutput: '0', description: 'Empty list edge case' },
        { id: 'tc5', input: '[-4, -2, 0, 3, 5, 8]', expectedOutput: '2', description: 'Negative even numbers and zero (-4 + -2 + 0 + 8 = 2)' }
      ],
      hints: [
        'Recall the modulo operator `%` from the video lesson: `n % 2 == 0` evaluates to True when `n` is even.',
        'Make sure you check `if num % 2 == 0:` before adding to your accumulator `total`.',
        'Zero is an even number (`0 % 2 == 0` is True) and negative evens like `-4` also satisfy `-4 % 2 == 0` in Python.',
        'Alternative Pythonic one-liner: `return sum(n for n in numbers if n % 2 == 0)`'
      ],
      concepts: ['for loops', 'conditional filtering', 'modulo operator', 'accumulators']
    },
    tags: ['Python', 'Loops', 'Iteration', 'Algorithms']
  },
  {
    id: 'mod-math-linalg',
    stageId: 3,
    stageTitle: 'Mathematics & Statistics',
    title: 'Linear Algebra: Matrix Operations (Tensors)',
    subtitle: 'Understand matrix multiplication, dot products, and vector projections for AI.',
    description: 'Understand matrix multiplication, dot products, and transpose operations — the mathematical engine behind neural network layers.',
    duration: '40 mins',
    initialConceptScore: 85,
    initialPracticeScore: 75,
    initialTestsPassed: 3,
    initialTotalTests: 4,
    initialMastery: 'Proficient',
    initialRecommendation: 'Great grasp of matrix dot products! Next: Explore batch matrix operations and broadcasting.',
    objectives: [
      'Understand matrix dot products and inner dimensions',
      'Implement linear layer transformations Y = X @ W + b',
      'Compute cosine similarity across embedding vectors'
    ],
    keyTakeaways: [
      'Neural network layers are linear transformations: Y = X·W + b',
      'The dot product measures vector alignment and directional similarity',
      'NumPy broadcasting vectorizes operations across arbitrary batch sizes'
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'Matrix Multiplication Fundamentals',
        startTime: 0,
        duration: 400,
        transcript: 'Matrix multiplication is the fundamental operation powering every artificial neural network. When we pass batch input X through weights W, we perform dot products across rows and columns.',
        codeDemo: `import numpy as np\n\nX = np.array([[1, 2], [3, 4]])\nW = np.array([[0.5, 1.0], [1.5, 2.0]])\nb = np.array([0.1, 0.2])\n\nY = X @ W + b\nprint("Output:", Y)`
      }
    ],
    challenge: {
      id: 'chal-linalg',
      title: 'Implement a Forward Linear Layer',
      difficulty: 'Standard Challenge',
      problemStatement: 'Implement a function `linear_forward(X, W, b)` that computes the forward linear transformation: `Y = X @ W + b`.',
      instructions: [
        'Validate matching inner dimensions between X and W',
        'Perform matrix multiplication between X and W',
        'Add the bias vector b using broadcasting',
        'Return the output matrix Y'
      ],
      constraints: [
        'Use NumPy matrix multiplication (@ or np.matmul)',
        'Support 2D input batches X of shape (N, D_in)',
        'Weight matrix W has shape (D_in, D_out)',
        'Bias b has shape (D_out,)'
      ],
      examples: [
        {
          input: 'X = [[1, 0]], W = [[2, 1], [0, 1]], b = [0, 0]',
          output: '[[2, 1]]',
          explanation: '1x2 matrix multiplied by 2x2 matrix yields 1x2 output.'
        }
      ],
      starterCode: `import numpy as np\n\ndef linear_forward(X, W, b):\n    """\n    Computes Y = X @ W + b\n    """\n    # TODO: Implement linear layer transformation\n    X_arr = np.array(X)\n    W_arr = np.array(W)\n    b_arr = np.array(b)\n    return (X_arr @ W_arr + b_arr).tolist()\n`,
      solutionCode: `import numpy as np\n\ndef linear_forward(X, W, b):\n    return (np.array(X) @ np.array(W) + np.array(b)).tolist()`,
      testCases: [
        { id: 'tc1', input: 'X=[[1, 2]], W=[[1, 0], [0, 1]], b=[0, 0]', expectedOutput: '[[1, 2]]', description: 'Identity transformation' },
        { id: 'tc2', input: 'X=[[1, 1], [2, 2]], W=[[2], [3]], b=[1]', expectedOutput: '[[6], [11]]', description: '2-sample batch projection' },
        { id: 'tc3', input: 'X=[[0, 0]], W=[[10, 20], [30, 40]], b=[5, 10]', expectedOutput: '[[5, 10]]', description: 'Zero input with bias offset' }
      ],
      hints: [
        'Use the Python @ operator or np.dot() to perform matrix multiplication.',
        'NumPy will automatically broadcast a 1D bias vector across all batch rows in X.'
      ],
      concepts: ['matrix multiplication', 'linear layer', 'broadcasting', 'numpy']
    },
    tags: ['Linear Algebra', 'NumPy', 'Tensors', 'Math']
  }
];

export function createInitialProgress(module: TransformerModule): LearnerProgress {
  return {
    moduleId: module.id,
    videoWatchedPercent: module.initialConceptScore,
    currentChapterIndex: 3,
    videoTimePosition: 540,
    writtenCode: module.challenge.starterCode,
    testResults: {
      tc1: 'pass',
      tc2: 'pass',
      tc3: 'pass',
      tc4: 'fail',
      tc5: 'fail'
    },
    hintsUsed: 1,
    attempts: 2,
    masteryLevel: module.initialMastery,
    conceptScore: module.initialConceptScore,
    practiceScore: module.initialPracticeScore,
    testsPassed: module.initialTestsPassed,
    totalTests: module.initialTotalTests,
    recommendation: module.initialRecommendation,
    currentDifficulty: module.challenge.difficulty,
    lastMode: 'video'
  };
}

export function computeMasteryLevel(conceptScore: number, practiceScore: number): MasteryLevel {
  const combined = (conceptScore * 0.4) + (practiceScore * 0.6);
  if (combined >= 88) return 'Mastered';
  if (combined >= 70) return 'Proficient';
  if (combined >= 45) return 'Developing';
  return 'Novice';
}
