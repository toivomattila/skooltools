import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { categories, tools, type Tool, type ToolStatus } from "./data/tools";
import {
  mergeTools,
  validateLaunchUrl,
  type LaunchResult,
  type PublishedTool,
} from "./lib/launch";
import "./styles.css";

type Route = "home" | "tools" | "launch" | "not-found";
type ConvexState = "disabled" | "loading" | "ready" | "error";

type AppLocation = {
  pathname: string;
  hash: string;
  route: Route;
};

const suggestToolUrl = `https://github.com/toivomattila/skooltools/issues/new?${new URLSearchParams(
  {
    title: "Suggest a tool for Skool Tools",
    body: "Tool name:\n\nLink:\n\nWhy is it useful?\n",
  },
)}`;

function getRoute(pathname = window.location.pathname): Route {
  if (pathname === "/") return "home";
  if (pathname === "/tools" || pathname === "/tools/") return "tools";
  if (pathname === "/launch" || pathname === "/launch/") return "launch";
  return "not-found";
}

function getLocation(): AppLocation {
  const { pathname, hash } = window.location;
  return {
    pathname,
    hash,
    route: getRoute(pathname),
  };
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function focusAndScrollToLocation(
  location: AppLocation,
  mainContentRef: RefObject<HTMLElement | null>,
) {
  const behavior = getScrollBehavior();
  mainContentRef.current?.focus({ preventScroll: true });

  if (location.hash) {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const hashTarget = document.getElementById(id);
    if (hashTarget instanceof HTMLElement) {
      hashTarget.focus({ preventScroll: true });
      hashTarget.scrollIntoView({ behavior });
    }
    return;
  }

  window.scrollTo({ top: 0, behavior });
}

type AppProps = {
  publishedTools?: readonly PublishedTool[];
  convexState: ConvexState;
  onLaunch?: (url: string) => Promise<LaunchResult>;
};

function App({ publishedTools = [], convexState, onLaunch }: AppProps) {
  const [location, setLocation] = useState<AppLocation>(getLocation);
  const mainContentRef = useRef<HTMLElement | null>(null);
  const directoryTools = mergeTools(tools, publishedTools);

  useEffect(() => {
    const handlePopState = () => setLocation(getLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => focusAndScrollToLocation(location, mainContentRef),
      0,
    );
    return () => window.clearTimeout(timeoutId);
  }, [location, mainContentRef]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");
    if (
      !href ||
      !href.startsWith("/") ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const currentUrl = new URL(window.location.href);
    const nextUrl = new URL(href, currentUrl);
    if (nextUrl.origin !== currentUrl.origin) return;
    event.preventDefault();
    if (
      nextUrl.pathname === currentUrl.pathname &&
      nextUrl.search === currentUrl.search &&
      nextUrl.hash === currentUrl.hash
    ) {
      return;
    }

    window.history.pushState({}, "", nextUrl);
    setLocation(getLocation());
  };

  return (
    <div className="site-shell">
      <Header route={location.route} onNavigate={navigate} />
      {location.route === "home" ? (
        <HomePage
          mainContentRef={mainContentRef}
          onNavigate={navigate}
          directoryTools={directoryTools}
          convexState={convexState}
        />
      ) : location.route === "tools" ? (
        <ToolsPage
          mainContentRef={mainContentRef}
          onNavigate={navigate}
          directoryTools={directoryTools}
          convexState={convexState}
        />
      ) : location.route === "launch" ? (
        <LaunchPage
          mainContentRef={mainContentRef}
          convexState={convexState}
          onLaunch={onLaunch}
        />
      ) : (
        <NotFoundPage mainContentRef={mainContentRef} onNavigate={navigate} />
      )}
      <Footer onNavigate={navigate} />
    </div>
  );
}

type HeaderProps = {
  route: Route;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function Header({ route, onNavigate }: HeaderProps) {
  return (
    <header className="site-header">
      <a
        className="brand"
        href="/"
        onClick={onNavigate}
        aria-label="Skool Tools home"
      >
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>Skool Tools</span>
      </a>
      <nav className="main-nav" aria-label="Main navigation">
        <a
          className={route === "home" ? "active" : ""}
          href="/"
          onClick={onNavigate}
          aria-current={route === "home" ? "page" : undefined}
        >
          Home
        </a>
        <a
          className={route === "tools" ? "active" : ""}
          href="/tools"
          onClick={onNavigate}
          aria-current={route === "tools" ? "page" : undefined}
        >
          Directory
        </a>
        <a
          className={route === "launch" ? "active" : ""}
          href="/launch"
          onClick={onNavigate}
          aria-current={route === "launch" ? "page" : undefined}
        >
          Launch
        </a>
      </nav>
      <a className="header-cta" href="/launch" onClick={onNavigate}>
        Launch a tool <span aria-hidden="true">→</span>
      </a>
    </header>
  );
}

type PageProps = {
  mainContentRef: RefObject<HTMLElement | null>;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
};

type DirectoryPageProps = PageProps & {
  directoryTools: Tool[];
  convexState: ConvexState;
};

function HomePage({
  mainContentRef,
  onNavigate,
  directoryTools,
  convexState,
}: DirectoryPageProps) {
  const featuredTools = directoryTools.filter((tool) => tool.featured);

  return (
    <main ref={mainContentRef} tabIndex={-1}>
      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />A directory for
            Skool builders
          </p>
          <h1>
            The useful stuff <em>around</em> your community.
          </h1>
          <p className="hero-intro">
            Small tools, templates, and ideas for the people who run the rooms
            where members learn together.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="/tools"
              onClick={onNavigate}
            >
              Browse the directory <span aria-hidden="true">→</span>
            </a>
            <a className="text-link" href="/launch" onClick={onNavigate}>
              Launch your tool <span aria-hidden="true">↗</span>
            </a>
            <a
              className="text-link"
              href={suggestToolUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suggest a tool on GitHub (opens in a new tab)"
            >
              Suggest a tool on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="hero-note" aria-label="About Skool Tools">
          <div className="note-topline">
            <span>SKOOL TOOLS / FIELD NOTE 01</span>
            <span className="note-stamp">V1</span>
          </div>
          <div className="note-illustration" aria-hidden="true">
            <div className="note-orbit note-orbit-one" />
            <div className="note-orbit note-orbit-two" />
            <span className="note-spark spark-one">+</span>
            <span className="note-spark spark-two">+</span>
            <span className="note-label label-one">make it useful</span>
            <span className="note-label label-two">keep it human</span>
            <div className="note-center">S</div>
          </div>
          <p className="note-caption">
            No dashboards. No busywork. Just things that earn their place in
            your week.
          </p>
        </div>
      </section>

      <section className="intro-strip">
        <div className="page-width intro-strip-inner">
          <p className="section-kicker">What belongs here</p>
          <p className="strip-copy">
            The spreadsheet you keep rebuilding. The prompt that gets a quiet
            room talking. The checklist you wish you had last launch.
          </p>
          <span className="strip-arrow" aria-hidden="true">
            ↓
          </span>
        </div>
      </section>

      <section className="featured-section page-width">
        <div className="section-heading">
          <div>
            <p className="section-kicker">The short list</p>
            <h2>A few good places to start.</h2>
          </div>
          <a className="text-link" href="/tools" onClick={onNavigate}>
            See all tools <span aria-hidden="true">↗</span>
          </a>
        </div>
        <DataStatus state={convexState} />
        <div className="tool-grid">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <SubmitPanel onNavigate={onNavigate} />
    </main>
  );
}

function ToolsPage({
  mainContentRef,
  onNavigate,
  directoryTools,
  convexState,
}: DirectoryPageProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("All tools");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTools = directoryTools.filter((tool) => {
    const matchesCategory =
      selectedCategory === "All tools" || tool.category === selectedCategory;
    const matchesQuery =
      !normalizedQuery ||
      `${tool.name} ${tool.description} ${tool.category}`
        .toLowerCase()
        .includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <main ref={mainContentRef} tabIndex={-1}>
      <section className="directory-hero page-width">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            The directory
          </p>
          <h1>Tools worth bookmarking.</h1>
        </div>
        <p>
          A small collection of practical things for planning, publishing, and
          looking after your members.
        </p>
      </section>

      <section className="directory-content page-width">
        <div className="directory-toolbar">
          <label className="search-field">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <span className="sr-only">Search tools</span>
            <input
              type="search"
              placeholder="Search the directory"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <fieldset className="category-filter">
            <legend className="sr-only">Filter by category</legend>
            {categories.map((category) => (
              <button
                aria-pressed={selectedCategory === category}
                className={selectedCategory === category ? "selected" : ""}
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </fieldset>
        </div>

        <div className="directory-meta">
          <p>
            Showing <strong>{filteredTools.length}</strong> of{" "}
            {directoryTools.length} tools
          </p>
          <p className="meta-note">
            <span className="legend-dot" aria-hidden="true" /> Independent
            listings, not endorsements
          </p>
        </div>
        <DataStatus state={convexState} />

        {filteredTools.length > 0 ? (
          <div className="directory-list">
            {filteredTools.map((tool) => (
              <ToolRow key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <EmptyState
            query={query}
            onClear={() => {
              setQuery("");
              setSelectedCategory("All tools");
            }}
          />
        )}
      </section>

      <SubmitPanel onNavigate={onNavigate} />
    </main>
  );
}

function DataStatus({ state }: { state: ConvexState }) {
  if (state === "loading") {
    return (
      <p className="data-status" role="status">
        Checking for recent launches…
      </p>
    );
  }

  if (state === "error") {
    return (
      <p className="data-status data-status-error" role="status">
        Recent launches are temporarily unavailable. The original directory is
        still here.
      </p>
    );
  }

  return null;
}

function LaunchPage({
  mainContentRef,
  convexState,
  onLaunch,
}: {
  mainContentRef: RefObject<HTMLElement | null>;
  convexState: ConvexState;
  onLaunch?: (url: string) => Promise<LaunchResult>;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<LaunchResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult(null);

    const validation = validateLaunchUrl(url);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    if (!onLaunch || convexState === "disabled") {
      setError(
        "Launching is not configured here yet. Add VITE_CONVEX_URL to connect the directory.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const launchedTool = await onLaunch(validation.url);
      setResult(launchedTool);
      setUrl(launchedTool.url);
    } catch (launchError) {
      setError(
        launchError instanceof Error
          ? launchError.message
          : "The page could not be launched. Check the URL and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="launch-page page-width" ref={mainContentRef} tabIndex={-1}>
      <section className="launch-hero">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Launch a tool
          </p>
          <h1>Put your useful thing in front of Skool builders.</h1>
          <p className="launch-intro">
            Share one public HTTPS link. We’ll read the page title and
            description, then add it to the directory when the page responds.
          </p>
        </div>
        <div className="launch-note">
          <span className="launch-note-label">How it works</span>
          <strong>One link in.</strong>
          <strong>One listing out.</strong>
          <p>
            This is a URL-first flow inspired by Product Hunt. Publication is
            automatic after a successful fetch—there is no human review queue in
            this version.
          </p>
        </div>
      </section>

      <section
        className="launch-form-section"
        aria-labelledby="launch-form-title"
      >
        <div className="launch-form-heading">
          <p className="section-kicker">Start with the address</p>
          <h2 id="launch-form-title">Where should people go?</h2>
        </div>
        {convexState === "disabled" ? (
          <p className="launch-config-message" role="status">
            Launching is available once this site has a Convex URL configured.
            You can still browse the static directory.
          </p>
        ) : null}
        <form className="launch-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="tool-url">Tool URL</label>
          <div className="launch-input-row">
            <input
              id="tool-url"
              name="url"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://yourtool.com"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
                setResult(null);
              }}
              aria-describedby="tool-url-help"
              aria-invalid={Boolean(error)}
              required
            />
            <button
              className="button button-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking page…" : "Launch tool"}
              <span aria-hidden="true">{isSubmitting ? "…" : "→"}</span>
            </button>
          </div>
          <p id="tool-url-help" className="launch-help">
            Use the page people should visit, not a dashboard or a private
            preview. HTTPS links only.
          </p>
          {error ? (
            <p className="launch-message launch-message-error" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div
              className="launch-message launch-message-success"
              role="status"
            >
              <strong>{result.name} is live in the directory.</strong>
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                Open the launched tool <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article
      className={`tool-card status-${tool.status}`}
      data-tool={tool.slug}
    >
      <div className="tool-card-topline">
        <span className="tool-category">{tool.category}</span>
        <StatusPill status={tool.status} />
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      {tool.status === "listed" ? (
        <div className="card-footer">
          <a
            className="tool-link"
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${tool.name}`}
          >
            Visit <span aria-hidden="true">↗</span>
          </a>
        </div>
      ) : null}
    </article>
  );
}

function ToolRow({ tool }: { tool: Tool }) {
  return (
    <article className={`tool-row status-${tool.status}`} data-tool={tool.slug}>
      <div className="tool-row-index" aria-hidden="true">
        <span />
      </div>
      <div className="tool-row-main">
        <div className="tool-row-heading">
          <h2>{tool.name}</h2>
          <StatusPill status={tool.status} />
        </div>
        <p>{tool.description}</p>
      </div>
      <div className="tool-row-aside">
        <span>{tool.category}</span>
        {tool.status === "listed" ? (
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${tool.name}`}
          >
            Visit tool <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: ToolStatus }) {
  return (
    <span className={`status-pill status-pill-${status}`}>
      {status === "listed" ? "Listed" : "Placeholder"}
    </span>
  );
}

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        ?
      </span>
      <h2>No tools found{query ? ` for "${query}"` : ""}.</h2>
      <p>Try a different word, or clear the filters to see the full list.</p>
      <button
        className="button button-secondary"
        type="button"
        onClick={onClear}
      >
        Clear filters
      </button>
    </div>
  );
}

function SubmitPanel({
  onNavigate,
}: {
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <section className="submit-panel page-width" id="submit" tabIndex={-1}>
      <div className="submit-panel-mark" aria-hidden="true">
        <span>+</span>
      </div>
      <div className="submit-panel-copy">
        <p className="section-kicker">Have a useful thing?</p>
        <h2>Put it on the list.</h2>
        <p>
          This directory is small on purpose. If you have a template, tool, or
          workflow that helps a Skool community run better, share its public
          link and we’ll pull the page details into a new listing.
        </p>
      </div>
      <a className="button button-light" href="/launch" onClick={onNavigate}>
        Launch your tool <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}

function NotFoundPage({ mainContentRef, onNavigate }: PageProps) {
  return (
    <main className="not-found page-width" ref={mainContentRef} tabIndex={-1}>
      <p className="eyebrow">
        <span className="eyebrow-dot" aria-hidden="true" />
        Page not found
      </p>
      <h1>That page isn’t in the directory.</h1>
      <p>
        The address does not match a Skool Tools page. Browse the directory to
        find the tools that are listed here.
      </p>
      <a className="button button-primary" href="/tools" onClick={onNavigate}>
        Browse the directory <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}

function Footer({
  onNavigate,
}: {
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <footer className="site-footer page-width">
      <p>Skool Tools</p>
      <p>Made for the people behind the rooms.</p>
      <a href="/tools" onClick={onNavigate}>
        Browse directory <span aria-hidden="true">↗</span>
      </a>
    </footer>
  );
}

export default App;
