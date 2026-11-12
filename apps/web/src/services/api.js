const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'gp_token';

export const API_URL = BASE_URL;
// ---- login token, kept in the browser's localStorage ----
export function getToken() {
try {
return localStorage.getItem(TOKEN_KEY);
} catch {
return null;
}
}
export function setToken(token) {
try {
localStorage.setItem(TOKEN_KEY, token);
} catch {
/* storage can be blocked, the player just has to log in again next time
*/
}
}
export function clearToken() {
try {
localStorage.removeItem(TOKEN_KEY);
} catch {
    /* nothing to do */
}
}
// ---- errors ----
export class ApiError extends Error {
constructor(status, code, message) {
super(message);
this.status = status;
this.code = code;
}
}
// ---- "the server is waking up" message ----
// The free server sleeps when nobody uses it. If a request takes longer than
4 seconds
// we tell the whole app, and the SlowServerBanner shows a friendly message.
let slowRequests = 0;
function changeSlow(delta) {
slowRequests += delta;
window.dispatchEvent(new CustomEvent('gp:slow', { detail: slowRequests > 0
}));
}

// ---- the one function every page uses to talk to the server ----
export async function apiFetch(path, { method = 'GET', body, auth = true } =
{}) {
const headers = {};
if (body !== undefined) headers['Content-Type'] = 'application/json';
const token = getToken();
if (auth && token) headers.Authorization = `Bearer ${token}`;
let slowFired = false;
const slowTimer = setTimeout(() => {
slowFired = true;
changeSlow(1);
}, 4000);
let response;
try {
response = await fetch(`${BASE_URL}${path}`, {
method,
headers,
body: body !== undefined ? JSON.stringify(body) : undefined,
});
} catch {
throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check
your connection and try again.');
} finally {
clearTimeout(slowTimer);
if (slowFired) changeSlow(-1);
}
let data = null;
try {
data = await response.json();
} catch {
/* some responses have no body */
}
if (!response.ok) {
if (response.status === 401 && auth && token) {
clearToken();
window.dispatchEvent(new Event('gp:unauthorized'));
}
const error = data?.error;
throw new ApiError(
response.status,
error?.code || 'UNKNOWN',
error?.message || 'Something went wrong. Please try again.'
);
}
return data;
}

