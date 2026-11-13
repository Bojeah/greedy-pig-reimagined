import { useCallback, useEffect, useRef, useState } from "react";
import { useGreedyPigContext } from "src/context/useGreedyPigContext";

const MIN_SPIN_MS = 700; // the dice always spin at least this long, even if the server answers instantly

// Shows a die. It never decides the number: it spins while we wait, then lands on `value`,
// the number the SERVER rolled.
//   rolling:  true while my own roll is waiting for the server
//   eventKey: changes whenever any player's roll arrives (so we also spin for opponents)
export default function OnlineDice({ rolling, value, eventKey }) {
  const { preloadSrcList } = useGreedyPigContext();
  const faces = preloadSrcList.filter((src) => src.includes("dice"));
  const [face, setFace] = useState(value ? value - 1 : 0);
  const [spinning, setSpinning] = useState(false);
  const spinningRef = useRef(false);
  const startedAt = useRef(0);

  const startSpin = useCallback(() => {
    if (spinningRef.current) return;
    spinningRef.current = true;
    startedAt.current = Date.now();
    setSpinning(true);
  }, []);

  useEffect(() => {
    if (rolling) startSpin();
  }, [rolling, startSpin]);

  useEffect(() => {
    if (eventKey) startSpin();
  }, [eventKey, startSpin]);

  useEffect(() => {
    if (!spinning) {
      if (value) setFace(value - 1);
      return undefined;
    }
    const interval = setInterval(
      () => setFace(Math.floor(Math.random() * 6)),
      90,
    );
    let stop;
    if (!rolling) {
      // The server has answered. Keep spinning until the minimum time is up, then land.
      const remaining = Math.max(
        0,
        MIN_SPIN_MS - (Date.now() - startedAt.current),
      );
      stop = setTimeout(() => {
        spinningRef.current = false;
        setSpinning(false);
      }, remaining);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(stop);
    };
  }, [spinning, rolling, value]);

  return (
    <figure className="flex justify-center" aria-live="polite">
      {faces.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={index === face ? `Dice showing ${index + 1}` : ""}
          className={`w-[140px] md:w-[200px] ${index === face ? "" : "hidden"}`}
        />
      ))}
    </figure>
  );
}
