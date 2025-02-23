export default function ComponentIdRenderer({
    componentId,
}: {
    componentId: string;
}) {
    return (
        <div className="bg-blue-400 rounded p-2 px-4 w-full">
            <div className=" ">
                <h3>Component Id: {componentId}</h3>
            </div>
        </div>
    );
}
