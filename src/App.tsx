import { useEffect, useMemo, useState } from "react";
import { categories, tools, type Tool, type ToolStatus } from "./data/tools";
import "./styles.css";

type Route = "home" | "tools";

function getRoute(): Route {
  return window.location.pathname.startsWith("/tools") ? "tools" : "home";
}

function App() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    setRoute(getRoute());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="site-shell">
      <Header route={route} onNavigate={navigate} />
      {route === "home" ? (
        <HomePage onNavigate={navigate} />
      ) : (
        <ToolsPage onNavigate={navigate} />
      )}
      <Footer onNavigate={navigate} />
    </div>
  );
}

type HeaderProps = {
  route: Route;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>) => void;
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
        >
          Home
        </a>
        <a
          className={route === "tools" ? "active" : ""}
          href="/tools"
          onClick={onNavigate}
        >
          Directory
        </a>
      </nav>
      <a className="header-cta" href="/tools#submit" onClick={onNavigate}>
        Suggest a tool <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}

type PageProps = {
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

function HomePage({ onNavigate }: PageProps) {
  const featuredTools = tools.filter((tool) => tool.featured);

  return (
    <main>
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
            <a className="text-link" href="/tools#submit" onClick={onNavigate}>
              Have something to add? <span aria-hidden="true">↗</span>
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

      <SubmitPanel onNavigate={onNavigate} />
    </main>
  );
}

function ToolsPage({ onNavigate }: PageProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("All tools");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All tools" || tool.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${tool.name} ${tool.description} ${tool.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <main>
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
          <div className="category-filter" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                className={selectedCategory === category ? "selected" : ""}
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="directory-meta">
          <p>
            Showing <strong>{filteredTools.length}</strong> of {tools.length}{" "}
            tools
          </p>
          <p className="meta-note">
            <span className="legend-dot" aria-hidden="true" /> Examples and
            placeholders while the directory takes shape
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

      <SubmitPanel onNavigate={onNavigate} />
    </main>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className={`tool-card status-${tool.status}`}>
      <div className="tool-card-topline">
        <span className="tool-category">{tool.category}</span>
        <StatusPill status={tool.status} />
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <div className="card-footer">
        <span>{tool.note}</span>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
    </article>
  );
}

function ToolRow({ tool }: { tool: Tool }) {
  return (
    <article className={`tool-row status-${tool.status}`}>
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
        <small>{tool.note}</small>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: ToolStatus }) {
  return (
    <span className={`status-pill status-pill-${status}`}>
      {status === "example" ? "Example" : "Placeholder"}
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

function SubmitPanel({ onNavigate }: PageProps) {
  return (
    <section className="submit-panel page-width" id="submit">
      <div className="submit-panel-mark" aria-hidden="true">
        <span>+</span>
      </div>
      <div className="submit-panel-copy">
        <p className="section-kicker">Have a useful thing?</p>
        <h2>Put it on the list.</h2>
        <p>
          This directory is small on purpose. If you have a template, tool, or
          workflow that helps a Skool community run better, send over the link
          and a one-line description.
        </p>
      </div>
      <a
        className="button button-light"
        href="/tools#submit"
        onClick={onNavigate}
      >
        Suggest a tool <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}

function Footer({ onNavigate }: PageProps) {
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
