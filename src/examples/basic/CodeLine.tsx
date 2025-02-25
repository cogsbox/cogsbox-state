import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function CodeLine({ code }: { code: string }) {
    return (
        <SyntaxHighlighter
            language="typescript"
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
