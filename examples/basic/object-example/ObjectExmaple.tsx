"use client";

import React from "react";
import type { StateObject } from "../../../src/CogsState";
import { createCogsState } from "../../../src/CogsState";
import DotPattern from "../DotWrapper";
import { FlashWrapper } from "../FlashOnUpdate";

// --- IMPORTS for syntax highlighting in the main component ---
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

// --- State Definition with a Flat Player List ---
export type Player = {
  id: string | number;
  name: string;
  score: number;
  specialty: "Offense" | "Defense" | "Support";
  team: "red" | "blue";
};

export type GameDashboardState = {
  gameName: string;
  isLive: boolean;
  players: Player[]; // A single, flat array for all players
};

// --- Initial state now uses the flat structure ---
const initialState: GameDashboardState = {
  gameName: "Cogs Team Battle",
  isLive: true,
  players: [
    { id: 1, name: "Blaze", score: 1500, specialty: "Offense", team: "red" },
    { id: 2, name: "Rook", score: 900, specialty: "Defense", team: "red" },
    { id: 3, name: "Viper", score: 1250, specialty: "Offense", team: "blue" },
    { id: 4, name: "Aegis", score: 1100, specialty: "Support", team: "blue" },
    { id: 5, name: "Ghost", score: 850, specialty: "Defense", team: "blue" },
  ],
};

const newPlayer = {
  id: "...",
  name: "New Recruit",
  score: 0,
  specialty: "Support" as const,
};

export const { useCogsState } = createCogsState(
  {
    gameDashboard: initialState,
  },
  { validation: { key: "gameDashboard" } }
);

// --- Main Page Component ---
export default function ArrayMethodsPage() {
  return (
    <div className="flex gap-6 p-6 font-mono">
      {/* --- LEFT COLUMN (Master Lists & Controls) --- */}
      <div className="w-3/5 flex flex-col gap-4">
        <DotPattern>
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-200">
              Array Method Examples
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Use the buttons to perform granular array operations like insert,
              filter, and cut. The syntax for each operation is shown below the
              controls.
            </p>
          </div>
        </DotPattern>

        <GameDetails />

        <div className="grid grid-cols-2 gap-4">
          <ItemList title="Red Team" color="red" />
          <ItemList title="Blue Team" color="blue" />
        </div>
      </div>

      {/* --- RIGHT COLUMN (Detail Editor & Live State) --- */}
      <div className="w-2/5 sticky top-6 flex flex-col gap-4">
        <div className="h-26" />
        <ItemDetailForm />
        <ShowFullState />
      </div>
    </div>
  );
}

// --- Left Column Components ---

function GameDetails() {
  const rootState = useCogsState("gameDashboard");

  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 flex flex-col gap-4 text-gray-200">
        <h3 className="font-bold text-lg">Game Settings</h3>
        <div className="flex items-center gap-4">
          <label className="form-label w-28">Game Name:</label>
          {rootState.gameName.formElement((obj) => (
            <input {...obj.inputProps} className="form-input" />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="form-label w-28">Is Live:</label>
          {rootState.isLive.formElement((obj) => (
            <input
              type="checkbox"
              className="w-5 h-5 bg-gray-800 border-gray-600 accent-green-500"
              checked={obj.get()}
              onChange={(e) => obj.set(e.target.checked)}
            />
          ))}
        </div>
      </div>
    </FlashWrapper>
  );
}

function ItemList({ title, color }: { title: string; color: "red" | "blue" }) {
  const dashboardState = useCogsState("gameDashboard", {
    reactiveType: "none",
  });

  const handleAddItem = (color: "red" | "blue") => {
    dashboardState.players.insert(({ uuid }) => ({
      ...newPlayer,
      id: uuid,
      team: color,
    }));
  };

  const teamColors = {
    red: {
      selected: "bg-red-800/80 text-white font-semibold ring-2 ring-red-500",
      button: "bg-red-900/80 text-red-200 hover:bg-red-800",
      text: "text-red-400",
    },
    blue: {
      selected: "bg-blue-800/80 text-white font-semibold ring-2 ring-blue-500",
      button: "bg-blue-900/80 text-blue-200 hover:bg-blue-800",
      text: "text-blue-400",
    },
  };

  // --- UPDATED: More concise insert example ---
  const addCode = `dashboardState.players.insert(({ uuid }) => ({
  ...newPlayer, id: uuid, team: "${color}",
}));
  `;

  const cutCode = `dashboardState.players
  .stateFilter((p) => p.team === "${color}")
  .cut();
  `;
  const filterAndRenderCode = `dashboardState.players
  .stateFilter(player => player.team === ${color})`;
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-3 flex flex-col gap-2 h-full">
        <h3 className={`font-bold text-base ${teamColors[color].text}`}>
          {title}
        </h3>{" "}
        <CodeSnippetDisplay title="" code={filterAndRenderCode} />
        <div className="flex-grow space-y-1 overflow-y-auto px-2 p-1">
          {dashboardState.players
            .stateFilter((player) => player.team === color)
            .$stateMap((_item, itemSetter) => (
              <FlashWrapper key={itemSetter.id.get()}>
                <button
                  onClick={() => itemSetter.setSelected(true)}
                  className={`w-full text-left px-2 py-1 rounded text-sm transition-colors duration-150 text-gray-300 cursor-pointer ${
                    itemSetter._selected
                      ? teamColors[color].selected
                      : "bg-gray-800 hover:bg-gray-700/70"
                  }`}
                >
                  {itemSetter.name.get()}
                </button>
              </FlashWrapper>
            ))}
        </div>
        <div className="pt-2 border-t border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => handleAddItem(color)}
              className={`px-2 py-1 text-xs rounded ${teamColors[color].button} cursor-pointer`}
            >
              Add Player
            </button>
            <button
              onClick={() =>
                dashboardState.players
                  .stateFilter((player) => player.team === color)
                  .cut()
              }
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 cursor-pointer"
            >
              Cut Team
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <CodeSnippetDisplay title="Add" code={addCode} />
            <CodeSnippetDisplay title="Cut" code={cutCode} />
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}

// --- Right Column Components ---

function ItemDetailForm() {
  const dashboardState = useCogsState("gameDashboard");
  const selectedPlayer = dashboardState.players.getSelected();

  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-bold text-gray-200 text-lg mb-4">Player Editor</h3>
        {selectedPlayer && (
          <div
            className={`text-white text-center p-2 rounded-md mb-4 text-sm font-semibold ${
              selectedPlayer.team.get() === "red"
                ? "bg-red-500/50"
                : "bg-blue-500/50"
            }`}
          >
            {selectedPlayer.team.get()?.toUpperCase()} TEAM
          </div>
        )}
        {!selectedPlayer && (
          <div className="text-gray-500 text-center pt-10">
            Select a player to edit.
          </div>
        )}
        {selectedPlayer && (
          <PlayerForm
            playerState={selectedPlayer}
            playersArrayState={dashboardState.players}
          />
        )}
      </div>
    </FlashWrapper>
  );
}

function PlayerForm({
  playerState,
  playersArrayState,
}: {
  playerState: StateObject<Player>;
  playersArrayState: StateObject<Player[]>;
}) {
  const formInputClass =
    "block w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-200 focus:ring-1 focus:ring-green-500 focus:outline-none";
  const formLabelClass = "block text-sm font-medium text-gray-400 mb-1";

  return (
    <div className="space-y-4 text-sm">
      <div className="font-semibold text-gray-500">
        Editing Player ID:{" "}
        <span className="text-green-300">{playerState.id.get()}</span>
      </div>

      {playerState.name.formElement((obj) => (
        <div>
          <label className={formLabelClass}>Name</label>
          <input {...obj.inputProps} className={formInputClass} />
        </div>
      ))}

      {playerState.score.formElement((obj) => (
        <div>
          <label className={formLabelClass}>Score</label>
          <input type="number" {...obj.inputProps} className={formInputClass} />
        </div>
      ))}

      {playerState.specialty.formElement((obj) => (
        <div>
          <label className={formLabelClass}>Specialty</label>
          <select
            value={obj.get()}
            onChange={(e) => obj.set(e.target.value as Player["specialty"])}
            className={formInputClass}
          >
            <option>Offense</option>
            <option>Defense</option>
            <option>Support</option>
          </select>
        </div>
      ))}
      <div className="pt-4 mt-4 border-t border-gray-700 flex justify-between items-center">
        <button
          onClick={() => playerState.cut()}
          className="px-3 py-1 bg-red-900/80 text-red-200 rounded hover:bg-red-800 text-sm"
        >
          Cut This Player
        </button>
        <button
          onClick={() => playersArrayState.clearSelected()}
          className="px-3 py-1 bg-gray-600/80 text-gray-200 rounded hover:bg-gray-500 text-sm"
        >
          Deselect
        </button>
      </div>
    </div>
  );
}

// --- Helper Components ---

function CodeSnippetDisplay({ title, code }: { title?: string; code: string }) {
  return (
    <div>
      {title && (
        <h4 className="text-gray-500 text-xs font-semibold mb-1 ml-1">
          {title}
        </h4>
      )}
      <div className="bg-gray-950 rounded overflow-hidden">
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          customStyle={{
            backgroundColor: "transparent",
            fontSize: "11px",
            padding: "0.5rem",
            margin: 0,
          }}
          codeTagProps={{ style: { fontFamily: "inherit" } }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function ShowFullState() {
  const dashboardState = useCogsState("gameDashboard", { reactiveType: "all" });

  return (
    <FlashWrapper>
      <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-3 overflow-hidden">
        <h3 className="text-gray-300 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
          Live Player Array State
        </h3>
        <pre className="text-xs overflow-auto flex-grow text-gray-300">
          {JSON.stringify(dashboardState.players.get(), null, 2)}
        </pre>
      </div>
    </FlashWrapper>
  );
}
