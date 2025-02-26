import { TriangleAlert } from "lucide-react";
import CodeLine from "../CodeLine";
import { FlashWrapper } from "../FlashOnUpdate";
import { useCogsState } from "./state";

// CartOverviewGet.tsx
export const CartOverviewGet = () => {
  const cart = useCogsState("cart");

  return (
    <FlashWrapper
      color="bg-amber-400"
      componentId={cart._componentId!}
      title="Component Reactive"
    >
      <CodeLine code={`const cart = useCogsState("cart")`} />{" "}
      <div className="h-4" />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.items.get().length`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            {cart.items.get().length}
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.total.get()`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            $ {cart.total.get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
};

export const CartOverviewDep = () => {
  const cart = useCogsState("cart", {
    reactiveType: ["deps"],
    reactiveDeps: (state) => [state.items, state.total, state.status],
  });

  return (
    <FlashWrapper
      color="bg-sky-500"
      componentId={cart._componentId!}
      title={
        <div className="flex gap-2">
          <div className="flex w-6 h-6 items-center justify-center rounded-lg bg-red-500 p-1">
            <TriangleAlert size={30} className="inline-block" />{" "}
          </div>
          Reactive Dependencies
        </div>
      }
    >
      <CodeLine
        code={`  const cart = useCogsState("cart", {
        reactiveType: ["deps"],
        reactiveDeps: (state) => 
        [state.items, state.total, state.status],
    });`}
      />
      <div className="h-4" />

      {/* Updated layout: CodeLine (2/3) and value (1/3) vertically stacked */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.items.get().length`} />
          </div>

          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            {cart.items.get().length}
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.total.get()`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            $ {cart.total.get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
};

export const CartOverviewDepMissing = () => {
  const cart = useCogsState("cart", {
    reactiveType: ["deps"],
    reactiveDeps: (state) => [state.items, state.status],
  });

  return (
    <FlashWrapper
      color="bg-red-500"
      componentId={cart._componentId!}
      title={
        <div className="flex gap-2">
          <div className="flex w-6 h-6 items-center justify-center rounded-lg bg-red-500 p-1">
            <TriangleAlert size={30} className="inline-block" />{" "}
          </div>
          Reactive Dependencies - missing deps
        </div>
      }
    >
      <CodeLine
        code={`  const cart = useCogsState("cart", {
        reactiveType: ["deps"],
        reactiveDeps: (state) => 
        [state.items, state.status],
    });`}
      />
      <div className="h-4" />

      {/* Updated layout: CodeLine (2/3) and value (1/3) vertically stacked */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.items.get().length`} />
          </div>

          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            {cart.items.get().length}
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.total.get()`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            $ {cart.total.get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
};
export const CartOverviewFully = () => {
  const cart = useCogsState("cart", {
    reactiveType: ["all"],
  });

  return (
    <FlashWrapper
      color="bg-gray-500"
      componentId={cart._componentId!}
      title="Fully Reactive"
    >
      <CodeLine
        code={`    const cart = useCogsState("cart", {
        reactiveType: ["all"],
    });`}
      />
      <div className="h-4" />

      {/* Updated layout: CodeLine (2/3) and value (1/3) vertically stacked */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.items.get().length`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            {cart.items.get().length}
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.total.get()`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            $ {cart.total.get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
};

export const CartOverview = () => {
  const cart = useCogsState("cart");

  return (
    <FlashWrapper
      color="bg-emerald-500"
      componentId={cart._componentId!}
      title="Signal Based - $get()"
    >
      <CodeLine code={`const cart = useCogsState("cart")`} />{" "}
      <div className="h-4" />
      {/* Updated layout: CodeLine (2/3) and value (1/3) vertically stacked */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine
              code={`cart.items.$derive((state) => 
    state.length)`}
            />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            {cart.items.$derive((state) => state.length)}
          </div>
        </div>

        <div className="flex w-full">
          <div className="w-2/3">
            <CodeLine code={`cart.total.$get()`} />
          </div>
          <div className="w-1/3 p-1 px-4 text-white  bg-blue-500 rounded">
            $ {cart.total.$get()}
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
};
