import { Outlet } from "react-router-dom";
import { OnlineGameProvider } from "src/context/OnlineGameContext";

// Wraps every /play-online page, so they share one live connection and one game state.
export default function OnlineLayout() {
  return (
    <OnlineGameProvider>
      <Outlet />
    </OnlineGameProvider>
  );
}
