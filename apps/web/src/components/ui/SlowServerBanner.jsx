import { useEffect, useState } from 'react';
// Shows a friendly message while a request is taking long (usually the free
//server waking up).
export default function SlowServerBanner() {
const [slow, setSlow] = useState(false);
useEffect(() => {
const onSlow = (event) => setSlow(Boolean(event.detail));
window.addEventListener('gp:slow', onSlow);
return () => window.removeEventListener('gp:slow', onSlow);
}, []);
if (!slow) return null;
return (
<div
role="status"
className="fixed left-0 right-0 top-0 z-50 bg-[#D30CBD] px-4 py-2 textcenter text-sm font-bold text-white"
>
Waking up the server, this can take up to a minute...
</div>
);
}