import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import LiveGameSetup from "./routes/play_friends_live/setup/Setup";
import Home from "./routes/Home";
import HowToPlay from "./routes/HowToPlay";
import LiveGame from "./routes/play_friends_live/game/Game";
import LiveGamePage from "./routes/play_friends_live/LivePage";
import { ToastProvider } from "./context/ToastContext";
import RequireAuth from "./components/auth/RequireAuth";
import Login from "./routes/auth/Login";
import Register from "./routes/auth/Register";
import Profile from "./routes/profile/Profile";
import Leaderboard from "./routes/leaderboard/Leaderboard";
import History from "./routes/history/History";
import OnlineLayout from "./routes/play_online/OnlineLayout";
import PlayOnline from "./routes/play_online/PlayOnline";
import JoinByLink from "./routes/play_online/JoinByLink";
import Room from "./routes/play_online/Room";

const queryClient = new QueryClient({
defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
const router = createBrowserRouter([
{
path: "/",
element: <Root />,
errorElement: <ErrorPage />,
children: [
{
path: "live-game/",
element: <LiveGamePage />,
errorElement: <ErrorPage />,
children: [
{
path: "setup/",
element: <LiveGameSetup />,
},
{
path: "game/",
element: <LiveGame />,
},
{
path: "how-to-play/",
element: <HowToPlay />,
},
],
},
{
path: "/",
element: <Home />,
},
{ path: "login", element: <Login /> },
{ path: "register", element: <Register /> },
{ path: "leaderboard", element: <Leaderboard /> },
{
element: <RequireAuth />,
children: [
{ path: "profile", element: <Profile /> },
{ path: "history", element: <History /> },
{
path: "play-online",
element: <OnlineLayout />,
children: [
{ index: true, element: <PlayOnline /> },
{ path: "join/:code", element: <JoinByLink /> },
{ path: "room/:code", element: <Room /> },
],
},
],
},
],
},
]);
ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode>
<QueryClientProvider client={queryClient}>
<ToastProvider>
<RouterProvider router={router} />
</ToastProvider>
</QueryClientProvider>
</React.StrictMode>
);
