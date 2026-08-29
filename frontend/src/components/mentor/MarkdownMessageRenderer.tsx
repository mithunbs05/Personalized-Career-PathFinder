import React from 'react';
import { CodeEditorCanvas } from './CodeEditorCanvas';

interface MarkdownMessageRendererProps {
  content: string;
  isUser?: boolean;
}

// ---------------------------------------------------------------------------
// Unicode Maps for Superscripts, Subscripts, and Mathematical Symbols
// ---------------------------------------------------------------------------

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'j': 'ʲ', 'x': 'ˣ', 'y': 'ʸ',
  'z': 'ᶻ', 'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'k': 'ᵏ', 'm': 'ᵐ', 'p': 'ᵖ', 'r': 'ʳ',
  's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'T': 'ᵀ', 'N': 'ᴺ', 'K': 'ᴷ'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ'
};

const SYMBOL_MAP: Record<string, string> = {
  '\\times': '×',
  '\\cdot': '·',
  '\\bullet': '•',
  '\\pm': '±',
  '\\mp': '∓',
  '\\leq': '≤',
  '\\le': '≤',
  '\\geq': '≥',
  '\\ge': '≥',
  '\\neq': '≠',
  '\\ne': '≠',
  '\\approx': '≈',
  '\\sim': '~',
  '\\propto': '∝',
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Delta': 'Δ',
  '\\Gamma': 'Γ',
  '\\Lambda': 'Λ',
  '\\Sigma': 'Σ',
  '\\Omega': 'Ω',
  '\\Theta': 'Θ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\nabla': '∇',
  '\\partial': '∂',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\int': '∫',
  '\\oint': '∮',
  '\\infty': '∞',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\rightarrow': '→',
  '\\to': '→',
  '\\leftarrow': '←',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',
  '\\circ': '∘',
  '\\quad': '  ',
  '\\qquad': '    ',
  '\\ ': ' ',
  '\\,': ' ',
  '\\;': ' ',
  '\\!': '',
};

/**
 * Converts LaTeX math expressions into clean, human-readable Unicode text
 * Examples:
 *   "12x^2 + 4" -> "12x² + 4"
 *   "\frac{dL}{dw}" -> "dL / dw"
 *   "\theta \leftarrow \theta - \alpha \nabla L" -> "θ ← θ - α∇L"
 */
export function formatMathToUnicode(mathStr: string): string {
  if (!mathStr) return '';

  let text = mathStr.trim();

  // Strip outer \(...\), \[...\], $$, $ if present
  text = text.replace(/^\\\(([\s\S]*?)\\\)$/, '$1');
  text = text.replace(/^\\\[([\s\S]*?)\\\]$/, '$1');
  text = text.replace(/^\$\$([\s\S]*?)\$\$$/, '$1');
  text = text.replace(/^\$([\s\S]*?)\$$/, '$1');
  text = text.trim();

  // 1. Text commands: \text{abc}, \mathrm{abc}, \mathbf{abc}, \mathit{abc}
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|textbf|textit)\{([^}]+)\}/g, '$1');

  // 2. Fractions: \frac{a}{b} -> (a / b)
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)');

  // 3. Square roots: \sqrt{x} -> √(x), \sqrt[n]{x} -> ⁿ√(x)
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)');
  text = text.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // 4. Common symbols replacement
  for (const [latex, unicode] of Object.entries(SYMBOL_MAP)) {
    text = text.replaceAll(latex, unicode);
  }

  // 5. Superscripts with braces: x^{2} or x^{-1}
  text = text.replace(/\^\{([^{}]+)\}/g, (_, chars) => {
    return chars.split('').map((c: string) => SUPERSCRIPT_MAP[c] || c).join('');
  });

  // 6. Single-character superscripts: x^2, x^n
  text = text.replace(/\^([0-9a-zA-Z+\-=()])/g, (_, char) => {
    return SUPERSCRIPT_MAP[char] || `^${char}`;
  });

  // 7. Subscripts with braces: x_{i+1}
  text = text.replace(/_\{([^{}]+)\}/g, (_, chars) => {
    return chars.split('').map((c: string) => SUBSCRIPT_MAP[c] || c).join('');
  });

  // 8. Single-character subscripts: x_i, W_q
  text = text.replace(/_([0-9a-zA-Z+\-=()])/g, (_, char) => {
    return SUBSCRIPT_MAP[char] || `_${char}`;
  });

  // 9. Clean up residual LaTeX braces & redundant backslashes
  text = text.replace(/\\([a-zA-Z]+)/g, '$1');
  text = text.replace(/\{([^{}]+)\}/g, '$1');

  return text;
}

// ---------------------------------------------------------------------------
// Math Badge & Inline Token Parser
// ---------------------------------------------------------------------------

function renderInlineFormattedText(text: string): React.ReactNode[] {
  // Regex to split on:
  // 1. Explicit LaTeX inline math: \( ... \) or $ ... $ (excluding simple money values like $10)
  // 2. Code snippets: `code`
  // 3. Bold: **bold**
  // 4. Italic: *italic*
  const tokenRegex = /(\\\([\s\S]*?\\\)|(?:\$(?!\d+(?:\.\d+)?(?:\s|$))[^$\n]+\$)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const tokens = text.split(tokenRegex);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // Explicit LaTeX inline math: \( ... \) or $ ... $
    if (
      (token.startsWith('\\(') && token.endsWith('\\)')) ||
      (token.startsWith('$') && token.endsWith('$') && token.length > 2)
    ) {
      const cleanMath = formatMathToUnicode(token);
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800/60 font-serif font-semibold text-[13px] tracking-wide shadow-xs"
        >
          {cleanMath}
        </span>
      );
    }

    // Implicit power / math expressions: e.g. "x^2", "12x^2 + 4", "\theta" that might not have delimiters
    if (/\b[a-zA-Z]\^[0-9a-zA-Z]|\\[a-zA-Z]+/.test(token)) {
      const formatted = formatMathToUnicode(token);
      return <span key={idx} className="font-serif">{formatted}</span>;
    }

    // Inline code snippet `code`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#ea580c] dark:text-[#f97316] font-mono text-xs border border-slate-200/80 dark:border-slate-700 font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    // Bold text **bold**
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{token.slice(2, -2)}</strong>;
    }

    // Italic text *italic*
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2 && !token.startsWith('**')) {
      return <em key={idx} className="italic text-slate-700 dark:text-slate-300">{token.slice(1, -1)}</em>;
    }

    // Plain text
    return <span key={idx}>{token}</span>;
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const MarkdownMessageRenderer: React.FC<MarkdownMessageRendererProps> = ({
  content,
  isUser = false,
}) => {
  if (isUser) {
    return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  // 1. First split content by Code Blocks ```lang ... ``` and Block Math \[ ... \] or $$ ... $$
  const blockRegex = /(```[a-zA-Z0-9_-]*\n[\s\S]*?```|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      elements.push(
        <div key={`text-${lastIndex}`} className="space-y-2">
          {renderTextParagraphs(textBefore)}
        </div>
      );
    }

    const blockContent = match[0];

    // Code Block
    if (blockContent.startsWith('```')) {
      const firstNewline = blockContent.indexOf('\n');
      const language = blockContent.slice(3, firstNewline).trim() || 'python';
      const code = blockContent.slice(firstNewline + 1, -3);

      elements.push(
        <CodeEditorCanvas
          key={`code-${match.index}`}
          code={code}
          language={language}
        />
      );
    }
    // Display Math Block \[ ... \] or $$ ... $$
    else {
      const cleanMath = formatMathToUnicode(blockContent);
      elements.push(
        <div
          key={`math-${match.index}`}
          className="my-3 p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 text-amber-300 shadow-md flex flex-col items-center justify-center text-center overflow-x-auto select-all"
        >
          <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest mb-1">
            Mathematical Formula
          </span>
          <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-amber-200 leading-relaxed">
            {cleanMath}
          </span>
        </div>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  const textAfter = content.substring(lastIndex);
  if (textAfter.trim() || elements.length === 0) {
    elements.push(
      <div key={`text-end`} className="space-y-2">
        {renderTextParagraphs(textAfter || content)}
      </div>
    );
  }

  return <div className="space-y-2 leading-relaxed text-sm">{elements}</div>;
};

// ---------------------------------------------------------------------------
// Helper to render text lines, bullets, and numbered items
// ---------------------------------------------------------------------------

function renderTextParagraphs(rawText: string): React.ReactNode[] {
  const paragraphs = rawText.split('\n\n');

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n');

    return (
      <div key={pIdx} className="space-y-1">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Bullet points (•, -, *)
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('** '))) {
            const bulletContent = trimmed.replace(/^[•\-*]\s+/, '');
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] flex-shrink-0 mt-2" />
                <div className="flex-1">{renderInlineFormattedText(bulletContent)}</div>
              </div>
            );
          }

          // Numbered lists (1. , 2. )
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="text-[#ea580c] font-bold text-xs flex-shrink-0 mt-0.5">
                  {numMatch[1]}.
                </span>
                <div className="flex-1">{renderInlineFormattedText(numMatch[2])}</div>
              </div>
            );
          }

          // Empty line spacing
          if (!trimmed) {
            return <div key={lIdx} className="h-1" />;
          }

          return (
            <p key={lIdx} className="leading-relaxed">
              {renderInlineFormattedText(line)}
            </p>
          );
        })}
      </div>
    );
  });
}
