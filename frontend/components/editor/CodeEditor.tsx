'use client';

import { useRef, useCallback } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

// ─── Constants ────────────────────────────────────────────────────────────────

// Canonical boilerplate — single source of truth (imported by DashboardPage)
export const BOILERPLATE: Record<string, string> = {
  python: `# Python 3.11\nprint("Hello, World!")\n`,
  javascript: `// Node.js 20\nconsole.log("Hello, World!");\n`,
  cpp: `// C++17\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`,
};

// Monaco language IDs match your language keys directly — no map needed
const MONACO_LANG: Record<string, string> = {
  python:     'python',
  javascript: 'javascript',
  cpp:        'cpp',
};

const THEME_NAME = 'cloudexecx-dark';

// ─── Custom Monaco theme ──────────────────────────────────────────────────────
// Defined as a constant so it's not recreated on every render.
// Matches the #080c10 design system exactly.

const THEME_DATA: Monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true, // inherit token colors from vs-dark, override only chrome
  rules: [
    // Keywords — blue (matches the code preview on the homepage)
    { token: 'keyword',           foreground: '7dd3fc' },
    { token: 'keyword.control',   foreground: '7dd3fc' },
    // Identifiers & functions — green accent
    { token: 'entity.name.function', foreground: '00ff88' },
    { token: 'support.function',      foreground: '00ff88' },
    // Strings — soft amber, distinct from green
    { token: 'string',            foreground: 'fbbf24' },
    // Numbers
    { token: 'number',            foreground: 'fb923c' },
    // Comments — muted, unobtrusive
    { token: 'comment',           foreground: '2a3f52', fontStyle: 'italic' },
    // Types
    { token: 'entity.name.type',  foreground: '38bdf8' },
    // Operators & punctuation
    { token: 'operator',          foreground: '8ba5be' },
    { token: 'delimiter',         foreground: '4a6177' },
  ],
  colors: {
    // Core surfaces
    'editor.background':              '#080c10',
    'editor.foreground':              '#f0f4f8',
    'editor.lineHighlightBackground': '#0d1520',
    'editor.lineHighlightBorder':     '#00000000', // transparent — no border on active line

    // Selection
    'editor.selectionBackground':          '#00ff8820',
    'editor.inactiveSelectionBackground':  '#00ff8810',
    'editor.selectionHighlightBackground': '#00ff8812',

    // Gutter (line numbers)
    'editorLineNumber.foreground':       '#2a3f52',
    'editorLineNumber.activeForeground': '#4a6177',
    'editorGutter.background':           '#080c10',

    // Cursor
    'editorCursor.foreground': '#00ff88',
    'editorCursor.background': '#080c10',

    // Indent guides
    'editorIndentGuide.background':       '#1a2a3a',
    'editorIndentGuide.activeBackground': '#2a3f52',

    // Scrollbar
    'scrollbarSlider.background':       '#1a2a3a80',
    'scrollbarSlider.hoverBackground':  '#2a3f5280',
    'scrollbarSlider.activeBackground': '#4a617780',

    // Widget backgrounds (autocomplete, hover docs)
    'editorWidget.background':      '#0d1520',
    'editorWidget.border':          '#1a2a3a',
    'editorSuggestWidget.background':       '#0d1520',
    'editorSuggestWidget.border':           '#1a2a3a',
    'editorSuggestWidget.selectedBackground':'#1a2a3a',
    'editorSuggestWidget.highlightForeground':'#00ff88',

    // Find widget
    'editorWidget.foreground': '#8ba5be',

    // Bracket match
    'editorBracketMatch.background': '#00ff8815',
    'editorBracketMatch.border':     '#00ff8840',

    // Peek view (go-to-definition inline)
    'peekView.border':                '#1a2a3a',
    'peekViewEditor.background':      '#080c10',
    'peekViewResult.background':      '#0d1520',
    'peekViewTitle.background':       '#0d1520',
    'peekViewEditor.matchHighlightBackground': '#00ff8820',

    // Overview ruler (right-side minimap lane)
    'editorOverviewRuler.border': '#1a2a3a',

    // Misc
    'editorError.foreground':   '#f87171',
    'editorWarning.foreground': '#fbbf24',
    'editorInfo.foreground':    '#38bdf8',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // Register the custom theme before the editor mounts.
  // beforeMount fires synchronously before the first render — no flash.
  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme(THEME_NAME, THEME_DATA);
  };

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange = useCallback(
    (val: string | undefined) => onChange(val ?? ''),
    [onChange]
  );

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-[#1a2a3a]">
      <Editor
        height="100%"
        language={MONACO_LANG[language] ?? 'plaintext'}
        value={value}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        theme={THEME_NAME}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap:              { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers:          'on',
          glyphMargin:          false,
          folding:              true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars:  3,
          renderLineHighlight:  'all',
          cursorBlinking:             'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling:      true,
          padding:              { top: 16, bottom: 16 },
          automaticLayout:      true,
          tabSize:              4,
          wordWrap:             'on',
          readOnly,
          domReadOnly: readOnly,
          // Hide the "editor is read-only" tooltip when readOnly — it
          // overlaps the run button and gives no useful info in this context
          readOnlyMessage: { value: '' },
        }}
      />
    </div>
  );
}