import usePigs from "src/hooks/usePigs";
import useToast from "src/hooks/useToast";

export default function Lobby({ room, meId, onStart, onLeave }) {
  const pigs = usePigs();
  const toast = useToast();
  const isHost = room.hostId === meId;
  const link = `${window.location.origin}/play-online/join/${room.code}`;
  const enough = room.players.length >= 2;

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("Could not copy. Please copy it by hand.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <section className="text-center">
        <p className="text-sm text-[#ffffffb0]">
          Share this code with your friends
        </p>
        <p
          className="pri-font text-6xl tracking-widest"
          aria-label={`Room code ${room.code.split("").join(" ")}`}
        >
          {room.code}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => copy(room.code, "Room code copied.")}
            className="rounded border border-[#ffffff80] bg-[#ffffff20] px-4 py-2 font-bold hover:bg-[#ffffff40]"
          >
            Copy code
          </button>
          <button
            onClick={() => copy(link, "Invite link copied.")}
            className="rounded border border-[#ffffff80] bg-[#ffffff20] px-4 py-2 font-bold hover:bg-[#ffffff40]"
          >
            Copy invite link
          </button>
        </div>
      </section>

      <section className="w-full max-w-md" aria-label="Players in this room">
        <h2 className="pri-font mb-2 text-center text-xl">
          Players ({room.players.length}/{room.settings.maxPlayers})
        </h2>
        <ul className="flex flex-col gap-2">
          {room.players.map((player) => (
            <li
              key={player.userId}
              className={`flex items-center gap-3 rounded-lg border border-[#ffffff30] bg-[#ffffff10] p-2 ${
                player.connected ? "" : "opacity-50"
              }`}
            >
              <img
                src={pigs[player.pigIndex % pigs.length]}
                alt=""
                className="h-12 w-12 object-contain"
              />
              <p className="flex-1 font-bold">
                {player.username}
                {player.userId === meId ? " (you)" : ""}
              </p>
              {player.userId === room.hostId && (
                <span className="text-sm text-[#FFEA70]">Host</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-sm text-[#ffffffb0]">
          First to {room.settings.targetScore} points.{" "}
          {room.settings.turnSeconds} seconds per turn.
        </p>
      </section>

      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <>
            <button
              onClick={onStart}
              disabled={!enough}
              className="sec-font rounded bg-[#D30CBD] px-12 py-4 text-xl font-bold duration-300 hover:bg-[#d30cbc] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start game
            </button>
            {!enough && (
              <p className="text-sm">Waiting for at least one more player...</p>
            )}
          </>
        ) : (
          <p className="text-center">
            Waiting for the host to start the game...
          </p>
        )}
        <button onClick={onLeave} className="text-sm underline">
          Leave room
        </button>
      </div>
    </div>
  );
}
