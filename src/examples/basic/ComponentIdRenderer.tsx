export default function ComponentIdRenderer({
    componentId,
}: {
    componentId: string;
}) {
    return (
        <div className="bg-blue-400 rounded p-1 px-4 w-full text-white text-sm">
            <div className=" ">
                <h3>{componentId}</h3>
            </div>
        </div>
    );
}
