export default function ComponentIdRenderer({
    componentId,
}: {
    componentId: string;
}) {
    return (
        <div className="bg-blue-300 flex items-center  px-4 w-full h-full text-white text-sm">
            <h3>{componentId}</h3>
        </div>
    );
}
