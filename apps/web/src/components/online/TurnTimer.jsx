import { useEffect, useState } from "react";

// Counts down to turnEndsAt. It uses serverTime to correct for a wrong clock on the player's phone.
export default function TurnTimer({ turnEndsAt, serverTime }) {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (!turnEndsAt || !serverTime) return undefined;
    const offset = Date.parse(serverTime) - Date.now(); // how far the server's clock is from ours
    const tick = () => {
      const msLeft = Date.parse(turnEndsAt) - (Date.now() + offset);
      setSecondsLeft(Math.max(0, Math.ceil(msLeft / 1000)));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [turnEndsAt, serverTime]);

  if (secondsLeft === null) return null;
  return (
    <p
      className={`pri-font text-center text-2xl ${secondsLeft <= 5 ? "text-[#F17E8C]" : ""}`}
      aria-label={`${secondsLeft} seconds left in this turn`}
    >
      {secondsLeft}s
    </p>
  );
}
