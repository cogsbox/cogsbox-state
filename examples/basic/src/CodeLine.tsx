import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
export default function CodeLine({
  code,
  style,
}: {
  code: string;
  style?: "light" | "dark";
}) {
  return (
    <SyntaxHighlighter
      language="typescript"
      wrapLines={true}
      style={style == "dark" ? vscDarkPlus : undefined}
      customStyle={{
        padding: 4,

        margin: 0,

        width: "100%",
        overflowX: "auto",
        fontSize: "14px",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
