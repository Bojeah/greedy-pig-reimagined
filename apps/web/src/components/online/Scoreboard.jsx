import usePigs from "src/hooks/usePigs";

export default function Scoreboard({ room, meId }) {
  const pigs = usePigs();
  const game = room.game;
  const target = room.settings.targetScore;

  return (
    <section aria-label="Scoreboard" className="w-full">
      <p className="mb-2 text-center text-sm text-[#ffffffb0]">
        First to {target} points wins
      </p>
      <ul className="flex flex-col gap-2">
        {room.players.map((player) => {
          const isCurrent = game && game.currentPlayerId === player.userId;
          // Like the base game: the shown score is banked points plus this turn's running points.
          const shown = player.score + (isCurrent ? game.turnTotal : 0);
          const percent = Math.min(100, Math.round((shown / target) * 100));
          return (
            <li
              key={player.userId}
              aria-current={isCurrent ? "true" : undefined}
              className={`flex items-center gap-3 rounded-lg border p-2 duration-300 ${
                isCurrent
                  ? "border-[#D30CBD] bg-[#D30CBD25]"
                  : "border-[#ffffff30] bg-[#ffffff10]"
              } ${player.connected ? "" : "opacity-50"}`}
            >
              <img
                src={pigs[player.pigIndex % pigs.length]}
                alt=""
                className="h-12 w-12 object-contain"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-bold">
                    {player.username}
                    {player.userId === meId ? " (you)" : ""}
                    {!player.connected ? " (disconnected)" : ""}
                  </p>
                  <p className="pri-font text-lg">{shown}</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#ffffff20]">
                  <div
                    className="h-full bg-[#D30CBD] duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
