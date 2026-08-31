import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodeEditorCanvasProps {
  code: string;
  language?: string;
  filename?: string;
}

// Lightweight syntax highlighting token patterns
function highlightCodeLine(line: string, language: string = 'python'): React.ReactNode[] {
  // If comment line
  const trimmed = line.trimStart();
  if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return [<span key="comment" className="text-slate-400 dark:text-slate-500 italic">{line}</span>];
  }

  // Regex tokenizer
  // Matches: strings, numbers, keywords, function names, built-ins, operators, identifiers
  const tokenRegex = /(f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"[^"\\]*(?:\\.[^"\\]*)*"|f?'[^'\\]*(?:\\.[^'\\]*)*'|#[^\n]*|\/\/[^\n]*|\b(?:def|class|import|from|return|if|elif|else|for|while|in|try|except|finally|with|as|async|await|lambda|yield|pass|break|continue|const|let|var|function|type|interface|enum|public|private|static|export|default|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|GROUP|BY|ORDER|HAVING|LIMIT)\b|\b(?:True|False|None|true|false|null|self|this)\b|\b\d+(?:\.\d+)?\b|\b(?:print|range|len|enumerate|zip|map|filter|int|str|float|list|dict|set|tuple|time|sleep|countdown|exercise)\b|[a-zA-Z_]\w*(?=\s*\()|[^\s\w]+|\s+|\w+)/g;

  const nodes: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  const keywords = new Set([
    'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while',
    'in', 'try', 'except', 'finally', 'with', 'as', 'async', 'await', 'lambda', 'yield',
    'pass', 'break', 'continue', 'const', 'let', 'var', 'function', 'type', 'interface',
    'enum', 'public', 'private', 'static', 'export', 'default', 'SELECT', 'FROM',
    'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'JOIN', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT'
  ]);

  const constants = new Set(['True', 'False', 'None', 'true', 'false', 'null', 'self', 'this']);

  const builtins = new Set([
    'print', 'range', 'len', 'enumerate', 'zip', 'map', 'filter', 'int', 'str', 'float',
    'list', 'dict', 'set', 'tuple', 'time', 'sleep', 'countdown', 'exercise'
  ]);

  while ((match = tokenRegex.exec(line)) !== null) {
    const token = match[0];
    keyIdx++;

    if (token.startsWith('#') || token.startsWith('//')) {
      nodes.push(<span key={keyIdx} className="text-slate-400 dark:text-slate-500 italic">{token}</span>);
    } else if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('f"') && token.endsWith('"')) ||
      (token.startsWith("f'") && token.endsWith("'"))
    ) {
      nodes.push(<span key={keyIdx} className="text-emerald-400 dark:text-emerald-400 font-medium">{token}</span>);
    } else if (keywords.has(token) || keywords.has(token.toUpperCase())) {
      nodes.push(<span key={keyIdx} className="text-purple-400 dark:text-purple-400 font-bold">{token}</span>);
    } else if (constants.has(token)) {
      nodes.push(<span key={keyIdx} className="text-amber-400 dark:text-amber-400 font-semibold">{token}</span>);
    } else if (/^\d+(?:\.\d+)?$/.test(token)) {
      nodes.push(<span key={keyIdx} className="text-orange-400 dark:text-orange-400 font-mono">{token}</span>);
    } else if (builtins.has(token)) {
      nodes.push(<span key={keyIdx} className="text-sky-400 dark:text-sky-400 font-medium">{token}</span>);
    } else if (match[0] && line.charAt(match.index + token.length) === '(') {
      nodes.push(<span key={keyIdx} className="text-blue-300 dark:text-blue-300 font-medium">{token}</span>);
    } else if (/^[{}()[\].,:;=+\-*/%&|^!<>]+$/.test(token)) {
      nodes.push(<span key={keyIdx} className="text-slate-300 dark:text-slate-400 font-semibold">{token}</span>);
    } else {
      nodes.push(<span key={keyIdx} className="text-slate-100 dark:text-slate-100">{token}</span>);
    }
  }

  return nodes.length > 0 ? nodes : [<span key="empty">{line}</span>];
}

export const CodeEditorCanvas: React.FC<CodeEditorCanvasProps> = ({
  code,
  language = 'python',
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  const cleanCode = code.replace(/\r\n/g, '\n').trim();
  const lines = cleanCode.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLang = language.toLowerCase() || 'python';
  const displayFilename = filename || (
    displayLang === 'python' ? 'main.py' :
    displayLang === 'javascript' || displayLang === 'js' ? 'index.js' :
    displayLang === 'typescript' || displayLang === 'ts' ? 'index.ts' :
    displayLang === 'sql' ? 'query.sql' :
    displayLang === 'json' ? 'data.json' :
    'code.txt'
  );

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#0d1117] shadow-xl shadow-black/20 text-slate-100 text-xs font-mono">
      {/* Editor Canvas Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#161b22] border-b border-slate-700/70 select-none">
        <div className="flex items-center gap-2.5">
          {/* Mac/IDE Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          {/* Filename & Language Badge */}
          <div className="flex items-center gap-1.5 text-slate-300 font-sans text-xs">
            <Code2 className="w-3.5 h-3.5 text-[#ea580c]" />
            <span className="font-semibold text-slate-200">{displayFilename}</span>
            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[10px] uppercase font-mono tracking-wider border border-slate-700/60">
              {displayLang}
            </span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-sans font-medium transition-all cursor-pointer active:scale-95"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="p-3.5 overflow-x-auto max-h-[380px] overflow-y-auto leading-relaxed bg-[#0d1117]">
        <table className="w-full border-collapse font-mono text-[12px]">
          <tbody>
            {lines.map((lineContent, index) => (
              <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                {/* Line number */}
                <td className="w-8 pr-3 text-right text-slate-600 select-none font-mono text-[11px] align-top">
                  {index + 1}
                </td>
                {/* Code line content */}
                <td className="whitespace-pre pl-1 text-slate-200">
                  {highlightCodeLine(lineContent, displayLang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
