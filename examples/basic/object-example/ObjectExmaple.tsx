"use client";

import React from "react";
import type { StateObject } from "../../../src/CogsState";
import { createCogsState } from "../../../src/CogsState";
import DotPattern from "../DotWrapper";
import { FlashWrapper } from "../FlashOnUpdate";

// --- NEW State Definition: Red & Blue Teams ---
export type Player = {
  id: string | number;
  name: string;
  score: number;
  specialty: "Offense" | "Defense" | "Support";
};

export type GameDashboardState = {
  gameName: string;
  isLive: boolean;
  redTeam: Player[];
  blueTeam: Player[];
};

const initialState: GameDashboardState = {
  gameName: "Cogs Team Battle",
  isLive: true,
  redTeam: [
    { id: 1, name: "Blaze", score: 1500, specialty: "Offense" },
    { id: 2, name: "Rook", score: 900, specialty: "Defense" },
  ],
  blueTeam: [
    { id: 3, name: "Viper", score: 1250, specialty: "Offense" },
    { id: 4, name: "Aegis", score: 1100, specialty: "Support" },
    { id: 5, name: "Ghost", score: 850, specialty: "Defense" },
  ],
};

export const { useCogsState } = createCogsState(
  {
    gameDashboard: initialState,
  },
  { validation: { key: "gameDashboard" } }
);

// --- Main Page Component (Using the original structure) ---
export default function ArrayMethodsPage() {
  return (
    <div className="flex gap-6 p-6 font-mono">
      {/* --- LEFT COLUMN (Master Lists & Controls) --- */}
      <div className="w-3/5 flex flex-col gap-4">
        <DotPattern>
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-200">
              Team Roster Management
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Select a player from either team to edit their stats. All updates
              are granular.
            </p>
          </div>
        </DotPattern>

        <GameDetails />

        <div className="grid grid-cols-2 gap-4">
          {/* We're back to the original, lean component structure */}
          {/* <ItemList title="Red Team" arrayKey="redTeam" color="red" /> */}
          <ItemList title="Blue Team" arrayKey="blueTeam" color="blue" />
        </div>
      </div>

      {/* --- RIGHT COLUMN (Detail Editor) --- */}
      <div className="w-2/5 sticky top-6">
        <ItemDetailForm />
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

function ItemList({
  title,
  arrayKey,
  color,
}: {
  title: string;
  arrayKey: "redTeam" | "blueTeam";
  color: "red" | "blue";
}) {
  const dashboardState = useCogsState("gameDashboard", {
    reactiveType: "none",
  });
  const teamState = dashboardState[arrayKey];

  const handleAddItem = () => {
    teamState.insert(({ uuid }) => ({
      id: uuid,
      name: `New Recruit ${uuid.substring(0, 4)}`,
      score: 0,
      specialty: "Support",
    }));
  };

  // Dynamic classes for team colors
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

  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-3 flex flex-col gap-2 h-full">
        <h3 className={`font-bold text-base ${teamColors[color].text}`}>
          {title}
        </h3>
        <div className="flex-grow space-y-1 overflow-y-auto pr-1">
          {teamState.stateList((_item, itemSetter) => (
            <FlashWrapper key={itemSetter.id.get()}>
              <span className="bg-white">{itemSetter._componentId}</span>
              <button
                onClick={() => itemSetter.setSelected(true)}
                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors duration-150 text-gray-300 cursor-pointer hover:bg-gray-700/70 ${
                  itemSetter._selected
                    ? teamColors[color].selected
                    : "bg-gray-800 hover:bg-gray-700/70"
                }`}
              >
                {/* Simplified: No conditional logic needed, all items are Players */}
                {itemSetter.name.get()}
              </button>
            </FlashWrapper>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-700 flex gap-2">
          <button
            onClick={handleAddItem}
            className={`px-2 py-1 text-xs rounded ${teamColors[color].button}`}
          >
            Add Player
          </button>
          <button
            onClick={() => teamState.cut()}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 cursor-pointer"
          >
            Cut Last
          </button>
        </div>
      </div>
    </FlashWrapper>
  );
}

// --- Right Column Component (Simplified) ---

function ItemDetailForm() {
  const dashboardState = useCogsState("gameDashboard");
  // Check both teams for a selected player
  const selectedPlayer =
    dashboardState.redTeam.getSelected() ||
    dashboardState.blueTeam.getSelected();

  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-bold text-gray-200 text-lg mb-4">Player Editor</h3>
        {!selectedPlayer && (
          <div className="text-gray-500 text-center pt-10">
            Select a player to edit.
          </div>
        )}
        {/* Simplified: One form for any player */}
        {selectedPlayer && <PlayerForm playerState={selectedPlayer} />}
      </div>
    </FlashWrapper>
  );
}

// --- Combined Player Form (With Improved Styling) ---

function PlayerForm({ playerState }: { playerState: StateObject<Player> }) {
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
          {obj.get()}
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
          onClick={() => playerState.setSelected(false)}
          className="px-3 py-1 bg-gray-600/80 text-gray-200 rounded hover:bg-gray-500 text-sm"
        >
          Deselect
        </button>
      </div>
    </div>
  );
}
