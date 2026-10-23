import { Component, type ReactNode } from 'react';

// If drawing the board ever throws (a bug, or odd data), React would blank the
// whole page. This "error boundary" catches it instead and shows `fallback`:
// nothing on the monitor, just the click areas in the editor, so you can still
// undo or fix the card. As soon as the data changes, it tries again.
//
// Error boundaries are the one thing React still only does with a class
// component: there is no hook equivalent of componentDidCatch.

interface Props {
  resetKey: unknown;
  fallback: ReactNode;
  children: ReactNode;
}

export class BoardBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('The board could not be drawn:', error);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
