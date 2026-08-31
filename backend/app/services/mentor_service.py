"""
AI Mentor Service — Server-Side Intelligence & Adaptive Learning Layer.

Powered by LangChain + OpenAI (GPT-4.1-nano) and Supabase DB.
Implements:
1. Deterministic Priority Engine (calculate_todays_focus) with topic drill-down.
2. Structured LLM prompt builders & parsers for Learn, Practice, and Assess.
3. Authoritative server-side assessment generation & grading.
4. Weighted skill mastery recalculation & dynamic focus adaptation.
5. Persistent session and conversation memory.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import JsonOutputParser

from app.core.config import get_settings
from app.core.supabase_client import get_supabase_client
from app.models.mentor import (
    TodaysFocus,
    RelevantSkillItem,
    AssessmentQuestionClient,
    QuestionResult,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Canonical Default Roadmap Stages & Skills (Matching PathAI Curriculum)
# ---------------------------------------------------------------------------
CANONICAL_STAGES = [
    {
        "id": 1,
        "title": "Programming Foundations",
        "order": 1,
        "status": "COMPLETED",
        "skills": ["Data Types", "Loops", "Functions", "Algorithmic Complexity"],
        "prerequisites": [],
    },
    {
        "id": 2,
        "title": "Python for AI",
        "order": 2,
        "status": "COMPLETED",
        "skills": ["Python OOP", "NumPy & Pandas"],
        "prerequisites": ["Programming Foundations"],
    },
    {
        "id": 3,
        "title": "Mathematics & Statistics",
        "order": 3,
        "status": "IN_PROGRESS",
        "skills": ["Linear Algebra", "Calculus", "Probability", "Optimization"],
        "prerequisites": ["Python for AI"],
    },
    {
        "id": 4,
        "title": "Machine Learning",
        "order": 4,
        "status": "NOT_STARTED",
        "skills": ["Regression Models", "Random Forests", "XGBoost", "Model Evaluation"],
        "prerequisites": ["Mathematics & Statistics"],
    },
    {
        "id": 5,
        "title": "Deep Learning",
        "order": 5,
        "status": "LOCKED",
        "skills": ["PyTorch", "Backpropagation", "CNNs & Vision", "RNNs & Sequence Models"],
        "prerequisites": ["Machine Learning"],
    },
    {
        "id": 6,
        "title": "Generative AI & LLMs",
        "order": 6,
        "status": "LOCKED",
        "skills": ["Transformers", "Tokenization", "RAG Systems", "Vector Databases", "Prompt Engineering"],
        "prerequisites": ["Deep Learning"],
    },
]

CANONICAL_SKILLS: list[dict[str, Any]] = [
    {"id": "s1", "name": "Python OOP", "domain": "Foundations & Core Python", "level": "Advanced", "progress": 95, "is_verified": True},
    {"id": "s2", "name": "NumPy & Pandas", "domain": "Foundations & Core Python", "level": "Advanced", "progress": 88, "is_verified": True},
    {"id": "s3", "name": "Algorithmic Complexity", "domain": "Foundations & Core Python", "level": "Developing", "progress": 45, "is_verified": False},
    {"id": "s4", "name": "Linear Algebra", "domain": "Math & Statistics", "level": "Developing", "progress": 45, "is_verified": False},
    {"id": "s5", "name": "Calculus", "domain": "Math & Statistics", "level": "Developing", "progress": 30, "is_verified": False},
    {"id": "s6", "name": "Probability", "domain": "Math & Statistics", "level": "Intermediate", "progress": 60, "is_verified": True},
    {"id": "s7", "name": "Optimization", "domain": "Math & Statistics", "level": "Novice", "progress": 10, "is_verified": False},
    {"id": "s8", "name": "Regression Models", "domain": "Machine Learning", "level": "Intermediate", "progress": 75, "is_verified": True},
    {"id": "s9", "name": "Random Forests", "domain": "Machine Learning", "level": "Intermediate", "progress": 65, "is_verified": False},
    {"id": "s10", "name": "XGBoost", "domain": "Machine Learning", "level": "Novice", "progress": 20, "is_verified": False},
    {"id": "s11", "name": "Model Evaluation", "domain": "Machine Learning", "level": "Developing", "progress": 55, "is_verified": False},
    {"id": "s12", "name": "Transformers", "domain": "Generative AI", "level": "Novice", "progress": 15, "is_verified": False},
    {"id": "s13", "name": "Tokenization", "domain": "Generative AI", "level": "Developing", "progress": 40, "is_verified": False},
    {"id": "s14", "name": "RAG Systems", "domain": "Generative AI", "level": "Developing", "progress": 35, "is_verified": False},
    {"id": "s15", "name": "Vector Databases", "domain": "Generative AI", "level": "Novice", "progress": 25, "is_verified": False},
]

# Topic-level hierarchy for drill-down adaptation
TOPIC_HIERARCHY: dict[str, list[str]] = {
    "Linear Algebra": ["Matrix Operations", "Eigenvalues & Eigenvectors", "Vector Spaces", "SVD"],
    "Calculus": ["Partial Derivatives", "Gradient Descent", "Chain Rule", "Hessian Matrices"],
    "Probability": ["Bayes' Theorem", "Continuous Distributions", "Expectation & Variance", "Maximum Likelihood"],
    "Optimization": ["Convexity", "Adam Optimizer", "Learning Rate Schedules", "Stochastic Gradient Descent"],
    "Regression Models": ["Linear Regression", "L1/L2 Regularization", "Cost Functions", "Residual Analysis"],
    "Transformers": ["Self-Attention Mechanism", "Multi-Head Attention", "Positional Encoding", "KV Caching"],
    "Tokenization": ["Byte-Pair Encoding", "WordPiece", "SentencePiece", "Special Tokens"],
    "RAG Systems": ["Semantic Chunking", "Hybrid Search", "Re-Ranking Pipelines", "RAG Triad Evaluation"],
    "Vector Databases": ["HNSW Indexing", "Cosine Similarity", "Embedding Alignment", "Metadata Filtering"],
}

# Curated Fallback Assessment Question Bank
QUESTION_BANK: dict[str, list[dict[str, Any]]] = {
    "Linear Algebra": [
        {"id": "la-1", "text": "What is the dimension of the resulting matrix when multiplying a 3×2 matrix by a 2×4 matrix?", "options": ["3×4", "2×3", "3×2", "Cannot be multiplied"], "correctAnswer": 0, "explanation": "Matrix multiplication (M×K) × (K×N) yields a matrix of dimensions M×N. Here, (3×2) × (2×4) = 3×4."},
        {"id": "la-2", "text": "What does it mean if the determinant of a square matrix is zero?", "options": ["The matrix is orthogonal", "The matrix is non-invertible (singular)", "The matrix has all zero eigenvalues", "The matrix is symmetric"], "correctAnswer": 1, "explanation": "A determinant of 0 indicates that the matrix compresses space into a lower dimension, making it singular and non-invertible."},
        {"id": "la-3", "text": "What is an eigenvector of a square matrix A?", "options": ["A vector that becomes zero when multiplied by A", "A non-zero vector that only scales by a scalar λ when multiplied by A (Av = λv)", "A vector with all equal components", "The inverse of matrix A"], "correctAnswer": 1, "explanation": "An eigenvector only changes in magnitude (scaled by eigenvalue λ) without changing its directional line: Av = λv."},
        {"id": "la-4", "text": "What does Principal Component Analysis (PCA) utilize to find directions of maximum variance?", "options": ["Matrix determinant", "Eigenvectors of the covariance matrix", "Cross-entropy loss", "LU Decomposition"], "correctAnswer": 1, "explanation": "PCA computes the eigenvectors of the data's covariance matrix; the eigenvectors with the largest eigenvalues represent principal directions of variance."},
        {"id": "la-5", "text": "What is the dot product of two orthogonal vectors?", "options": ["1", "0", "-1", "Infinity"], "correctAnswer": 1, "explanation": "Two vectors are orthogonal (perpendicular) if and only if their inner/dot product equals 0."},
    ],
    "Calculus": [
        {"id": "calc-1", "text": "In gradient descent, in which direction do we update model parameters to minimize loss?", "options": ["In the direction of the gradient", "Opposite to the direction of the gradient (-∇L)", "Perpendicular to the gradient", "Random direction"], "correctAnswer": 1, "explanation": "The gradient ∇L points in the direction of steepest increase. To minimize the loss, parameters step in the opposite direction: θ ← θ - α∇L."},
        {"id": "calc-2", "text": "What calculus rule is the backbone of backpropagation in deep neural networks?", "options": ["Product rule", "Chain rule of differentiation", "L'Hôpital's rule", "Fundamental Theorem of Calculus"], "correctAnswer": 1, "explanation": "Backpropagation computes gradients of loss with respect to inner layer weights by systematically applying the chain rule: dL/dw = (dL/dy) * (dy/dw)."},
        {"id": "calc-3", "text": "What does a partial derivative ∂f/∂x represent for a multivariable function f(x, y)?", "options": ["The rate of change of f with respect to x while keeping y constant", "The sum of derivatives of x and y", "The area under f along the x-axis", "The second derivative with respect to x"], "correctAnswer": 0, "explanation": "A partial derivative measures the rate of change along one variable axis while treating all other variables as fixed constants."},
        {"id": "calc-4", "text": "What does the Hessian matrix contain?", "options": ["First-order partial derivatives", "Second-order partial derivatives", "Eigenvalues of the loss function", "Inverse gradient vectors"], "correctAnswer": 1, "explanation": "The Hessian is a square matrix of all second-order partial derivatives of a scalar-valued function, describing local curvature."},
        {"id": "calc-5", "text": "What happens if the learning rate α in gradient descent is too large?", "options": ["The model converges instantaneously", "The algorithm may oscillate or diverge uncontrollably", "The gradients become exactly zero", "Weights freeze at their initial values"], "correctAnswer": 1, "explanation": "An excessively large learning rate overshoots the minimum and can cause the loss to diverge toward infinity."},
    ],
    "Probability": [
        {"id": "prob-1", "text": "According to Bayes' Theorem, what is P(A|B)?", "options": ["P(B|A) * P(A) / P(B)", "P(A) * P(B) / P(B|A)", "P(A) + P(B) - P(A ∩ B)", "P(A ∩ B) * P(B)"], "correctAnswer": 0, "explanation": "Bayes' Theorem states P(A|B) = [P(B|A) * P(A)] / P(B), relating posterior probability to likelihood and prior."},
        {"id": "prob-2", "text": "In a standard normal distribution, what percentage of data falls within ±1 standard deviation of the mean?", "options": ["50%", "68.2%", "95.4%", "99.7%"], "correctAnswer": 1, "explanation": "By the empirical rule (68-95-99.7), approximately 68.2% of data in a normal distribution lies within ±1σ of the mean μ."},
        {"id": "prob-3", "text": "What does Maximum Likelihood Estimation (MLE) aim to maximize?", "options": ["The learning rate", "The probability of observing the given dataset under the model parameters", "The model complexity", "The cross-validation split ratio"], "correctAnswer": 1, "explanation": "MLE seeks parameter values θ that maximize the likelihood function L(θ|X), making the observed data most probable."},
    ],
    "Embedded C/C++ Programming": [
        {"id": "emb-1", "text": "Why is the 'volatile' keyword critical when declaring pointers to memory-mapped hardware peripheral registers in C?", "options": ["It increases execution speed", "It prevents the compiler from optimizing away repeated memory reads/writes to hardware", "It allocates the variable on the call stack", "It makes the pointer read-only"], "correctAnswer": 1, "explanation": "The 'volatile' qualifier informs the compiler that the register's value can change asynchronously outside the program flow (e.g., via hardware or interrupts), preventing incorrect optimization."},
        {"id": "emb-2", "text": "In standard embedded C memory layout, which memory section holds uninitialized global and static variables zeroed at startup?", "options": [".rodata (Flash)", ".bss section (RAM)", "Call Stack", "Heap"], "correctAnswer": 1, "explanation": "The .bss section contains uninitialized global and static variables. The startup assembly routine clears this section in RAM to zero before main() executes."},
        {"id": "emb-3", "text": "Which bitwise C operation correctly sets Bit 4 of an 8-bit GPIO configuration register without modifying other bits?", "options": ["REG &= ~(1 << 4);", "REG |= (1 << 4);", "REG ^= (1 << 4);", "REG = (1 << 4);"], "correctAnswer": 1, "explanation": "The bitwise OR assignment `REG |= (1 << 4)` sets bit 4 to 1 while leaving all other register bits unchanged."},
        {"id": "emb-4", "text": "What is the primary risk of performing dynamic memory allocation (malloc/free) inside an Interrupt Service Routine (ISR)?", "options": ["It causes pointer overflow", "It is non-deterministic and can cause deadlocks or unbounded ISR latency", "It changes the CPU clock frequency", "It corrupts the program counter unconditionally"], "correctAnswer": 1, "explanation": "malloc() is non-reentrant and non-deterministic. Calling it inside an ISR can lead to priority inversion, heap corruption, and unacceptable interrupt latency."},
        {"id": "emb-5", "text": "What does pointer arithmetic `p + 1` evaluate to in C when `p` is of type `uint32_t*`?", "options": ["The address increased by 1 byte", "The address increased by 4 bytes (sizeof(uint32_t))", "The address squared", "The value stored at p plus 1"], "correctAnswer": 1, "explanation": "Pointer arithmetic scales by the size of the referenced type. For uint32_t (4 bytes), `p + 1` advances the memory address by 4 bytes."},
    ],
    "ARM Cortex-M Architecture, Registers & Interrupts": [
        {"id": "arm-1", "text": "What is the function of the NVIC (Nested Vectored Interrupt Controller) in ARM Cortex-M microcontrollers?", "options": ["Dynamic voltage scaling", "Hardware-accelerated low-latency interrupt prioritizing and tail-chaining", "Generating PWM waveforms", "SPI bus arbitration"], "correctAnswer": 1, "explanation": "The NVIC provides deterministic, low-latency interrupt handling with hardware priority nesting and tail-chaining in ARM Cortex-M cores."},
        {"id": "arm-2", "text": "In ARM Cortex-M, what occurs during automatic hardware 'stacking' upon entering an exception?", "options": ["The core reboots immediately", "Hardware automatically pushes R0-R3, R12, LR, PC, and xPSR onto the active stack", "The Flash memory is locked", "All peripheral clocks are disabled"], "correctAnswer": 1, "explanation": "Upon an interrupt, the ARM Cortex-M hardware automatically saves caller-saved registers (R0-R3, R12, LR, PC, xPSR) to the stack, enabling pure C interrupt handlers."},
        {"id": "arm-3", "text": "What is the purpose of the SysTick timer in ARM Cortex-M systems?", "options": ["Real-time clock calendar backup", "Providing a standard periodic hardware timebase for RTOS tick scheduling", "Audio signal generation", "Watchdog reset monitoring"], "correctAnswer": 1, "explanation": "SysTick is a 24-bit down-counter integral to ARM Cortex-M cores, designed to generate periodic ticks for RTOS kernels and task schedulers."},
        {"id": "arm-4", "text": "What does 'Tail-Chaining' optimize in ARM Cortex-M interrupt processing?", "options": ["Optimizes Flash memory programming", "Eliminates unnecessary pop/push unstacking overhead between back-to-back pending interrupts (saving 12+ clock cycles)", "Chains multiple DMA channels together", "Increases CPU clock multiplier"], "correctAnswer": 1, "explanation": "Tail-chaining allows the processor to skip popping registers and immediately service the next pending ISR, reducing interrupt latency."},
        {"id": "arm-5", "text": "What is the difference between Handler Mode and Thread Mode in ARM Cortex-M?", "options": ["Handler Mode executes exceptions/ISRs with privileged access; Thread Mode runs user application code", "Handler Mode is for battery charging only", "Thread Mode disables all interrupts", "There is no privilege distinction"], "correctAnswer": 0, "explanation": "ARM Cortex-M operates in Thread Mode for main application code and enters Handler Mode (always privileged) whenever executing exception handlers."},
    ],
    "Microcontroller Architecture": [
        {"id": "mc-1", "text": "What is the main architectural difference between Memory-Mapped I/O and Port-Mapped I/O?", "options": ["Memory-mapped I/O shares the same address bus and instructions as system RAM", "Port-mapped I/O cannot control digital pins", "Memory-mapped I/O requires external ROM chips", "Port-mapped I/O runs faster in all cases"], "correctAnswer": 0, "explanation": "In Memory-Mapped I/O, peripheral registers occupy standard memory addresses and are accessed using regular load/store instructions (LDR/STR in ARM)."},
        {"id": "mc-2", "text": "What is the primary function of a Watchdog Timer (WDT)?", "options": ["To measure external signal frequencies", "To automatically reset the microcontroller if software hangs or enters an infinite fault loop", "To regulate the operating voltage", "To store calibration data"], "correctAnswer": 1, "explanation": "A Watchdog Timer counts down continuously and triggers a system reset unless periodically refreshed ('kicked') by valid software execution."},
        {"id": "mc-3", "text": "What is the purpose of Direct Memory Access (DMA) in microcontroller systems?", "options": ["To double the CPU clock frequency", "To transfer data between memory and peripherals without continuous CPU intervention, freeing CPU cycles", "To compress Flash firmware", "To encrypt SPI data"], "correctAnswer": 1, "explanation": "DMA controllers transfer data directly between memory and peripherals (e.g. ADC, UART, SPI) in the background without CPU cycle overhead."},
        {"id": "mc-4", "text": "Why do microcontrollers provide Phase-Locked Loop (PLL) clock circuits?", "options": ["To multiply a low-frequency crystal oscillator up to high internal CPU operating frequencies", "To convert AC voltage to DC", "To store debug logs", "To monitor temperature"], "correctAnswer": 0, "explanation": "PLL circuits multiply and stabilize an external low-cost crystal frequency (e.g. 8MHz) up to high CPU frequencies (e.g. 72MHz or 168MHz)."},
        {"id": "mc-5", "text": "What is the difference between Push-Pull and Open-Drain output configurations on a GPIO pin?", "options": ["Push-Pull actively drives both HIGH and LOW levels; Open-Drain only actively pulls LOW (requires external pull-up for HIGH)", "Open-Drain cannot drive low", "Push-Pull is only for analog input", "There is no electrical difference"], "correctAnswer": 0, "explanation": "Push-pull uses complementary transistors to drive high and low. Open-drain only sinks current low, making it ideal for shared buses like I2C."},
    ],
    "Embedded Systems": [
        {"id": "es-1", "text": "In FreeRTOS or embedded multitasking, what mechanism prevents race conditions when sharing a buffer between tasks?", "options": ["Infinite while loops", "Mutexes or Semaphores with priority inheritance", "Disabling power saving", "Using global variables without locking"], "correctAnswer": 1, "explanation": "Mutexes with priority inheritance prevent concurrent access races and mitigate priority inversion in real-time operating systems."},
        {"id": "es-2", "text": "Which serial communication protocol uses a 2-wire bus (SDA and SCL) with open-drain outputs and pull-up resistors?", "options": ["SPI", "UART", "I2C (Inter-Integrated Circuit)", "CAN"], "correctAnswer": 2, "explanation": "I2C operates using two bidirectional open-drain lines (Serial Data SDA and Serial Clock SCL) pulled high by external resistors."},
        {"id": "es-3", "text": "What is Priority Inversion in real-time operating systems (RTOS)?", "options": ["When a high-priority task is blocked waiting for a shared resource held by a low-priority task that is preempted by medium-priority tasks", "When task priorities are reversed at compile time", "When the CPU clock slows down", "When interrupt handlers are disabled"], "correctAnswer": 0, "explanation": "Priority inversion happens when a medium task preempts a low task holding a mutex needed by a high task. Priority inheritance protocol solves this by elevating the low task's priority."},
        {"id": "es-4", "text": "What are the 4 standard signal lines in a full-duplex SPI (Serial Peripheral Interface) bus?", "options": ["MOSI, MISO, SCK, CS/SS", "TX, RX, RTS, CTS", "SDA, SCL, VCC, GND", "CAN_H, CAN_L, PWR, GND"], "correctAnswer": 0, "explanation": "SPI uses Master Out Slave In (MOSI), Master In Slave Out (MISO), Serial Clock (SCK), and Chip Select (CS/SS)."},
        {"id": "es-5", "text": "Why is static task memory allocation (`xTaskCreateStatic`) preferred over dynamic allocation (`xTaskCreate`) in safety-critical firmware?", "options": ["It prevents heap fragmentation and guarantees deterministic stack and TCB memory allocation at compile time", "It uses less Flash memory", "It increases RTOS context switch speed by 10x", "It disables compiler optimizations"], "correctAnswer": 0, "explanation": "Static allocation guarantees at compile-time that memory for task stacks and TCBs is reserved, preventing runtime out-of-memory crashes."},
    ],
    "Transformers": [
        {"id": "tf-1", "text": "In the self-attention formula Attention(Q, K, V) = softmax(QK^T / √d_k)V, why is the dot product scaled by √d_k?", "options": ["To increase parameter count", "To prevent dot products from growing large in magnitude and pushing softmax into vanishing gradients", "To ensure outputs are binary", "To align dimensions for matrix multiplication"], "correctAnswer": 1, "explanation": "For large projection dimensions d_k, dot products grow large, causing softmax to saturate with extremely tiny gradients. Scaling by √d_k maintains stable variance."},
        {"id": "tf-2", "text": "Why do transformer architectures require Positional Encodings?", "options": ["To compress the input tokens", "Because self-attention is permutation-invariant and has no inherent sense of word order", "To initialize attention weights", "To speed up matrix multiplication on GPUs"], "correctAnswer": 1, "explanation": "Self-attention computes token relationships simultaneously regardless of position. Positional encodings inject sequential order into token embeddings."},
        {"id": "tf-3", "text": "What is the primary benefit of KV (Key-Value) Caching during LLM text generation?", "options": ["It reduces vocabulary size", "It avoids recomputing Key and Value vectors for previously generated prompt and output tokens", "It enables training on smaller GPUs", "It replaces the attention mechanism with convolution"], "correctAnswer": 1, "explanation": "During autoregressive decoding, past tokens' keys and values do not change. Caching them avoids quadratic recomputation per new generated token."},
        {"id": "tf-4", "text": "What is the key difference between Multi-Head Attention (MHA) and Grouped-Query Attention (GQA)?", "options": ["GQA shares Key and Value heads across multiple Query heads, drastically reducing KV cache memory footprint", "MHA uses fewer parameters than GQA", "GQA cannot run on modern GPUs", "MHA only works for vision models"], "correctAnswer": 0, "explanation": "GQA groups multiple query heads to share a single key/value head, reducing memory bandwidth during autoregressive decoding."},
        {"id": "tf-5", "text": "What is FlashAttention and how does it speed up transformer training and inference?", "options": ["It quantizes weights to 4-bit integers", "It reorganizes the attention computation into GPU SRAM tiles, avoiding high-latency reads/writes to High Bandwidth Memory (HBM)", "It eliminates backpropagation", "It removes the softmax activation entirely"], "correctAnswer": 1, "explanation": "FlashAttention uses tiling and online softmax to compute exact attention with IO-awareness, drastically speeding up memory transfers."},
    ],
    "Frontend Foundations": [
        {"id": "fs-fe-1", "text": "In JavaScript, what is the key difference between microtasks (Promises, queueMicrotask) and macrotasks (setTimeout, setInterval) in the Event Loop?", "options": ["Microtasks execute before the next macrotask and drain completely before rendering", "Macrotasks execute immediately synchronously", "Microtasks run in a separate Web Worker thread", "There is no functional difference in modern V8 engines"], "correctAnswer": 0, "explanation": "The microtask queue has higher priority than the macrotask queue. After every JS task completes, the engine drains the entire microtask queue before rendering or picking the next macrotask."},
        {"id": "fs-fe-2", "text": "What is a JavaScript closure?", "options": ["A method to close browser tabs programmatically", "A function bundled together with references to its surrounding lexical state (lexical environment)", "A JSON parsing error handler", "A CSS styling boundary"], "correctAnswer": 1, "explanation": "A closure gives an inner function access to an outer function's scope even after the outer function has finished executing."},
        {"id": "fs-fe-3", "text": "Which CSS layout property is best suited for 2-dimensional grid systems with rows and columns?", "options": ["CSS Flexbox", "CSS Grid (`display: grid`)", "Float and Clearfix", "Position: fixed"], "correctAnswer": 1, "explanation": "CSS Grid is a 2-dimensional layout system designed for rows and columns simultaneously, whereas Flexbox is primarily 1-dimensional."},
        {"id": "fs-fe-4", "text": "What does the 'async' attribute on a `<script>` HTML tag do during page load?", "options": ["It executes the script synchronously and blocks DOM parsing", "It downloads the script asynchronously and executes it immediately when ready without blocking HTML parsing", "It defers execution until DOMContentLoaded fires", "It disables JavaScript execution on mobile browsers"], "correctAnswer": 1, "explanation": "'async' fetches the script asynchronously in parallel with HTML parsing and executes it as soon as download completes."},
        {"id": "fs-fe-5", "text": "In modern ES6+, what does the spread operator `...` do when applied to an object `{ ...user, role: 'admin' }`?", "options": ["Mutates the original user object directly", "Creates a shallow clone of the user object with the role property updated/overridden", "Deletes all properties in user", "Converts the object into an array"], "correctAnswer": 1, "explanation": "Object spread creates a shallow copy of properties from `user` and immutably overrides or appends `role: 'admin'` without mutating the original."},
    ],
    "React & State Management": [
        {"id": "fs-react-1", "text": "In React 18+, why should state updates in useEffect avoid missing dependencies in the dependency array?", "options": ["It causes CSS syntax errors", "It leads to stale closures referencing outdated state/props and creates desynchronized state bugs", "It crashes the Webpack build", "It converts functional components to class components"], "correctAnswer": 1, "explanation": "Omitting dependencies causes the effect closure to capture stale variables from previous renders, leading to bugs and race conditions."},
        {"id": "fs-react-2", "text": "What is the primary role of React's Virtual DOM and Reconciliation algorithm (Fiber)?", "options": ["To compile JavaScript to WebAssembly", "To compute minimal DOM mutations by diffing tree changes and batching real DOM updates efficiently", "To manage backend database queries", "To encrypt user cookies"], "correctAnswer": 1, "explanation": "The Virtual DOM allows React to calculate tree diffs in memory and batch the minimal set of expensive real DOM mutations."},
        {"id": "fs-react-3", "text": "When should you use `useCallback` or `useMemo` in a React component?", "options": ["Wrap every single primitive variable and inline function in the app", "To memoize expensive computations or maintain referential equality of callbacks passed to memoized child components", "To perform network API calls", "To trigger re-renders on window resize"], "correctAnswer": 1, "explanation": "useCallback/useMemo prevent unnecessary child re-renders by preserving reference stability of callbacks and memoizing CPU-intensive calculations."},
        {"id": "fs-react-4", "text": "What is the difference between React Context and dedicated state managers like Redux or Zustand?", "options": ["Context is a dependency injection mechanism that can cause all consuming components to re-render; Redux/Zustand offer granular selector subscriptions and middleware", "Context only works on mobile devices", "Redux is built into the React core package", "Context does not support JavaScript objects"], "correctAnswer": 0, "explanation": "Context triggers re-renders across all consumers when its value changes, whereas Zustand/Redux allow selective component subscriptions to specific slices of state."},
        {"id": "fs-react-5", "text": "What is the purpose of React Error Boundaries?", "options": ["To catch JavaScript errors anywhere in their child component tree and display a fallback UI instead of crashing the whole app", "To prevent network 500 errors", "To compile TypeScript interfaces", "To encrypt user passwords"], "correctAnswer": 0, "explanation": "Error boundaries are React components that catch JS errors during rendering, lifecycle methods, and constructors of children, rendering a graceful fallback UI."},
    ],
    "Node.js & Backend Architecture": [
        {"id": "fs-node-1", "text": "Why is Node.js described as 'Single-Threaded, Non-Blocking, and Asynchronous'?", "options": ["It can only run on single-core CPUs and cannot handle network traffic", "Its main execution thread processes the Event Loop while delegating I/O operations to OS kernel threads via libuv", "It compiles all code into static machine binaries", "It runs entirely inside the client browser"], "correctAnswer": 1, "explanation": "Node.js runs user JavaScript on a single thread and offloads heavy file/network I/O tasks to libuv worker threads, preventing the main thread from blocking."},
        {"id": "fs-node-2", "text": "In Express.js middleware, what happens if a middleware function does NOT call `next()` and does NOT send a response (`res.send`)?", "options": ["The server reboots immediately", "The client request hangs indefinitely until connection timeout", "Express throws a 404 error immediately", "The next route handler runs automatically"], "correctAnswer": 1, "explanation": "Express middleware must either end the request-response cycle or invoke `next()` to pass control down the chain; otherwise the request hangs until timeout."},
        {"id": "fs-node-3", "text": "Which HTTP status code should a REST API return when a resource is successfully created via a POST request?", "options": ["200 OK", "201 Created with Location header", "204 No Content", "304 Not Modified"], "correctAnswer": 1, "explanation": "HTTP 201 Created indicates that the request succeeded and resulted in the creation of a new resource."},
        {"id": "fs-node-4", "text": "What is CORS (Cross-Origin Resource Sharing) and why does a browser enforce it?", "options": ["A server compression algorithm to speed up downloads", "A browser security mechanism that restricts web pages from making AJAX requests to a different domain unless permitted by server headers", "A database encryption standard", "An authentication protocol replacing OAuth"], "correctAnswer": 1, "explanation": "CORS prevents malicious websites from reading sensitive cross-origin data by enforcing strict HTTP response header checks (`Access-Control-Allow-Origin`)."},
        {"id": "fs-node-5", "text": "What is the purpose of connection pooling in Node.js backend services connecting to PostgreSQL?", "options": ["To avoid the high TCP handshake and authentication overhead of opening a new DB connection per incoming API request", "To make SQL queries execute in parallel on client devices", "To eliminate the need for SQL passwords", "To convert PostgreSQL into MongoDB"], "correctAnswer": 0, "explanation": "Connection pools maintain an active pool of open database connections that can be borrowed and released rapidly, preventing database saturation and connection lag."},
    ],
    "Databases & PostgreSQL": [
        {"id": "fs-db-1", "text": "In PostgreSQL and relational databases, what does the 'ACID' acronym stand for?", "options": ["Asynchronous, Concurrent, Indexed, Distributed", "Atomicity, Consistency, Isolation, Durability", "Authentication, Compression, Integrity, Decryption", "Allocation, Clustering, Inheritance, Deletion"], "correctAnswer": 1, "explanation": "ACID guarantees reliable database transaction processing: Atomicity (all-or-nothing), Consistency (rules enforced), Isolation (concurrent safety), and Durability (persisted)."},
        {"id": "fs-db-2", "text": "Why are B-Tree indexes standard for column lookups in PostgreSQL, and when might an index degrade performance?", "options": ["B-Trees are only used for text strings; they never affect write speed", "They provide O(log n) lookup/range searches, but every INSERT/UPDATE/DELETE requires updating index pages, increasing write overhead", "They replace system RAM entirely", "They prevent tables from holding more than 1,000 rows"], "correctAnswer": 1, "explanation": "B-Tree indexes provide fast logarithmic lookups and range scans, but excessive indexes incur write amplification on every insert and update."},
        {"id": "fs-db-3", "text": "What is the N+1 query problem when using ORMs (like Prisma, TypeORM, or Sequelize)?", "options": ["When a query takes N+1 seconds to run", "When an ORM executes 1 query to fetch a parent list and then executes N separate queries to fetch related child records instead of using a JOIN", "When database connection pools exceed N+1 connections", "When primary keys exceed 32-bit integers"], "correctAnswer": 1, "explanation": "The N+1 problem occurs when fetching N parent rows triggers N additional queries for child relationships rather than batching or using an eager SQL JOIN."},
        {"id": "fs-db-4", "text": "What is the difference between `INNER JOIN` and `LEFT JOIN` in SQL?", "options": ["INNER JOIN only returns matching rows from both tables; LEFT JOIN returns all rows from the left table and NULLs for non-matching right rows", "LEFT JOIN only returns rows where right table is null", "INNER JOIN runs slower on indexed tables", "There is no difference in modern query planners"], "correctAnswer": 0, "explanation": "An INNER JOIN requires matches in both tables, whereas a LEFT JOIN preserves all rows from the left table regardless of whether matches exist in the right table."},
        {"id": "fs-db-5", "text": "What is Database Normalization (3NF)?", "options": ["Converting tables into flat single CSV files", "Structuring a relational schema to minimize data redundancy and eliminate insertion, update, and deletion anomalies", "Encrypting database disk partitions", "Partitioning tables across geographic regions"], "correctAnswer": 1, "explanation": "3NF ensures every non-key column depends solely on the primary key, eliminating duplicate data and consistency anomalies."},
    ],
    "Full Stack Development": [
        {"id": "fs-all-1", "text": "Where should sensitive JWT (JSON Web Token) refresh tokens be stored on the client to mitigate XSS (Cross-Site Scripting) token theft?", "options": ["In JavaScript `localStorage`", "In an `HttpOnly`, `Secure`, `SameSite=Strict` HTTP cookie", "In a public URL query parameter", "In a client-side global window variable"], "correctAnswer": 1, "explanation": "HttpOnly cookies cannot be accessed via JavaScript (`document.cookie`), shielding sensitive refresh tokens from malicious XSS script extraction."},
        {"id": "fs-all-2", "text": "What is the difference between WebSockets and standard HTTP REST polling for real-time applications?", "options": ["WebSockets require reloading the browser page", "WebSockets maintain a persistent, bidirectional, full-duplex TCP connection over a single socket, eliminating HTTP request header overhead", "HTTP polling uses less server bandwidth in all real-time scenarios", "WebSockets cannot transmit JSON data"], "correctAnswer": 1, "explanation": "WebSockets establish a single persistent duplex connection for low-latency bidirectional messaging without HTTP connection handshake overhead per message."},
        {"id": "fs-all-3", "text": "What is the primary mechanism of CSRF (Cross-Site Request Forgery) attacks, and how do Anti-CSRF tokens defend against them?", "options": ["Malicious sites tricking the user's browser into submitting unauthorized requests with automatic cookies; Anti-CSRF secret tokens validate request origin explicitly", "Intercepting Wi-Fi traffic", "Brute-forcing database passwords", "Injecting SQL commands via input fields"], "correctAnswer": 0, "explanation": "CSRF exploits automatic browser cookie transmission. Unpredictable anti-CSRF tokens passed via custom headers verify that requests originate from legitimate client views."},
        {"id": "fs-all-4", "text": "What is Docker Containerization in full-stack application deployment?", "options": ["A hardware virtualization system replacing the operating system kernel", "Packaging application code with all dependencies, runtime, and system libraries into an immutable, isolated, reproducible container", "A cloud storage bucket service", "A JavaScript bundler like Webpack"], "correctAnswer": 1, "explanation": "Docker packages code and all dependencies into lightweight isolated containers that run consistently across development, staging, and production environments."},
        {"id": "fs-all-5", "text": "Why are CDN (Content Delivery Network) edge servers used for frontend asset hosting?", "options": ["They execute server-side Node.js code only", "They cache static assets (HTML, JS, CSS, images) geographically close to end users, reducing latency and TTFB", "They replace backend databases", "They generate SSL certificates automatically without DNS"], "correctAnswer": 1, "explanation": "CDNs distribute static cached assets to edge nodes worldwide, drastically minimizing round-trip network latency for end users."},
    ],
}

# ---------------------------------------------------------------------------
# LLM Builder
# ---------------------------------------------------------------------------

def _get_llm(temperature: float = 0.5) -> Optional[ChatOpenAI]:
    """Build a LangChain ChatOpenAI instance using configured backend environment."""
    settings = get_settings()
    if not settings.OPENAI_API_KEY:
        return None
    return ChatOpenAI(
        model="gpt-4.1-nano",
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE_URL,
        temperature=temperature,
        max_tokens=1500,
    )


# ---------------------------------------------------------------------------
# 1. Deterministic Priority Engine with Topic Drill-Down
# ---------------------------------------------------------------------------

def calculate_todays_focus(
    stages: list[dict[str, Any]],
    user_skills: list[dict[str, Any]],
    user_name: str = "Learner",
    target_role: str = "AI/ML Engineer",
    topic_progress: Optional[list[dict[str, Any]]] = None,
) -> TodaysFocus:
    """
    Deterministically computes Today's Focus based on:
    1. Skill weakness gap (100 - mastery)
    2. Current stage relevance bonus (+15)
    3. Prerequisite blocking bonus (+30)
    4. Critical mastery threshold (<30: +20, <50: +10)
    5. Topic-level drill-down (if sub-topic progress is available)
    """
    # 1. Identify current stage and next stage
    current_stage = next((s for s in stages if s.get("status") == "IN_PROGRESS"), None)
    next_stage = next((s for s in stages if s.get("status") == "NOT_STARTED"), None)

    # 2. Build skill lookup map
    skill_map = {s["name"].lower(): s for s in user_skills}

    scored_candidates = []

    # Score skills in current stage
    if current_stage:
        for skill_name in current_stage.get("skills", []):
            skill = skill_map.get(skill_name.lower())
            if not skill:
                continue

            progress = skill.get("progress", 0)
            if progress >= 90:  # Skip mastered skills
                continue

            # Composite Score Formula
            gap_score = (100 - progress) * 0.5
            stage_bonus = 15
            blocking_bonus = 30 if next_stage else 0

            critical_bonus = 0
            if progress < 30:
                critical_bonus = 20
            elif progress < 50:
                critical_bonus = 10

            unverified_bonus = 5 if not skill.get("is_verified", False) else 0

            total_score = gap_score + stage_bonus + blocking_bonus + critical_bonus + unverified_bonus

            reason = (
                f"Prerequisite for upcoming '{next_stage['title']}' stage with a {100 - progress}% mastery gap"
                if next_stage and blocking_bonus > 0
                else f"Part of your active '{current_stage['title']}' stage — needs focused practice"
            )

            scored_candidates.append({
                "skill": skill["name"],
                "skill_id": skill["id"],
                "domain": skill.get("domain", "Core Skills"),
                "mastery": progress,
                "score": total_score,
                "reason": reason,
                "blocks_stage": next_stage["title"] if next_stage else None,
            })

    # If no candidates in current stage, score next stage
    if not scored_candidates and next_stage:
        for skill_name in next_stage.get("skills", []):
            skill = skill_map.get(skill_name.lower())
            if not skill:
                continue
            progress = skill.get("progress", 0)
            if progress >= 90:
                continue

            gap_score = (100 - progress) * 0.5
            scored_candidates.append({
                "skill": skill["name"],
                "skill_id": skill["id"],
                "domain": skill.get("domain", "Core Skills"),
                "mastery": progress,
                "score": gap_score + 10,
                "reason": f"Foundational preparation for next stage: '{next_stage['title']}'",
                "blocks_stage": None,
            })

    # Fallback to lowest overall skill if nothing matched
    if not scored_candidates:
        active_skills = [s for s in user_skills if s.get("progress", 0) < 90]
        if active_skills:
            active_skills.sort(key=lambda s: s.get("progress", 0))
            weakest = active_skills[0]
            scored_candidates.append({
                "skill": weakest["name"],
                "skill_id": weakest["id"],
                "domain": weakest.get("domain", "General"),
                "mastery": weakest.get("progress", 0),
                "score": 50,
                "reason": f"Identified as your lowest mastery competency ({weakest.get('progress', 0)}%)",
                "blocks_stage": None,
            })
        else:
            return TodaysFocus(
                domain="Mathematics & Statistics",
                skill="Calculus",
                skill_id="s5",
                topic=None,
                priority="HIGH",
                mastery=30,
                estimated_minutes=45,
                reason="Core foundation for machine learning optimization",
                blocks_stage="Machine Learning",
            )

    # Sort by priority score descending
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    top = scored_candidates[0]

    # Topic-level drill-down: check if subtopics exist and if topic_progress has a weaker subtopic
    selected_topic = None
    if topic_progress:
        # Find weakest subtopic for this skill
        matching_topics = [t for t in topic_progress if t.get("skill_id") == top["skill_id"]]
        if matching_topics:
            matching_topics.sort(key=lambda t: t.get("mastery", 100))
            weakest_topic = matching_topics[0]
            if weakest_topic.get("mastery", 100) < top["mastery"]:
                selected_topic = weakest_topic.get("topic")

    if not selected_topic and top["skill"] in TOPIC_HIERARCHY:
        # Pick the first recommended subtopic
        selected_topic = TOPIC_HIERARCHY[top["skill"]][0]

    # Priority tier
    priority_tier: Any = "HIGH" if top["score"] >= 60 else "MEDIUM" if top["score"] >= 35 else "LOW"

    # Estimated time
    est_mins = 60 if top["mastery"] < 30 else 45 if top["mastery"] < 60 else 30

    return TodaysFocus(
        domain=top["domain"],
        skill=top["skill"],
        skill_id=top["skill_id"],
        topic=selected_topic,
        priority=priority_tier,
        mastery=top["mastery"],
        estimated_minutes=est_mins,
        reason=top["reason"],
        blocks_stage=top["blocks_stage"],
    )


# ---------------------------------------------------------------------------
# 2. Secure Prompt Builders & LLM Invocation
# ---------------------------------------------------------------------------

def build_mentor_system_prompt(
    user_name: str,
    target_role: str,
    current_stage: str,
    focus: TodaysFocus,
    mode: str,
) -> str:
    """Builds a strictly controlled, educational mentor system prompt."""
    return f"""You are **PathAI AI Mentor**, an elite, encouraging, and highly technical AI career tutor for {user_name}, who is training to become a **{target_role}**.

## LEARNER PROFILE & REAL-TIME CONTEXT:
- **Learner Name:** {user_name}
- **Target Role:** {target_role}
- **Current Roadmap Stage:** {current_stage}
- **Today's Focus Skill:** {focus.skill} ({focus.mastery}% mastery)
- **Sub-Topic Focus:** {focus.topic or 'Core Concepts'}
- **Focus Domain:** {focus.domain}
- **Priority Reason:** {focus.reason}
- **Active Mode:** {mode.upper()}

## OPERATIONAL GUIDELINES:
1. **Teaching Tone:** Structured, encouraging, concise, and pedagogically sound. Use bullet points and bold highlights for readability.
2. **Context-Anchored:** Relate your explanations directly to the learner's goal of becoming a {target_role} and why this specific skill is critical.
3. **No Hallucinated Progress:** Never claim the learner completed an assessment or stage unless recorded. Stick strictly to their actual mastery ({focus.mastery}%).
4. **Mode Behavior:**
   - **LEARN:** Explain concepts clearly at the learner's current mastery ({focus.mastery}%). Use intuitive analogies, followed by technical rigor and practical examples.
   - **PRACTICE:** Provide targeted practice exercises, interactive challenges, and step-by-step problem walkthroughs.
   - **ASSESS:** Challenge their understanding with focused conceptual questions and explain why answers are right or wrong.
5. **Length:** Keep responses concise and focused (150-300 words).
6. **Mathematical Clarity:** When presenting formulas or mathematical terms, write them in clean, intuitive notation (e.g. `12x² + 4`, `dL/dw = (dL/dy) * (dy/dw)`, `θ ← θ - α∇L`) instead of raw backslash LaTeX markup like `\(...\)` or `\[...\]`.
"""


async def generate_mentor_reply(
    user_message: str,
    history: list[dict[str, str]],
    user_name: str,
    target_role: str,
    current_stage: str,
    focus: TodaysFocus,
    mode: str = "learn",
) -> tuple[str, list[str]]:
    """Generates an AI mentor response using LangChain LLM with fallback."""
    llm = _get_llm(temperature=0.5)

    if not llm:
        return _fallback_mentor_reply(user_message, focus, mode, target_role)

    try:
        system_prompt = build_mentor_system_prompt(
            user_name=user_name,
            target_role=target_role,
            current_stage=current_stage,
            focus=focus,
            mode=mode,
        )

        messages: list[Any] = [SystemMessage(content=system_prompt)]

        # Add recent conversation history (max 8 messages for controlled context window)
        for msg in history[-8:]:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content", "")))

        messages.append(HumanMessage(content=user_message))

        response = await llm.ainvoke(messages)
        reply_text = response.content

        suggested_actions = [
            f"Practice {focus.skill}",
            f"Take {focus.skill} Quiz",
            "Why is this skill important?",
        ]

        return reply_text, suggested_actions

    except Exception as e:
        logger.error("LLM mentor generation failed, using fallback: %s", e)
        return _fallback_mentor_reply(user_message, focus, mode, target_role)


def _fallback_mentor_reply(
    message: str,
    focus: TodaysFocus,
    mode: str,
    target_role: str,
) -> tuple[str, list[str]]:
    """Deterministic fallback when LLM API is unavailable."""
    lower = message.lower()

    if "study today" in lower or "what should i study" in lower:
        text = (
            f"Based on your current progress, I recommend focusing on **{focus.skill}** today.\n\n"
            f"📊 **Current Mastery:** {focus.mastery}%\n"
            f"⏱️ **Estimated Session:** {focus.estimated_minutes} min\n"
            f"📌 **Priority Tier:** {focus.priority}\n\n"
            f"**Why this topic?** {focus.reason}.\n\n"
            f"Would you like to start with an intuitive conceptual breakdown or dive directly into practice problems?"
        )
    elif "weakest" in lower or "weak" in lower:
        text = (
            f"Your most critical area for improvement is **{focus.skill}** with **{focus.mastery}% mastery** in {focus.domain}.\n\n"
            f"{f'⚠️ This is currently a direct prerequisite blocker for **{focus.blocks_stage}**.' if focus.blocks_stage else ''}\n\n"
            f"Here is how to master it:\n"
            f"1. **Foundations:** Review core theory and intuition\n"
            f"2. **Practice:** Solve 3 targeted exercises\n"
            f"3. **Validate:** Complete the 5-question assessment to update your verified score"
        )
    elif "why" in lower and "important" in lower:
        text = (
            f"**Why is {focus.skill} vital for a {target_role}?**\n\n"
            f"{focus.skill} forms the mathematical and structural backbone of modern AI systems. "
            f"Mastering it enables you to debug architectures, optimize models, and implement state-of-the-art algorithms."
        )
    else:
        text = (
            f"You're currently exploring **{focus.skill}** ({focus.mastery}% mastery) in the **{focus.domain}** domain.\n\n"
            f"At your current mastery level, focusing on practical implementation will yield the highest return. "
            f"Click **Practice** or **Assess** to test your knowledge!"
        )

    return text, [f"Practice {focus.skill}", "Test my understanding", "Explain next roadmap stage"]


# ---------------------------------------------------------------------------
# 3. Practice & Assessment Generator
# ---------------------------------------------------------------------------

async def generate_practice_exercise(
    focus: TodaysFocus,
    target_role: str,
) -> dict[str, Any]:
    """Generates a practice problem tailored to the focus topic and mastery."""
    llm = _get_llm(temperature=0.4)

    difficulty = "Beginner" if focus.mastery < 35 else "Intermediate" if focus.mastery < 65 else "Advanced"

    if llm:
        try:
            prompt = f"""Generate a practical coding/conceptual exercise for a {target_role} learning **{focus.skill}** (specifically on **{focus.topic or 'core concepts'}**).
Difficulty: {difficulty} (Current learner mastery is {focus.mastery}%).

Return ONLY valid JSON matching this schema:
{{
  "exercise_prompt": "Clear problem statement and requirements",
  "difficulty": "{difficulty}",
  "hints": ["Hint 1", "Hint 2"],
  "starter_code": "Python starter code template or null"
}}"""
            res = await llm.ainvoke([HumanMessage(content=prompt)])
            parser = JsonOutputParser()
            parsed = parser.parse(res.content)
            return {
                "topic": focus.topic or focus.skill,
                "skill": focus.skill,
                "exercise_prompt": parsed.get("exercise_prompt", ""),
                "difficulty": difficulty,
                "hints": parsed.get("hints", []),
                "starter_code": parsed.get("starter_code"),
            }
        except Exception as e:
            logger.warning("LLM practice generation failed, using template: %s", e)

    # Deterministic fallback practice
    return {
        "topic": focus.topic or focus.skill,
        "skill": focus.skill,
        "exercise_prompt": (
            f"**Practice Challenge: {focus.skill} ({difficulty})**\n\n"
            f"Explain and implement a solution demonstrating {focus.topic or focus.skill} in Python. "
            f"Ensure you handle edge cases and optimize for computational efficiency."
        ),
        "difficulty": difficulty,
        "hints": [
            f"Review standard operations in {focus.skill}",
            "Start by identifying inputs, constraints, and expected output shapes",
        ],
        "starter_code": f"# Starter code for {focus.skill}\nimport numpy as np\n\ndef solution():\n    pass\n",
    }


async def generate_assessment_questions(
    focus: TodaysFocus,
    count: int = 5,
) -> tuple[list[dict[str, Any]], list[AssessmentQuestionClient]]:
    """
    Generates assessment questions.
    Returns:
    - server_questions: contains correctAnswer and explanation (KEPT ON SERVER)
    - client_questions: stripped of answers (SAFE TO RETURN TO CLIENT)
    """
    # Check if curated bank has questions for this skill or topic (with fuzzy matching)
    target_bank = QUESTION_BANK.get(focus.skill) or QUESTION_BANK.get(focus.topic)

    if not target_bank:
        skill_lower = f"{focus.skill} {focus.topic or ''} {focus.domain}".lower()
        if any(k in skill_lower for k in ["react", "component", "redux", "zustand", "hooks"]):
            target_bank = QUESTION_BANK.get("React & State Management")
        elif any(k in skill_lower for k in ["frontend", "javascript", "dom", "html", "css"]):
            target_bank = QUESTION_BANK.get("Frontend Foundations")
        elif any(k in skill_lower for k in ["node", "express", "backend", "rest", "api"]):
            target_bank = QUESTION_BANK.get("Node.js & Backend Architecture")
        elif any(k in skill_lower for k in ["database", "postgres", "sql", "orm", "prisma"]):
            target_bank = QUESTION_BANK.get("Databases & PostgreSQL")
        elif any(k in skill_lower for k in ["full stack", "fullstack", "web app"]):
            target_bank = QUESTION_BANK.get("Full Stack Development")
        elif any(k in skill_lower for k in ["embedded c", "pointer", "c/c++", "firmware"]):
            target_bank = QUESTION_BANK.get("Embedded C/C++ Programming")
        elif any(k in skill_lower for k in ["arm", "cortex", "nvic", "systick", "interrupt"]):
            target_bank = QUESTION_BANK.get("ARM Cortex-M Architecture, Registers & Interrupts")
        elif any(k in skill_lower for k in ["microcontroller", "peripheral", "gpio"]):
            target_bank = QUESTION_BANK.get("Microcontroller Architecture")
        elif any(k in skill_lower for k in ["freertos", "rtos", "i2c", "spi"]):
            target_bank = QUESTION_BANK.get("Embedded Systems")
        elif any(k in skill_lower for k in ["transformer", "attention", "llm"]):
            target_bank = QUESTION_BANK.get("Transformers")

    server_questions: list[dict[str, Any]] = []

    if target_bank and len(target_bank) >= 2:
        server_questions = target_bank[:count]
    else:
        # Generate with LLM if available
        llm = _get_llm(temperature=0.3)
        if llm:
            try:
                prompt = f"""Generate {count} multiple-choice assessment questions testing **{focus.skill}** (topic: **{focus.topic or 'core concepts'}**).
Target mastery: {focus.mastery}%.

Return ONLY valid JSON:
{{
  "questions": [
    {{
      "id": "q1",
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why Option A is correct"
    }}
  ]
}}"""
                res = await llm.ainvoke([HumanMessage(content=prompt)])
                parser = JsonOutputParser()
                parsed = parser.parse(res.content)
                server_questions = parsed.get("questions", [])
            except Exception as e:
                logger.warning("LLM assessment generation failed, using fallback: %s", e)

    if not server_questions:
        # Ultimate fallback
        server_questions = [
            {
                "id": "gen-1",
                "text": f"What is the primary role of {focus.skill} in AI/ML applications?",
                "options": [
                    "Data visualization only",
                    f"Providing algorithmic and computational foundations for {focus.domain}",
                    "Hardware acceleration",
                    "Database schema migrations",
                ],
                "correctAnswer": 1,
                "explanation": f"{focus.skill} provides core theoretical and computational structures required in {focus.domain}.",
            },
            {
                "id": "gen-2",
                "text": f"When evaluating proficiency in {focus.skill}, which practice is most critical?",
                "options": [
                    "Memorizing documentation without coding",
                    "Testing with diverse real-world edge cases and quantitative metrics",
                    "Using third-party APIs without understanding internals",
                    "Skipping mathematical proofs",
                ],
                "correctAnswer": 1,
                "explanation": "Quantitative validation against edge cases ensures reliable production model performance.",
            },
        ]

    # Build client-safe question list (NO correctAnswer, NO explanation)
    client_questions = [
        AssessmentQuestionClient(
            id=q["id"],
            text=q["text"],
            options=q["options"],
        )
        for q in server_questions
    ]

    return server_questions, client_questions


# ---------------------------------------------------------------------------
# 4. Authoritative Server-Side Grading & Mastery Adaptation
# ---------------------------------------------------------------------------

def grade_assessment(
    server_questions: list[dict[str, Any]],
    user_answers: list[int],
    previous_mastery: int,
    skill_name: str = "Topic",
    target_role: str = "Engineer",
) -> tuple[int, list[QuestionResult], int, str]:
    """
    Authoritative server-side grading with personalized diagnostic analysis and study recommendations.
    Formula: new_mastery = min(100, round(previous_mastery * 0.4 + score * 0.6))
    """
    total = len(server_questions)
    correct_count = 0
    results: list[QuestionResult] = []
    missed_concepts: list[str] = []

    for idx, q in enumerate(server_questions):
        user_sel = user_answers[idx] if idx < len(user_answers) else -1
        correct_idx = q.get("correctAnswer", 0)
        is_correct = user_sel == correct_idx
        q_explanation = q.get("explanation", "Review the underlying architectural concepts.")

        if is_correct:
            correct_count += 1
        else:
            q_text = q.get("text", f"Question {idx+1}")
            # Extract concept snippet
            missed_concepts.append(f"• **Q{idx+1}**: {q_explanation}")

        results.append(
            QuestionResult(
                question_id=q.get("id", f"q-{idx}"),
                correct=is_correct,
                selected_option=user_sel,
                correct_option=correct_idx,
                explanation=q_explanation,
            )
        )

    score_percent = round((correct_count / max(1, total)) * 100)

    # Weighted adaptive mastery formula
    new_mastery = min(100, round(previous_mastery * 0.4 + score_percent * 0.6))

    # Comprehensive Diagnostic Feedback & Study Recommendations
    if score_percent == 100:
        feedback = (
            f"🎉 **Perfect Mastery!** You scored **{score_percent}%** ({correct_count}/{total} correct).\n\n"
            f"✅ **Verified Strengths:** You demonstrated full competency across all evaluated topics for **{skill_name}**.\n"
            f"📈 **Progress Update:** Your mastery score has increased to **{new_mastery}%**.\n\n"
            f"🚀 **Next Recommended Step:** Proceed to the next curriculum milestone to advance your **{target_role}** career path."
        )
    elif score_percent >= 60:
        feedback = (
            f"👍 **Solid Progress!** You scored **{score_percent}%** ({correct_count}/{total} correct).\n\n"
            f"📈 **Mastery Update:** Your verified score is now **{new_mastery}%**.\n\n"
            f"🔍 **Identified Areas for Improvement:**\n"
            + "\n".join(missed_concepts) + "\n\n"
            f"📚 **Personalized Study Plan:**\n"
            f"1. **Targeted Review:** Study the specific edge cases noted above in your curriculum resources.\n"
            f"2. **Documentation & Architecture:** Revisit register/protocol specifications relevant to **{skill_name}**.\n"
            f"3. **Re-Assessment:** Retake this assessment once you've reviewed the concepts to push your mastery above 80%."
        )
    else:
        feedback = (
            f"⚠️ **Assessment Completed — Knowledge Gaps Identified**\n\n"
            f"Score: **{score_percent}%** ({correct_count}/{total} correct). Current Mastery: **{new_mastery}%**.\n\n"
            f"🚨 **Where You Are Lacking:**\n"
            + ("\n".join(missed_concepts) if missed_concepts else "• Foundational principles need review.") + "\n\n"
            f"📖 **What You Need to Study for {target_role}:**\n"
            f"1. **Foundational Principles:** Dedicate 1–2 study sessions to core syntax, memory layouts, and protocols for **{skill_name}**.\n"
            f"2. **Curated Resources:** Open the curated course & documentation linked in this stage's panel.\n"
            f"3. **Ask AI Mentor:** Use the prompt chips below to ask: *'Explain my weakest skill'* for a step-by-step conceptual walkthrough.\n"
            f"4. **Re-evaluate:** Retake this assessment to demonstrate evidence and unlock downstream milestones."
        )

    return score_percent, results, new_mastery, feedback


# ---------------------------------------------------------------------------
# 5. Database Persistence Helpers (Supabase)
# ---------------------------------------------------------------------------

def _ensure_valid_uuid(val: Optional[str]) -> Optional[str]:
    """Ensures input string is a valid UUID, deterministically converting string IDs if necessary."""
    if not val:
        return None
    try:
        uuid.UUID(str(val))
        return str(val)
    except (ValueError, TypeError, AttributeError):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val)))


async def save_session_to_db(
    user_id: str,
    domain: str,
    skill: str,
    topic: Optional[str],
    roadmap_stage: str,
    mode: str,
) -> str:
    """Creates a new mentor session in Supabase and returns its UUID."""
    valid_uid = _ensure_valid_uuid(user_id)
    fallback_id = str(uuid.uuid4())
    try:
        client = get_supabase_client()
        row = {
            "id": fallback_id,
            "user_id": valid_uid,
            "domain": domain,
            "skill": skill,
            "topic": topic,
            "roadmap_stage": roadmap_stage,
            "mode": mode,
            "status": "active",
        }
        res = client.table("mentor_sessions").insert(row).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]["id"]
    except Exception as e:
        logger.error("Failed to persist mentor session to Supabase: %s", e)
    return fallback_id


async def save_message_to_db(
    session_id: str,
    user_id: str,
    role: str,
    content: str,
    metadata: Optional[dict[str, Any]] = None,
) -> str:
    """Persists a message to Supabase."""
    valid_sid = _ensure_valid_uuid(session_id)
    valid_uid = _ensure_valid_uuid(user_id)
    fallback_id = str(uuid.uuid4())
    try:
        client = get_supabase_client()
        row = {
            "id": fallback_id,
            "session_id": valid_sid,
            "user_id": valid_uid,
            "role": role,
            "content": content,
            "metadata": metadata or {},
        }
        res = client.table("mentor_messages").insert(row).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]["id"]
    except Exception as e:
        logger.error("Failed to persist mentor message: %s", e)
    return fallback_id


async def save_assessment_to_db(
    session_id: Optional[str],
    user_id: str,
    skill: str,
    topic: Optional[str],
    score: int,
    total_questions: int,
    questions_data: list[dict[str, Any]],
    results: list[QuestionResult],
) -> str:
    """Persists assessment record and individual answers to Supabase."""
    valid_sid = _ensure_valid_uuid(session_id) if session_id else None
    valid_uid = _ensure_valid_uuid(user_id)
    assessment_id = str(uuid.uuid4())
    try:
        client = get_supabase_client()
        row = {
            "id": assessment_id,
            "session_id": valid_sid,
            "user_id": valid_uid,
            "skill": skill,
            "topic": topic,
            "score": score,
            "total_questions": total_questions,
            "questions_data": questions_data,
        }
        res = client.table("mentor_assessments").insert(row).execute()
        if res.data and len(res.data) > 0:
            assessment_id = res.data[0]["id"]

        # Insert answers
        answer_rows = [
            {
                "id": str(uuid.uuid4()),
                "assessment_id": assessment_id,
                "question_id": r.question_id,
                "answer": str(r.selected_option),
                "correct": r.correct,
            }
            for r in results
        ]
        if answer_rows:
            client.table("mentor_assessment_answers").insert(answer_rows).execute()

    except Exception as e:
        logger.error("Failed to persist assessment to Supabase: %s", e)

    return assessment_id


async def update_topic_progress_in_db(
    user_id: str,
    skill_id: str,
    skill_name: str,
    domain: str,
    topic: Optional[str],
    new_mastery: int,
    correct_count: int,
) -> None:
    """Upserts learner's topic mastery in Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        row = {
            "user_id": valid_uid,
            "skill_id": skill_id,
            "skill_name": skill_name,
            "domain": domain,
            "topic": topic or "Core",
            "mastery": new_mastery,
            "correct_answers": correct_count,
            "last_assessed_at": datetime.now(timezone.utc).isoformat(),
        }
        client.table("mentor_topic_progress").upsert(
            row, on_conflict="user_id,skill_id,topic"
        ).execute()
    except Exception as e:
        logger.error("Failed to update topic progress in Supabase: %s", e)


async def get_user_topic_progress_from_db(user_id: str) -> list[dict[str, Any]]:
    """Loads all tracked topic masteries for a user from Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = client.table("mentor_topic_progress").select("*").eq("user_id", valid_uid).execute()
        return res.data or []
    except Exception as e:
        logger.error("Failed to load user topic progress: %s", e)
        return []


async def get_active_session_from_db(user_id: str) -> Optional[dict[str, Any]]:
    """Loads the most recent active mentor session for a user from Supabase."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = (
            client.table("mentor_sessions")
            .select("*")
            .eq("user_id", valid_uid)
            .eq("status", "active")
            .order("started_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error("Failed to load active session: %s", e)
    return None


async def get_session_messages_from_db(session_id: str, limit: int = 50) -> list[dict[str, Any]]:
    """Loads message history for a given mentor session."""
    valid_sid = _ensure_valid_uuid(session_id)
    try:
        client = get_supabase_client()
        res = (
            client.table("mentor_messages")
            .select("*")
            .eq("session_id", valid_sid)
            .order("created_at", desc=False)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Failed to load session messages: %s", e)
    return []


async def get_recent_assessments_from_db(user_id: str, limit: int = 5) -> list[dict[str, Any]]:
    """Loads recent assessment records for a user."""
    valid_uid = _ensure_valid_uuid(user_id)
    try:
        client = get_supabase_client()
        res = (
            client.table("mentor_assessments")
            .select("*")
            .eq("user_id", valid_uid)
            .order("completed_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error("Failed to load recent assessments: %s", e)
    return []


_IN_MEMORY_PROFILES: dict[str, dict[str, Any]] = {}

async def get_user_profile_from_db(user_id: str) -> Optional[dict[str, Any]]:
    """Loads user profile record containing target_role and onboarding metadata."""
    valid_uid = _ensure_valid_uuid(user_id)
    if valid_uid in _IN_MEMORY_PROFILES:
        return _IN_MEMORY_PROFILES[valid_uid]
    try:
        client = get_supabase_client()
        res = client.table("profiles").select("*").eq("user_id", valid_uid).limit(1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        logger.error("Failed to load user profile: %s", e)
    return None



