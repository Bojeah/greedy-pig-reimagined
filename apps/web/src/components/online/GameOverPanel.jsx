import { useEffect } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import useAudio from "src/hooks/useAudio";
import celebrationSound from "src/sound_effect/celebration.mp3";

export default function GameOverPanel({ gameOver, meId }) {
  const celebrate = useAudio(celebrationSound);
  const iWon = gameOver?.winnerId === meId;
  const mine = gameOver?.progression?.find((p) => p.userId === meId);

  useEffect(() => {
    if (iWon) celebrate?.play()?.catch(() => {});
  }, [iWon, celebrate]);

  if (!gameOver) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#000000c0] text-white">
        <p role="status">Saving the results...</p>
      </div>
    );
  }

  const winner = gameOver.results.find((r) => r.userId === gameOver.winnerId);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#000000d0] p-4 text-white">
      {iWon && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}
      <section
        className="flex w-full max-w-md flex-col gap-4"
        aria-label="Game results"
      >
        <h2 className="pri-font text-center text-4xl capitalize">
          {gameOver.abandoned
            ? "Game ended early"
            : iWon
              ? "You win!"
              : `${winner?.username} wins`}
        </h2>
        {gameOver.abandoned && (
          <p className="text-center text-sm">
            Too many players left, so no XP was awarded for this game.
          </p>
        )}

        <ol className="flex flex-col gap-2">
          {gameOver.results.map((r) => (
            <li
              key={r.userId}
              className={`flex justify-between rounded-lg border p-3 ${
                r.userId === gameOver.winnerId
                  ? "border-[#FFD700c0] bg-[#FFD70015] text-[#FFEA70]"
                  : "border-[#ffffff40] bg-[#ffffff10]"
              }`}
            >
              <span>
                {r.placement}. {r.username}
                {r.userId === meId ? " (you)" : ""}
              </span>
              <span className="pri-font">{r.finalScore}</span>
            </li>
          ))}
        </ol>

        {mine && (
          <p className="text-center">
            You earned{" "}
            <span className="pri-font text-xl">+{mine.xpGained} XP</span> and
            you are level {mine.level}.
          </p>
        )}

        <Link
          to="/play-online"
          className="sec-font rounded bg-[#d30cbcc0] px-8 py-4 text-center text-xl font-bold duration-300 hover:bg-[#d30cbc]"
        >
          Play again
        </Link>
        <Link to="/leaderboard" className="text-center underline">
          See the leaderboard
        </Link>
        <Link to="/" className="text-center underline">
          Home
        </Link>
      </section>
    </div>
  );
}
