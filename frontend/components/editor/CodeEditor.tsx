'use client';

import { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

// Language boilerplate templates
const BOILERPLATE: Record<string, string> = {
  python: `# Python 3.11
print("Hello, World!")
`,
  javascript: `// Node.js 20
console.log("Hello, World!");
`,
  cpp: `// C++17
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
};

// Monaco language identifiers
const MONACO_LANG: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
};

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange = useCallback(
    (val: string | undefined) => {
      onChange(val || '');
    },
    [onChange]
  );

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-[var(--border-color)]">
      <Editor
        height="100%"
        language={MONACO_LANG[language] || 'plaintext'}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}

export { BOILERPLATE };
