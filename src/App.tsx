import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { categories, tools, type Tool, type ToolStatus } from "./data/tools";
import "./styles.css";

type Route = "home" | "tools" | "not-found";

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

function App() {
  const [location, setLocation] = useState<AppLocation>(getLocation);
  const mainContentRef = useRef<HTMLElement | null>(null);

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
        <HomePage mainContentRef={mainContentRef} onNavigate={navigate} />
      ) : location.route === "tools" ? (
        <ToolsPage mainContentRef={mainContentRef} onNavigate={navigate} />
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
      </nav>
      <a
        className="header-cta"
        href={suggestToolUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suggest a tool on GitHub (opens in a new tab)"
      >
        Suggest a tool on GitHub <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}

type PageProps = {
  mainContentRef: RefObject<HTMLElement | null>;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function HomePage({ mainContentRef, onNavigate }: PageProps) {
  const featuredTools = tools.filter((tool) => tool.featured);

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
        <div className="tool-grid">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <SubmitPanel />
    </main>
  );
}

function ToolsPage({ mainContentRef }: PageProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("All tools");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTools = tools.filter((tool) => {
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
            Showing <strong>{filteredTools.length}</strong> of {tools.length}{" "}
            tools
          </p>
          <p className="meta-note">
            <span className="legend-dot" aria-hidden="true" /> Independent
            listings, not endorsements
          </p>
        </div>

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

      <SubmitPanel />
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

function SubmitPanel() {
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
          workflow that helps a Skool community run better, open the GitHub
          issue form and share the link with a one-line description.
        </p>
      </div>
      <a
        className="button button-light"
        href={suggestToolUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the GitHub issue form to suggest a tool (opens in a new tab)"
      >
        Suggest a tool on GitHub <span aria-hidden="true">→</span>
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
