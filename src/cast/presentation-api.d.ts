// The Presentation API (https://w3c.github.io/presentation-api/) is only
// implemented by Chromium browsers, so TypeScript's DOM types don't include
// it. These declarations describe just the parts we use.

interface PresentationConnection extends EventTarget {
  readonly id: string;
  readonly url: string;
  readonly state: 'connecting' | 'connected' | 'closed' | 'terminated';
  send(message: string): void;
  close(): void;
  terminate(): void;
  onconnect: ((ev: Event) => void) | null;
  onclose: ((ev: Event) => void) | null;
  onterminate: ((ev: Event) => void) | null;
  onmessage: ((ev: MessageEvent<string>) => void) | null;
}

declare class PresentationRequest extends EventTarget {
  constructor(urls: string | string[]);
  start(): Promise<PresentationConnection>;
  reconnect(id: string): Promise<PresentationConnection>;
  getAvailability(): Promise<{ value: boolean; onchange: ((ev: Event) => void) | null }>;
}

interface PresentationConnectionList extends EventTarget {
  readonly connections: PresentationConnection[];
  onconnectionavailable: ((ev: Event & { connection: PresentationConnection }) => void) | null;
}

interface Presentation {
  defaultRequest: PresentationRequest | null;
  readonly receiver: { readonly connectionList: Promise<PresentationConnectionList> } | null;
}

interface Navigator {
  readonly presentation?: Presentation;
}
