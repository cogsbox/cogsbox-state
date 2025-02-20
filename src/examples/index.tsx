import ReactDOM from "react-dom/client";
import { createCogsState } from "../CogsState";

const { useCogsState } = createCogsState({
    user: {
        name: "",
        todos: [{ id: "1", text: "Learn CogsState", done: false }],
    },
});

function Example() {
    const [state, updater] = useCogsState("user");

    return (
        <div>
            <h1>CogsState Demo</h1>
            <input
                value={state.name}
                onChange={(e) => updater.name.update(e.target.value)}
            />
            <button
                onClick={() =>
                    updater.todos.insert({
                        id: Date.now().toString(),
                        text: "New Todo",
                        done: false,
                    })
                }
            >
                Add Todo
            </button>
            <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Example />);
