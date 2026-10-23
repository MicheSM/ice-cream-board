// "Proietta": casting the board with the Presentation API.
//
// The editor asks Chrome to present display.html on a Chromecast. If Chrome
// supports it, it opens display.html in an invisible tab rendered at the TV's
// resolution and streams that tab to the Chromecast. The two pages talk
// through a PresentationConnection: the editor sends the whole board state as
// JSON on every change, the display applies it.

import { pickData, useStore } from '../model/store';
import type { AppData } from '../model/types';

export type CastStatus = 'unsupported' | 'idle' | 'connecting' | 'connected';

const SESSION_KEY = 'ice-cream-board:presentation-id';

export const presentationSupported = () => typeof PresentationRequest !== 'undefined';

let request: PresentationRequest | null = null;
let connection: PresentationConnection | null = null;
let unsubscribe: (() => void) | null = null;
const listeners = new Set<(s: CastStatus) => void>();

function getRequest() {
  request ??= new PresentationRequest([new URL('display.html', location.href).href]);
  return request;
}

export function castStatus(): CastStatus {
  if (!presentationSupported()) return 'unsupported';
  if (!connection) return 'idle';
  return connection.state === 'connected' ? 'connected' : connection.state === 'connecting' ? 'connecting' : 'idle';
}

export function onCastStatus(fn: (s: CastStatus) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const notify = () => listeners.forEach((fn) => fn(castStatus()));

function attach(conn: PresentationConnection) {
  connection = conn;
  localStorage.setItem(SESSION_KEY, conn.id);
  const sendState = () => {
    if (conn.state === 'connected') conn.send(JSON.stringify(pickData(useStore.getState())));
  };
  conn.onconnect = () => {
    sendState();
    unsubscribe?.();
    unsubscribe = useStore.subscribe(sendState);
    notify();
  };
  conn.onclose = () => {
    unsubscribe?.();
    notify();
  };
  conn.onterminate = () => {
    unsubscribe?.();
    localStorage.removeItem(SESSION_KEY);
    connection = null;
    notify();
  };
  if (conn.state === 'connected') conn.onconnect(new Event('connect'));
  notify();
}

/** Opens Chrome's device picker. Must be called from a click. */
export async function startCasting() {
  const conn = await getRequest().start();
  attach(conn);
}

export function stopCasting() {
  connection?.terminate();
}

/** After an editor reload, re-attach to a presentation that is still running. */
export async function tryReconnect() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id || !presentationSupported()) return;
  try {
    attach(await getRequest().reconnect(id));
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

/** Display side: true if this page was opened as a presentation receiver. */
export const isReceiver = () => Boolean(navigator.presentation?.receiver);

/** Display side: apply every state message sent by the editor. */
export async function listenAsReceiver(apply: (data: AppData) => void) {
  const list = await navigator.presentation!.receiver!.connectionList;
  const listen = (c: PresentationConnection) => {
    c.onmessage = (e) => apply(JSON.parse(e.data) as AppData);
  };
  list.connections.forEach(listen);
  list.onconnectionavailable = (e) => listen(e.connection);
}
