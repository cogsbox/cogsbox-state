import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export function CodeSnippetDisplay({
  title,
  code,
}: {
  title?: string;
  code: string;
}) {
  return (
    <div className="mt-3">
      {title && (
        <h4 className="text-gray-400 text-xm font-semibold mb-1 uppercase tracking-wider">
          {title}
        </h4>
      )}
      <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-800">
        <SyntaxHighlighter
          language="typescript"
          style={atomOneDark}
          customStyle={{
            backgroundColor: 'transparent',
            fontSize: '12px',
            padding: '0.75rem',
            margin: 0,
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
