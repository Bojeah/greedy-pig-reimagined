import usePageTitle from 'src/hooks/usePageTitle';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageShell from 'src/components/ui/PageShell';
import FormField from 'src/components/auth/FormField';
import useAuth from 'src/hooks/useAuth';
// The same rules as the server, so players get instant feedback.
// The server still checks everything again, because the browser can never be
//trusted.
function validate(username, password, confirm) {
    
const name = username.trim().toLowerCase();
if (!/^[a-z0-9_]{3,20}$/.test(name)) {
return 'Username must be 3 to 20 characters: letters, numbers and underscores only.';
}
if (name.startsWith('guest_')) return 'Usernames starting with guest_ are reserved.';
if (password.length < 8) return 'Password must be at least 8 characters.';
if (password.length > 72) return 'Password must be at most 72 characters.';
if (password !== confirm) return 'The two passwords do not match.';
return '';
}
export default function Register() {
    usePageTitle('Create account');
const { user, register } = useAuth();
const navigate = useNavigate();
const location = useLocation();
const from = location.state?.from?.pathname || '/';
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [confirm, setConfirm] = useState('');
const [error, setError] = useState('');
const [busy, setBusy] = useState(false);
useEffect(() => {
if (user) navigate(from, { replace: true });
}, [user, from, navigate]);
async function handleSubmit(event) {
event.preventDefault();
const problem = validate(username, password, confirm);
if (problem) {
setError(problem);
return;
}
setError('');
setBusy(true);
try {
await register(username.trim().toLowerCase(), password);
} catch (err) {
setError(err.message);
setBusy(false);
}
}
return (
<PageShell title="Create account" narrow>
<form onSubmit={handleSubmit} className="flex flex-col gap-4"
noValidate>
<FormField
id="username"
label="Username"
hint="3 to 20 characters: letters, numbers and underscores."
value={username}
onChange={(e) => setUsername(e.target.value)}
autoComplete="username"
autoCapitalize="none"
required
/>
<FormField
id="password"
label="Password"
hint="At least 8 characters."
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
autoComplete="new-password"
required
/>
<FormField
id="confirm"
label="Confirm password"
type="password"
value={confirm}
onChange={(e) => setConfirm(e.target.value)}
autoComplete="new-password"
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
{busy ? 'Creating account...' : 'Create account'}
</button>
<p className="text-center text-sm">
Already have an account?{' '}
<Link to="/login" state={location.state} className="font-bold
underline">
Log in
</Link>
</p>
</form>
</PageShell>
);
}
