import { createContext, useCallback, useMemo, useState } from 'react';
export const ToastContext = createContext(null);
let nextId = 1;
export function ToastProvider({ children }) {
const [toasts, setToasts] = useState([]);
const dismiss = useCallback((id) => {
setToasts((list) => list.filter((toast) => toast.id !== id));
}, []);
const push = useCallback(
(kind, message) => {
const id = nextId++;
setToasts((list) => [...list.slice(-3), { id, kind, message }]);
setTimeout(() => dismiss(id), 4500);
},
[dismiss]
);
// useMemo keeps this object the same between renders, so effects that
//depend on it do not re-run.
const api = useMemo(
() => ({
success: (message) => push('success', message),
error: (message) => push('error', message),
}),
[push]
);

return (
<ToastContext.Provider value={api}>
{children}
<div
role="status"
aria-live="polite"
className="fixed bottom-4 left-1/2 z-50 flex w-[90%] max-w-sm -
translate-x-1/2 flex-col gap-2 pointer-events-none"
>
{toasts.map((toast) => (
<div
key={toast.id}
className={`pointer-events-auto rounded-lg border px-4 py-3 textsm font-bold text-white shadow-lg ${
toast.kind === 'error'
? 'border-[#E71D36] bg-[#E71D36e0]'
: 'border-[#D30CBD] bg-[#3b0a36f0]'
}`}
>
{toast.message}
</div>
))}
</div>
</ToastContext.Provider>
);
}

