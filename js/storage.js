const prefix = "medergency:";
export const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(value));
    } catch {
      throw new Error(
        "Your browser could not save this change. Check available storage and try again.",
      );
    }
  },
  remove(key) {
    localStorage.removeItem(prefix + key);
  },
};
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const appointments = () => storage.get("appointments", []);
export const saveAppointments = (value) => storage.set("appointments", value);
export const notify = (text) => {
  if (storage.get("settings", {}).notifications === false) return;
  const messages = storage.get("notifications", []);
  messages.unshift({ id: crypto.randomUUID(), text, read: false });
  storage.set("notifications", messages.slice(0, 100));
};
export const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const formatDate = (value) =>
  new Date(value + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
