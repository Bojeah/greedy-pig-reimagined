import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageShell from 'src/components/ui/PageShell';
import FormField from 'src/components/auth/FormField';
import GuestButton from 'src/components/auth/GuestButton';
import useAuth from 'src/hooks/useAuth';
export default function Login() {
const { user, login } = useAuth();
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || '/';
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [busy, setBusy] = useState(false);
// Once logged in (or playing as a guest), go back to the page the player
wanted.
useEffect(() => {
if (user) navigate(from, { replace: true });
}, [user, from, navigate]);
async function handleSubmit(event) {
event.preventDefault();
setError('');
setBusy(true);
try {
await login(username, password);
} catch (err) {
setError(err.message);
setBusy(false);
}
}
return (
<PageShell title="Log in" narrow>
<form onSubmit={handleSubmit} className="flex flex-col gap-4"
noValidate>
<FormField
id="username"
label="Username"
value={username}
onChange={(e) => setUsername(e.target.value)}
autoComplete="username"
autoCapitalize="none"
required
/>
<FormField
id="password"
label="Password"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
autoComplete="current-password"
required
/>
{error && (
<p role="alert" className="rounded border border-[#E71D36] bg-
[#E71D3640] p-3 text-sm">

{error}
</p>
)}
<button
type="submit"
disabled={busy}
className="sec-font rounded bg-[#D30CBD] px-8 py-3 text-xl fontbold duration-300 hover:bg-[#d30cbc] disabled:opacity-60"
>
{busy ? 'Logging in...' : 'Log in'}
</button>
<div className="flex items-center gap-3 text-sm text-[#ffffffa0]">
<hr className="flex-1 border-[#ffffff40]" /> or <hr
className="flex-1 border-[#ffffff40]" />
</div>
<GuestButton onError={setError} />
<p className="text-center text-sm">
New here?{' '}
<Link to="/register" state={location.state} className="font-bold
underline">
Create an account
</Link>
</p>
</form>
</PageShell>
);
}
