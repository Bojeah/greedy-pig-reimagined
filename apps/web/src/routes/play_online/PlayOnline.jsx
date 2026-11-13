import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "src/components/ui/PageShell";
import FormField from "src/components/auth/FormField";
import { apiFetch } from "src/services/api";

export default function PlayOnline() {
  const navigate = useNavigate();

  const [targetScore, setTargetScore] = useState(100);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [turnSeconds, setTurnSeconds] = useState(30);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [code, setCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleCreate(event) {
    event.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const room = await apiFetch("/api/rooms", {
        method: "POST",
        body: {
          targetScore: Number(targetScore),
          maxPlayers: Number(maxPlayers),
          turnSeconds: Number(turnSeconds),
        },
      });
      navigate(`/play-online/room/${room.code}`);
    } catch (err) {
      setCreateError(err.message);
      setCreating(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length !== 5) {
      setJoinError("A room code has 5 characters, for example K7MQ2.");
      return;
    }
    setJoinError("");
    setJoining(true);
    try {
      await apiFetch(`/api/rooms/${encodeURIComponent(cleaned)}`); // checks the room exists
      navigate(`/play-online/room/${cleaned}`);
    } catch (err) {
      setJoinError(err.message);
      setJoining(false);
    }
  }

  return (
    <PageShell title="Play online">
      <div className="grid gap-8 md:grid-cols-2">
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-4 rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-4"
          noValidate
        >
          <h2 className="pri-font text-xl">Create a room</h2>
          <FormField
            id="targetScore"
            label="Score to win"
            type="number"
            min={25}
            max={200}
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="maxPlayers" className="font-bold">
              Players
            </label>
            <select
              id="maxPlayers"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              className="rounded-md border bg-[#222222] p-3 text-white"
            >
              <option value={2}>2 players</option>
              <option value={3}>3 players</option>
              <option value={4}>4 players</option>
            </select>
          </div>
          <FormField
            id="turnSeconds"
            label="Seconds per turn"
            type="number"
            min={15}
            max={60}
            value={turnSeconds}
            onChange={(e) => setTurnSeconds(e.target.value)}
          />
          {createError && (
            <p
              role="alert"
              className="rounded border border-[#E71D36] bg-[#E71D3640] p-3 text-sm"
            >
              {createError}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="sec-font rounded bg-[#D30CBD] px-8 py-3 text-xl font-bold duration-300 hover:bg-[#d30cbc] disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create room"}
          </button>
        </form>

        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4 rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-4"
          noValidate
        >
          <h2 className="pri-font text-xl">Join a room</h2>
          <FormField
            id="roomCode"
            label="Room code"
            hint="Ask your friend for the 5-character code."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={5}
            autoCapitalize="characters"
            autoComplete="off"
          />
          {joinError && (
            <p
              role="alert"
              className="rounded border border-[#E71D36] bg-[#E71D3640] p-3 text-sm"
            >
              {joinError}
            </p>
          )}
          <button
            type="submit"
            disabled={joining}
            className="sec-font rounded bg-[#D30CBD] px-8 py-3 text-xl font-bold duration-300 hover:bg-[#d30cbc] disabled:opacity-60"
          >
            {joining ? "Checking..." : "Join room"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
