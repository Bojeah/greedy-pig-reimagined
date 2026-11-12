import { useState } from 'react';
import useAuth from 'src/hooks/useAuth';
// One tap to start playing, no account needed.
export default function GuestButton({ onError }) {
const { guest } = useAuth();
const [busy, setBusy] = useState(false);
async function handleClick() {
setBusy(true);
try {
await guest(); // the login page sends the player onward once the user
//is set
} catch (err) {
onError(err.message);
setBusy(false);
}
}
return (
<button
type="button"
onClick={handleClick}
disabled={busy}
className="sec-font w-full rounded border border-[#ffffff80] bg-
[#ffffff20] px-8 py-3 text-lg font-bold duration-300 hover:bg-[#ffffff40]
disabled:opacity-60"
>
{busy ? 'Setting up...' : 'Play as guest'}
</button>
);
}
