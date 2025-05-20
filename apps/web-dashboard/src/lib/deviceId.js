export function getDeviceId() {
    if (typeof window === 'undefined') return null;
    let id = localStorage.getItem('deviceId');
    if (!id) {
        // usa l’API browser, oppure fallback a Math.random()
        id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
        localStorage.setItem('deviceId', id);
    }
    return id;
}
