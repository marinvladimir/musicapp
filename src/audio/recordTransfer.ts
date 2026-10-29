import { Vector3 } from "three";
import { Song } from "../types";

// Taking a record from the shelf to the turntable, in seconds. Each album
// is one record, so this only happens when the album changes.
export const EJECT_SECONDS = 0.5; // the old record lifts off and returns to the shelf
export const EMERGE_SECONDS = 0.3; // the new record slides out of its book
export const FLY_SECONDS = 0.8; // it flies over to the turntable
export const DROP_SECONDS = 0.25; // and drops onto the platter
const PLACE_SECONDS = EMERGE_SECONDS + FLY_SECONDS + DROP_SECONDS;

// World positions of the books, registered by the bookshelf.
export const bookPositions = new Map<string, Vector3>();

export type PlacedRecord = Song & { album: string };

export const transfer: {
  current: {
    startedAt: number;
    // When the new record starts moving: after the old one is on its way.
    incomingAt: number;
    landsAt: number;
    incoming: PlacedRecord;
    outgoing: PlacedRecord | null;
  } | null;
} = { current: null };

const now = () => performance.now() / 1000;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Starts the animation and returns how long until the record is on the
// platter, so the music can start then.
export const startTransfer = (
  incoming: PlacedRecord,
  outgoing: PlacedRecord | null,
) => {
  if (prefersReducedMotion()) {
    transfer.current = null;
    return 0;
  }
  const startedAt = now();
  // The old record is back on the shelf before the new one comes out.
  const incomingAt = startedAt + (outgoing ? EJECT_SECONDS : 0);
  transfer.current = {
    startedAt,
    incomingAt,
    landsAt: incomingAt + PLACE_SECONDS,
    incoming,
    outgoing,
  };
  return incomingAt + PLACE_SECONDS - startedAt;
};

// Time left until the record that is on its way lands, or 0.
export const secondsUntilLanding = () =>
  transfer.current ? Math.max(0, transfer.current.landsAt - now()) : 0;

export const isRecordOnPlatter = () =>
  !transfer.current || now() >= transfer.current.landsAt;

export const secondsSince = (time: number) => now() - time;
