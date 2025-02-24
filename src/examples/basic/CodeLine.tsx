export default function CodeLine({
    code,
    header,
}: {
    code: string;
    header?: boolean;
}) {
    return (
        <div
            className={`bg-gray-100 rounded-t-lg h-16 px-2 flex items-center font-bold text-sm py-2  mt-0.5 ${
                header && "text-xl"
            }`}
        >
            <code>{code}</code>
        </div>
    );
}
