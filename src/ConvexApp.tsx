import {
  ConvexProvider,
  ConvexReactClient,
  useAction,
  useQuery,
} from "convex/react";
import { Component, type ReactNode } from "react";
import { api } from "../convex/_generated/api";
import App from "./App";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

function ConnectedApp() {
  const publishedTools = useQuery(api.tools.listPublished, {});
  const launch = useAction(api.tools.launch);

  return (
    <App
      publishedTools={publishedTools ?? []}
      convexState={publishedTools === undefined ? "loading" : "ready"}
      onLaunch={(url) => launch({ url })}
    />
  );
}

class ConvexErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <App convexState="error" />;
    }
    return this.props.children;
  }
}

export default function ConvexApp() {
  if (!convexClient) {
    return <App convexState="disabled" />;
  }

  return (
    <ConvexErrorBoundary>
      <ConvexProvider client={convexClient}>
        <ConnectedApp />
      </ConvexProvider>
    </ConvexErrorBoundary>
  );
}
