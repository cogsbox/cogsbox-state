export default function CodeLine({
    code,
    header,
}: {
    code: string;
    header?: boolean;
}) {
    return (
        <div
            className={`bg-gray-100 rounded-lg px-2 felsx items-center  py-1 ${
                header && "text-xl"
            }`}
        >
            <code>{code}</code>
        </div>
    );
}
