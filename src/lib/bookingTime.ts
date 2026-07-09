/**
 * Backend uses ISO 8601 timestamps in Asia/Jakarta (UTC+7, no DST) plus
 * derived `date`/`endDate` (YYYY-MM-DD). The frontend historically stores
 * booking times as `HH:mm` strings with a separate `date`/`endDate`.
 * These helpers convert between the two shapes at the API boundary.
 */

const JAKARTA_OFFSET = "+07:00";

export function composeJakartaISO(dateYMD: string, timeHHmm: string): string {
  // dateYMD: YYYY-MM-DD ; timeHHmm: HH:mm
  return `${dateYMD}T${timeHHmm}:00${JAKARTA_OFFSET}`;
}

export function isoToJakartaHHmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
}

export function isoToJakartaYMD(iso: string): string {
  // en-CA yields YYYY-MM-DD
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
