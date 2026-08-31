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

// ---------------------------------------------------------------------------
// 1. EMBEDDED SYSTEMS & FIRMWARE MODULES
// ---------------------------------------------------------------------------
export const EMBEDDED_MODULES: TransformerModule[] = [
  {
    id: 'mod-embed-c',
    stageId: 1,
    stageTitle: 'Embedded Systems',
    title: 'Embedded C & Bitwise Register Manipulation',
    subtitle: 'Master bit manipulation, memory-mapped I/O registers, volatile pointers, and struct packing in Embedded C.',
    description: 'Master low-level bitwise operations, volatile memory semantics, and register control for microcontroller hardware interfacing.',
    duration: '25 mins',
    initialConceptScore: 90,
    initialPracticeScore: 70,
    initialTestsPassed: 4,
    initialTotalTests: 5,
    initialMastery: 'Proficient',
    initialRecommendation: 'Your register bitwise masking is strong. Proceed to interrupt priority configuration.',
    objectives: [
      'Master bitwise AND, OR, XOR, and NOT operations on hardware registers',
      'Understand volatile pointer access to prevent compiler optimization removal',
      'Implement atomic read-modify-write register masks for GPIO pins',
      'Configure peripheral register control fields safely without corrupting adjacent bits'
    ],
    keyTakeaways: [
      'In embedded systems, registers are memory-mapped to fixed physical addresses',
      'Always use (1U << PIN) bitmasks to avoid sign-extension bugs',
      'Volatile keyword instructs the compiler that hardware can change register contents independently'
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'Memory-Mapped I/O & Volatile Pointers',
        startTime: 0,
        duration: 180,
        transcript: 'Welcome to Embedded C. In microcontroller programming, peripheral control registers are mapped directly into the address space. Pointers to these addresses MUST be qualified with volatile.',
        codeDemo: `// Definition of GPIO Mode Register at memory address 0x48000000\n#define GPIOA_MODER *((volatile uint32_t *)0x48000000UL)\n\nvoid set_pin_output(uint8_t pin) {\n    // Clear 2-bit field and set to 01 (General Purpose Output)\n    GPIOA_MODER &= ~(0x3U << (pin * 2));\n    GPIOA_MODER |=  (0x1U << (pin * 2));\n}`
      },
      {
        id: 'ch2',
        title: 'Bitwise Set, Clear and Toggle Patterns',
        startTime: 180,
        duration: 200,
        transcript: 'To set a bit without altering other bits, use bitwise OR. To clear a bit, use bitwise AND with inverted mask (~). To toggle, use XOR (^).',
        codeDemo: `uint32_t reg = 0x00000000;\n// Set Pin 5\nreg |= (1U << 5);\n// Toggle Pin 5\nreg ^= (1U << 5);\n// Clear Pin 5\nreg &= ~(1U << 5);`
      }
    ],
    challenge: {
      id: 'chal-embed-gpio',
      title: 'GPIO Pin Mode Register Masking',
      difficulty: 'Guided Challenge',
      problemStatement: 'Write a C function `uint32_t configure_gpio_pin(uint32_t reg_val, uint8_t pin_num, uint8_t mode)` that modifies the 2-bit mode field for the specified pin without altering any other pin configuration in the register.',
      instructions: [
        'Each pin occupies a 2-bit field in `reg_val` at offset `(pin_num * 2)`.',
        'First, clear the existing 2 bits at that position using bitwise AND with inverted mask.',
        'Then, set the new `mode` (masked to 2 bits) at offset `(pin_num * 2)` using bitwise OR.',
        'Return the updated 32-bit register value.'
      ],
      constraints: [
        '0 <= pin_num <= 15',
        '0 <= mode <= 3 (00: Input, 01: Output, 10: Alternate Function, 11: Analog)'
      ],
      examples: [
        {
          input: 'reg_val = 0x00000000, pin_num = 5, mode = 1',
          output: '0x00000400',
          explanation: 'Pin 5 offset is bit 10. Mode 01 placed at bit 10 gives 0x400 (1 << 10).'
        }
      ],
      starterCode: `#include <stdint.h>\n\nuint32_t configure_gpio_pin(uint32_t reg_val, uint8_t pin_num, uint8_t mode) {\n    // TODO: Clear 2-bit field at (pin_num * 2) and set new mode\n    \n    return reg_val;\n}`,
      solutionCode: `#include <stdint.h>\n\nuint32_t configure_gpio_pin(uint32_t reg_val, uint8_t pin_num, uint8_t mode) {\n    uint32_t clear_mask = ~(0x3U << (pin_num * 2));\n    uint32_t set_mask = ((uint32_t)(mode & 0x3U)) << (pin_num * 2);\n    return (reg_val & clear_mask) | set_mask;\n}`,
      testCases: [
        { id: 'tc1', input: 'reg_val=0, pin_num=0, mode=1', expectedOutput: '1', description: 'Configure Pin 0 as Output' },
        { id: 'tc2', input: 'reg_val=0, pin_num=5, mode=1', expectedOutput: '1024', description: 'Configure Pin 5 as Output (bit 10)' },
        { id: 'tc3', input: 'reg_val=0xFFFFFFFF, pin_num=5, mode=0', expectedOutput: '4294964223', description: 'Clear Pin 5 to Input on high register' }
      ],
      hints: [
        'The bit shift offset for pin N is (N * 2).',
        'Use ~(0x3U << (pin_num * 2)) to clear the 2-bit slot.',
        'Use (mode & 0x3U) << (pin_num * 2) to set the bits.'
      ],
      concepts: ['embedded-c', 'bitwise-operations', 'gpio-registers', 'bitmasking']
    },
    tags: ['Embedded Systems', 'C/C++', 'Microcontrollers', 'Bare Metal']
  },
  {
    id: 'mod-embed-mcu',
    stageId: 2,
    stageTitle: 'Microcontrollers',
    title: 'ARM Cortex-M & Peripheral Protocols (UART/SPI/I2C)',
    subtitle: 'Configure hardware peripherals, baud rates, parity, and interrupt service routines on ARM microcontrollers.',
    description: 'Master serial communication buses, clock tree configuration, and NVIC interrupt handling on ARM Cortex-M architecture.',
    duration: '30 mins',
    initialConceptScore: 85,
    initialPracticeScore: 65,
    initialTestsPassed: 3,
    initialTotalTests: 5,
    initialMastery: 'Developing',
    initialRecommendation: 'Understand packet frame validation before writing DMA drivers.',
    objectives: [
      'Calculate UART baud rate register divisors accurately',
      'Understand I2C 7-bit addressing, ACK/NACK signaling, and clock stretching',
      'Configure SPI master-slave clock polarity (CPOL) and phase (CPHA)',
      'Handle NVIC interrupt priorities and reentrancy'
    ],
    keyTakeaways: [
      'I2C is an open-drain synchronous 2-wire bus with pull-up resistors',
      'SPI is high-speed full-duplex synchronous 4-wire protocol (MOSI, MISO, SCK, CS)',
      'Interrupt Service Routines (ISRs) should be ultra-fast and offload heavy work to background queues'
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'I2C Frame & Checksum Parsing',
        startTime: 0,
        duration: 200,
        transcript: 'I2C transactions start with a START condition followed by a 7-bit slave address and a Read/Write bit. Sensor data packets often append a CRC or checksum byte.',
        codeDemo: `// Calculate 8-bit XOR checksum for sensor packet\nuint8_t compute_checksum(const uint8_t *data, size_t len) {\n    uint8_t crc = 0x00;\n    for(size_t i = 0; i < len; i++) {\n        crc ^= data[i];\n    }\n    return crc;\n}`
      }
    ],
    challenge: {
      id: 'chal-embed-i2c',
      title: 'I2C Sensor Packet Validation & Checksum',
      difficulty: 'Guided Challenge',
      problemStatement: 'Implement `int validate_sensor_packet(const uint8_t *packet, int length)` in C to verify that an incoming I2C sensor packet has matching header (0xAA), valid length, and valid XOR checksum.',
      instructions: [
        'Header byte at index 0 must equal 0xAA.',
        'Packet length must be at least 3 bytes (Header, Data..., Checksum).',
        'The last byte is the XOR checksum of all previous bytes.',
        'Return 1 if valid, 0 if invalid.'
      ],
      constraints: ['length >= 3', 'length <= 64'],
      examples: [
        { input: 'packet = [0xAA, 0x05, 0x01, 0xAE]', output: '1', explanation: '0xAA ^ 0x05 ^ 0x01 = 0xAE (Valid)' }
      ],
      starterCode: `#include <stdint.h>\n\nint validate_sensor_packet(const uint8_t *packet, int length) {\n    if (!packet || length < 3) return 0;\n    // TODO: Verify header and checksum\n    return 0;\n}`,
      solutionCode: `#include <stdint.h>\n\nint validate_sensor_packet(const uint8_t *packet, int length) {\n    if (!packet || length < 3) return 0;\n    if (packet[0] != 0xAA) return 0;\n    uint8_t xor_sum = 0;\n    for (int i = 0; i < length - 1; i++) {\n        xor_sum ^= packet[i];\n    }\n    return (xor_sum == packet[length - 1]) ? 1 : 0;\n}`,
      testCases: [
        { id: 'tc1', input: 'packet=[0xAA, 0x10, 0xBA], len=3', expectedOutput: '1', description: 'Valid 3-byte packet' },
        { id: 'tc2', input: 'packet=[0x55, 0x10, 0x45], len=3', expectedOutput: '0', description: 'Invalid header' }
      ],
      hints: ['Loop from 0 to length - 2 to compute XOR, then compare with packet[length - 1].'],
      concepts: ['i2c', 'packet-parsing', 'checksum', 'c-programming']
    },
    tags: ['ARM', 'Microcontrollers', 'I2C', 'SPI', 'Protocols']
  },
  {
    id: 'mod-embed-rtos',
    stageId: 3,
    stageTitle: 'Real-Time Operating Systems (RTOS)',
    title: 'Real-Time Operating Systems (RTOS) Task Scheduling',
    subtitle: 'Design deterministic multitasking systems with task priority scheduling, mutexes, and queues in FreeRTOS.',
    description: 'Master preemptive task scheduling, priority inversion prevention, binary semaphores, and inter-task message queues.',
    duration: '35 mins',
    initialConceptScore: 80,
    initialPracticeScore: 60,
    initialTestsPassed: 3,
    initialTotalTests: 5,
    initialMastery: 'Developing',
    initialRecommendation: 'Practice thread-safe circular buffers to prevent race conditions.',
    objectives: [
      'Understand preemptive priority scheduling and tick interrupts',
      'Prevent priority inversion using priority inheritance mutexes',
      'Implement thread-safe circular queue buffers for sensor data',
      'Manage stack allocation and detect stack overflow in FreeRTOS tasks'
    ],
    keyTakeaways: [
      'RTOS provides deterministic latency guarantees for hard real-time deadlines',
      'Never use raw global variables across tasks without mutex protection',
      'Queues provide thread-safe copying of message pointers or structures between tasks'
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'Circular Queue Buffer Implementation',
        startTime: 0,
        duration: 220,
        transcript: 'A circular buffer is essential for buffering data between an interrupt ISR and a processing RTOS task. It uses head and tail indices modulo the capacity.',
        codeDemo: `typedef struct {\n    uint8_t buffer[64];\n    int head;\n    int tail;\n    int count;\n} RingBuffer;\n\nint ring_push(RingBuffer *rb, uint8_t byte) {\n    if (rb->count >= 64) return -1; // Full\n    rb->buffer[rb->head] = byte;\n    rb->head = (rb->head + 1) % 64;\n    rb->count++;\n    return 0;\n}`
      }
    ],
    challenge: {
      id: 'chal-embed-ringbuffer',
      title: 'Thread-Safe Ring Buffer Index Calculation',
      difficulty: 'Standard Challenge',
      problemStatement: 'Implement `int get_next_ring_index(int current_index, int step, int capacity)` that correctly advances the buffer index by `step` wrapping around `capacity` without negative indices.',
      instructions: [
        'Compute `(current_index + step) % capacity`.',
        'Handle negative step values properly using `((index % capacity) + capacity) % capacity`.',
        'Return the valid 0-indexed position.'
      ],
      constraints: ['capacity > 0', '0 <= current_index < capacity'],
      examples: [
        { input: 'current_index = 62, step = 3, capacity = 64', output: '1', explanation: '(62 + 3) = 65 % 64 = 1' }
      ],
      starterCode: `int get_next_ring_index(int current_index, int step, int capacity) {\n    // TODO: Return wrapped index\n    return 0;\n}`,
      solutionCode: `int get_next_ring_index(int current_index, int step, int capacity) {\n    int res = (current_index + step) % capacity;\n    if (res < 0) res += capacity;\n    return res;\n}`,
      testCases: [
        { id: 'tc1', input: 'idx=62, step=3, cap=64', expectedOutput: '1', description: 'Wrap around end' },
        { id: 'tc2', input: 'idx=1, step=-2, cap=64', expectedOutput: '63', description: 'Wrap backward' }
      ],
      hints: ['Ensure negative modulo wraps back into [0, capacity - 1].'],
      concepts: ['rtos', 'circular-buffer', 'ring-buffer', 'c-programming']
    },
    tags: ['RTOS', 'FreeRTOS', 'Concurrency', 'Task Scheduling']
  }
];

// ---------------------------------------------------------------------------
// 2. CYBERSECURITY MODULES
// ---------------------------------------------------------------------------
export const CYBERSECURITY_MODULES: TransformerModule[] = [
  {
    id: 'mod-cyber-net',
    stageId: 1,
    stageTitle: 'Cybersecurity',
    title: 'Network Security & Wireshark Packet Analysis',
    subtitle: 'Inspect TCP/IP handshakes, encrypted TLS payloads, DNS queries, and port scanning anomalies.',
    description: 'Master packet-level network analysis, protocol vulnerabilities, and perimeter defense strategies.',
    duration: '25 mins',
    initialConceptScore: 88,
    initialPracticeScore: 70,
    initialTestsPassed: 4,
    initialTotalTests: 5,
    initialMastery: 'Proficient',
    initialRecommendation: 'Solid network fundamentals. Proceed to web application vulnerability assessment.',
    objectives: [
      'Analyze 3-way TCP handshakes (SYN, SYN-ACK, ACK)',
      'Detect anomalous port scanning signatures and SYN floods',
      'Inspect DNS query packets and identify DNS tunneling'
    ],
    keyTakeaways: [
      'TCP flags reveal session states and scan techniques (e.g. NULL/XMAS scans)',
      'Wireshark display filters isolate suspicious IP traffic efficiently'
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'TCP Flags & Handshake Verification',
        startTime: 0,
        duration: 180,
        transcript: 'A standard TCP connection begins with a SYN packet, followed by SYN-ACK, and finalized by ACK.',
        codeDemo: `def is_syn_flood(packets, threshold=100):\n    syn_count = sum(1 for p in packets if p.get('flags') == 'SYN')\n    return syn_count > threshold`
      }
    ],
    challenge: {
      id: 'chal-cyber-ip',
      title: 'IP Subnet CIDR Mask Calculator',
      difficulty: 'Guided Challenge',
      problemStatement: 'Write a Python function `cidr_to_netmask(cidr: int) -> str` that converts a CIDR prefix (e.g. 24) into a dotted decimal subnet mask (e.g. "255.255.255.0").',
      instructions: [
        'Given prefix length N (0 to 32), construct 32-bit mask with N ones followed by 32-N zeros.',
        'Split into four 8-bit octets and join with dots.'
      ],
      constraints: ['0 <= cidr <= 32'],
      examples: [
        { input: 'cidr = 24', output: '"255.255.255.0"', explanation: '24 ones = 11111111.11111111.11111111.00000000' }
      ],
      starterCode: `def cidr_to_netmask(cidr: int) -> str:\n    # TODO: Convert CIDR to dotted netmask\n    return "255.255.255.0"`,
      solutionCode: `def cidr_to_netmask(cidr: int) -> str:\n    mask = (0xFFFFFFFF << (32 - cidr)) & 0xFFFFFFFF if cidr > 0 else 0\n    return f"{(mask >> 24) & 0xFF}.{(mask >> 16) & 0xFF}.{(mask >> 8) & 0xFF}.{mask & 0xFF}"`,
      testCases: [
        { id: 'tc1', input: 'cidr=24', expectedOutput: '255.255.255.0', description: 'Standard /24 network' },
        { id: 'tc2', input: 'cidr=16', expectedOutput: '255.255.0.0', description: 'Class B /16 network' },
        { id: 'tc3', input: 'cidr=32', expectedOutput: '255.255.255.255', description: 'Single host /32' }
      ],
      hints: ['Shift 0xFFFFFFFF left by (32 - cidr).'],
      concepts: ['networking', 'cidr', 'subnet-mask', 'tcp-ip']
    },
    tags: ['Cybersecurity', 'Networking', 'Wireshark', 'TCP/IP']
  }
];

// ---------------------------------------------------------------------------
// 3. AI / ML DEFAULT MODULES
// ---------------------------------------------------------------------------
export const AI_ML_MODULES: TransformerModule[] = [
  {
    id: 'mod-py-loops',
    stageId: 1,
    stageTitle: 'Programming & Data Structures',
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
      }
    ],
    challenge: {
      id: 'chal-sum-evens',
      title: 'Conditional Accumulator: Sum of Even Numbers',
      difficulty: 'Guided Challenge',
      problemStatement: 'Write a Python function `sum_even_numbers(numbers: list[int]) -> int` that computes and returns the sum of all strictly even integers from the input list.',
      instructions: [
        'Iterate through the list of integers using a `for` loop.',
        'Use the modulo operator `% 2 == 0` to check if a number is even.',
        'Accumulate all even values into a running total.',
        'Return `0` if the list is empty or contains no even integers.'
      ],
      constraints: [
        '0 <= len(numbers) <= 10^5',
        '-10^9 <= numbers[i] <= 10^9',
        'Time complexity must be O(N)',
        'Space complexity must be O(1)'
      ],
      examples: [
        { input: 'numbers = [1, 2, 3, 4, 5, 6]', output: '12', explanation: '2 + 4 + 6 = 12' },
        { input: 'numbers = [1, 3, 5, 7]', output: '0', explanation: 'No even integers present' }
      ],
      starterCode: `def sum_even_numbers(numbers: list[int]) -> int:\n    # TODO: Initialize accumulator and iterate\n    total = 0\n    for num in numbers:\n        pass\n    return total`,
      solutionCode: `def sum_even_numbers(numbers: list[int]) -> int:\n    return sum(n for n in numbers if n % 2 == 0)`,
      testCases: [
        { id: 'tc1', input: 'numbers = [1, 2, 3, 4, 5, 6]', expectedOutput: '12', description: 'Standard mixed list with positives' },
        { id: 'tc2', input: 'numbers = [1, 3, 5, 7, 9]', expectedOutput: '0', description: 'All odd integers (should return 0)' },
        { id: 'tc3', input: 'numbers = []', expectedOutput: '0', description: 'Empty list edge case' }
      ],
      hints: [
        'An integer `n` is even if `n % 2 == 0`.',
        'Remember negative even numbers like `-4 % 2 == 0` evaluate to `True` in Python.'
      ],
      concepts: ['for-loop', 'modulo operator', 'accumulator pattern', 'conditional logic']
    },
    tags: ['Python', 'Core Foundations', 'Algorithms', 'Data Structures']
  }
];

export const TRANSFORMER_MODULES: TransformerModule[] = AI_ML_MODULES;

/**
 * Returns role-appropriate modules based on the designated career path.
 */
export function getModulesForRole(targetRole?: string, stages?: any[]): TransformerModule[] {
  const q = (targetRole || '').toLowerCase();

  // 1. Embedded Systems & Firmware
  if (q.includes('embed') || q.includes('firmware') || q.includes('microcontroller') || q.includes('arm') || q.includes('rtos') || q.includes('vlsi')) {
    return EMBEDDED_MODULES;
  }

  // 2. Cybersecurity
  if (q.includes('cyber') || q.includes('security') || q.includes('pentest') || q.includes('infosec')) {
    return CYBERSECURITY_MODULES;
  }

  // 3. Dynamic stage fallback
  if (stages && stages.length > 0) {
    const isEmbeddedStage = stages.some((s: any) =>
      (s.title || '').toLowerCase().includes('embed') || (s.title || '').toLowerCase().includes('microcontroller') || (s.title || '').toLowerCase().includes('rtos')
    );
    if (isEmbeddedStage) return EMBEDDED_MODULES;
  }

  // 4. Default AI/ML modules
  return AI_ML_MODULES;
}

export function createInitialProgress(module: TransformerModule): LearnerProgress {
  return {
    moduleId: module.id,
    videoWatchedPercent: module.initialConceptScore,
    currentChapterIndex: 0,
    videoTimePosition: 0,
    writtenCode: module.challenge.starterCode,
    testResults: {
      tc1: 'pending',
      tc2: 'pending',
      tc3: 'pending'
    },
    hintsUsed: 0,
    attempts: 0,
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
