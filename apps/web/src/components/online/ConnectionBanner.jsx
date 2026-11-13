export default function ConnectionBanner({ connection }) {
  if (connection === "connected") return null;
  return (
    <p
      role="alert"
      className="mb-4 rounded border border-[#E71D36] bg-[#E71D3640] p-3 text-center text-sm font-bold"
    >
      {connection === "connecting"
        ? "Connecting to the game server..."
        : "Connection lost. Trying to reconnect..."}
    </p>
  );
}
