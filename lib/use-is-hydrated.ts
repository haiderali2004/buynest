import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the client has hydrated. Use this to gate rendering of
 * state that only exists in the browser (e.g. localStorage-persisted
 * Zustand stores) so the server-rendered markup and the first client
 * render match exactly, then the real value appears on the next paint.
 *
 * Implemented with `useSyncExternalStore` rather than `useState` +
 * `useEffect` — there's no external system to subscribe to here, so a
 * `setState` call inside an effect would just be an extra render for no
 * reason. `getServerSnapshot` exists precisely for this "different value
 * on the server vs. the client" case.
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
