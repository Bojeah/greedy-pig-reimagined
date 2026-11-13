import { useGreedyPigContext } from "src/context/useGreedyPigContext";

// The pig avatar images the base game already loads. Seat 0 gets the first pig, seat 1 the second...
export default function usePigs() {
  const { preloadSrcList } = useGreedyPigContext();
  return preloadSrcList.filter((src) => src.includes("pig"));
}
