import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from 'src/hooks/useAuth';
import StateMessage from 'src/components/ui/StateMessage';
// Wrap routes that need a logged-in player (guests count). Logged-out
//players are sent
// to /login and, after logging in, back to the page they wanted.
export default function RequireAuth() {
const { user, loading } = useAuth();
const location = useLocation();
if (loading) return <StateMessage kind="loading" text="Checking your
login..." />;
if (!user) return <Navigate to="/login" replace state={{ from: location }}
/>;
return <Outlet />;
}
