import { createContext, useCallback, useEffect, useMemo, useState } from
'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch, clearToken, getToken, setToken } from 'src/services/api';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const queryClient = useQueryClient();
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(() => Boolean(getToken()));
// On page load: if we have a saved token, ask the server who it belongs
to.
useEffect(() => {
if (!getToken()) return undefined;
let cancelled = false;
apiFetch('/api/auth/me')
.then((data) => {
if (!cancelled) setUser(data.user);
})
.catch(() => {
/* a 401 already cleared the token, a network error just leaves the
player logged out for now */
})
.finally(() => {
if (!cancelled) setLoading(false);
});
return () => {
cancelled = true;
};
}, []);
// api.js announces a rejected token, so we can log the player out
everywhere.
useEffect(() => {
const onUnauthorized = () => setUser(null);
window.addEventListener('gp:unauthorized', onUnauthorized);
return () => window.removeEventListener('gp:unauthorized',
onUnauthorized);
}, []);
const startSession = useCallback(
(data) => {
queryClient.clear(); // never show the previous player's cached data
setToken(data.token);
setUser(data.user);
return data.user;
},
[queryClient]
);

const login = useCallback(
async (username, password) =>
startSession(await apiFetch('/api/auth/login', { method: 'POST', body:
{ username, password }, auth: false })),
[startSession]
);
const register = useCallback(
async (username, password) =>
startSession(await apiFetch('/api/auth/register', { method: 'POST',
body: { username, password }, auth: false })),
[startSession]
);
const guest = useCallback(
async () => startSession(await apiFetch('/api/auth/guest', { method:
'POST', auth: false })),
[startSession]
);
const logout = useCallback(() => {
clearToken();
queryClient.clear();
setUser(null);
}, [queryClient]);
const value = useMemo(
() => ({ user, loading, login, register, guest, logout }),
[user, loading, login, register, guest, logout]
);
return <AuthContext.Provider value={value}>{children}
</AuthContext.Provider>;
}
