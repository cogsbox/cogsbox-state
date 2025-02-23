export default function ComponentIdRenderer({
    componentId,
}: {
    componentId: string;
}) {
    return (
        <div className="bg-blue-300 flex items-center  px-2 w-full h-full text-white text-xs">
            <h3>{componentId}</h3>
        </div>
    );
}
