import { slots } from "./data.js";
import { appointments, today } from "./storage.js";

export function slotAvailable(doctorId, date, time, excludeId = "") {
  if (!date || date < today() || !slots.includes(time) || time === "11:15 AM")
    return false;
  const match = time.match(/(\d+):(\d+) (AM|PM)/);
  const hour = (Number(match[1]) % 12) + (match[3] === "PM" ? 12 : 0);
  const timestamp = new Date(
    `${date}T${String(hour).padStart(2, "0")}:${match[2]}:00`,
  ).getTime();
  if (timestamp <= Date.now()) return false;
  return !appointments().some(
    (a) =>
      a.id !== excludeId &&
      a.status === "Upcoming" &&
      a.doctorId === Number(doctorId) &&
      a.date === date &&
      a.time === time,
  );
}
