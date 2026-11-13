import { useCallback, useEffect } from "react";
import OnlineDice from "src/components/online/OnlineDice";
import Scoreboard from "src/components/online/Scoreboard";
import TurnTimer from "src/components/online/TurnTimer";
import { describeEvent } from "src/components/online/eventText";
import useAudio from "src/hooks/useAudio";
import diceRollSound from "src/sound_effect/dice_roll.mp3";

export default function GameBoard({
  room,
  meId,
  rolling,
  lastEvent,
  onRoll,
  onBank,
}) {
  const game = room.game;
  const playing = room.status === "PLAYING";
  const isMyTurn = playing && game.currentPlayerId === meId;
  const current = room.players.find((p) => p.userId === game.currentPlayerId);
  const rollSound = useAudio(diceRollSound); // undefined when the sound switch is off

  const handleRoll = useCallback(() => {
    rollSound?.play()?.catch(() => {});
    onRoll();
  }, [rollSound, onRoll]);

  // Keyboard shortcuts: R rolls, B passes (banks).
  useEffect(() => {
    function onKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))
        return;
      if (!isMyTurn || rolling) return;
      if (event.key === "r" || event.key === "R") handleRoll();
      if (event.key === "b" || event.key === "B") onBank();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMyTurn, rolling, handleRoll, onBank]);

  const rollEvent =
    lastEvent && (lastEvent.type === "ROLL" || lastEvent.type === "BUST")
      ? lastEvent
      : null;

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="pri-font text-center text-2xl" aria-live="polite">
        {!playing
          ? "Game over"
          : isMyTurn
            ? "Your turn!"
            : `${current?.username ?? "Someone"}'s turn`}
      </p>

      {playing && (
        <TurnTimer turnEndsAt={game.turnEndsAt} serverTime={room.serverTime} />
      )}

      <OnlineDice
        rolling={rolling}
        value={game.lastRoll}
        eventKey={rollEvent}
      />

      {playing && (
        <p className="text-center text-lg">
          Points this turn:{" "}
          <span className="pri-font text-2xl">{game.turnTotal}</span>
        </p>
      )}

      <div className="flex w-full max-w-md gap-3">
        <button
          onClick={handleRoll}
          disabled={!isMyTurn || rolling}
          aria-keyshortcuts="r"
          className="sec-font flex-1 rounded bg-[#D30CBD] px-6 py-4 text-xl font-bold duration-300 hover:bg-[#d30cbc] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Roll <span className="text-xs opacity-70">(R)</span>
        </button>
        <button
          onClick={onBank}
          disabled={!isMyTurn || rolling}
          aria-keyshortcuts="b"
          className="sec-font flex-1 rounded border border-[#ffffff80] bg-[#ffffff20] px-6 py-4 text-xl font-bold duration-300 hover:bg-[#ffffff40] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pass <span className="text-xs opacity-70">(B)</span>
        </button>
      </div>

      <p className="min-h-[1.5rem] text-center text-sm" aria-live="polite">
        {describeEvent(lastEvent, room.players)}
      </p>

      <div className="w-full max-w-md">
        <Scoreboard room={room} meId={meId} />
      </div>
    </div>
  );
}
