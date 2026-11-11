const eventName = "six-seeeven-storage";
const volatileValues = new Map<string, string>();
export function readStoredRaw(key: string): string | null {
  if (volatileValues.has(key)) return volatileValues.get(key)!;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeStoredRaw(key: string, value: string): boolean {
  if (readStoredRaw(key) === value && !volatileValues.has(key)) return true;
  let persisted = true;
  try {
    localStorage.setItem(key, value);
    volatileValues.delete(key);
  } catch {
    volatileValues.set(key, value);
    persisted = false;
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: { key } }));
  return persisted;
}
export function subscribeStoredKey(key: string, listener: () => void) {
  const local = (event: Event) => {
    if ((event as CustomEvent<{ key: string }>).detail.key === key) listener();
  };
  const external = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      volatileValues.delete(key);
      listener();
    }
  };
  window.addEventListener(eventName, local);
  window.addEventListener("storage", external);
  return () => {
    window.removeEventListener(eventName, local);
    window.removeEventListener("storage", external);
  };
}
