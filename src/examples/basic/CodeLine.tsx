export default function CodeLine({
    code,
    header,
}: {
    code: string;
    header?: boolean;
}) {
    return (
        <div
            className={`bg-gray-200 rounded-t-lg  px-2 flex items-center font-bold text-sm py-2  mt-0.5 ${
                header && "text-xl"
            }`}
        >
            <code>{code}</code>
        </div>
    );
}
