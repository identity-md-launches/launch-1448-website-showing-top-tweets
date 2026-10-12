import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Code2,
  Cpu,
  ExternalLink,
  Flame,
  Info,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { posts, snapshotDate, type Post } from "./posts";

type Category = "All posts" | Post["category"];
type Sort = "picks" | "newest" | "oldest";
const categories: Category[] = ["All posts", "Building", "Ideas", "Community"];
const categoryIcons = {
  "All posts": Flame,
  Building: Code2,
  Ideas: Lightbulb,
  Community: Users,
};
const storageKey = "the-pond:saved:v1";
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

function loadSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value)
      ? value.filter(
          (id): id is string =>
            typeof id === "string" && posts.some((post) => post.id === id),
        )
      : [];
  } catch {
    return [];
  }
}

function FrogMark({ className = "" }: { className?: string }) {
  return (
    <img
      className={className}
      src="./favicon.svg"
      alt=""
      width="40"
      height="40"
    />
  );
}

function PostCard({
  post,
  rank,
  saved,
  onSave,
}: {
  post: Post;
  rank: number;
  saved: boolean;
  onSave: (id: string) => void;
}) {
  const CategoryIcon = categoryIcons[post.category];
  return (
    <article
      className={`post-card ${rank === 1 ? "first-pick" : ""}`}
      aria-labelledby={`post-${post.id}`}
    >
      <div className="post-topline">
        <span className="pick-label">
          {rank === 1 && <Flame size={14} />} Pond pick{" "}
          <span className="rank">{String(rank).padStart(2, "0")}</span>
        </span>
        <span className="platform" aria-hidden="true">
          𝕏
        </span>
      </div>
      <div className="author-row">
        <span className={`avatar avatar-${rank % 4}`} aria-hidden="true">
          {post.name.slice(0, 1)}
        </span>
        <div className="author-text">
          <h3 id={`post-${post.id}`}>{post.name}</h3>
          <span>@{post.handle}</span>
        </div>
        <button
          id={`save-${post.id}`}
          className={`icon-button save-button ${saved ? "is-saved" : ""}`}
          type="button"
          aria-label={`${saved ? "Unsave" : "Save"} post by ${post.name}, ${dateLabel(post.date)}`}
          aria-pressed={saved}
          onClick={() => onSave(post.id)}
          title={saved ? "Remove from saved posts" : "Save post"}
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="post-copy">
        {post.kind === "excerpt" ? (
          <blockquote>“{post.text}”</blockquote>
        ) : (
          <p>{post.text}</p>
        )}
      </div>
      <div className="post-meta">
        <span className="category-label">
          <CategoryIcon size={13} />
          {post.category}
        </span>
        <span>{post.kind === "excerpt" ? "Post excerpt" : "Post summary"}</span>
      </div>
      <div className="post-footer">
        <time dateTime={post.date}>{dateLabel(post.date)}</time>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Read on X: ${post.name}’s post (opens in a new tab)`}
        >
          Read on X <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
}

export default function App() {
  const [saved, setSaved] = useState<string[]>(loadSaved);
  const [savedView, setSavedView] = useState(() => location.hash === "#saved");
  const [category, setCategory] = useState<Category>("All posts");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("picks");
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const feedTitle = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const onHashChange = () => {
      if (!["#saved", "#feed", "", "#"].includes(location.hash)) return;
      setSavedView(location.hash === "#saved");
      setCategory("All posts");
      setQuery("");
      if (location.hash === "#saved" || location.hash === "#feed") focusFeed();
    };
    window.addEventListener("hashchange", onHashChange);
    if (location.hash === "#saved" || location.hash === "#feed") focusFeed();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return posts
      .filter(
        (post) =>
          (!savedView || saved.includes(post.id)) &&
          (category === "All posts" || post.category === category) &&
          `${post.name} ${post.handle} ${post.text} ${post.category}`
            .toLocaleLowerCase()
            .includes(needle),
      )
      .sort((a, b) =>
        sort === "picks"
          ? posts.indexOf(a) - posts.indexOf(b)
          : sort === "newest"
            ? Date.parse(b.date) - Date.parse(a.date)
            : Date.parse(a.date) - Date.parse(b.date),
      );
  }, [savedView, saved, category, query, sort]);

  function toggleSave(id: string) {
    const removing = saved.includes(id);
    const index = visiblePosts.findIndex((post) => post.id === id);
    const nextPost = visiblePosts[index + 1] ?? visiblePosts[index - 1];
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(next);
    const post = posts.find((item) => item.id === id)!;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setNotice(
        `${post.name}’s ${dateLabel(post.date)} post ${removing ? "removed from Saved." : "saved. Find it in Saved."}`,
      );
    } catch {
      setNotice(
        "Updated for this visit. Browser storage is unavailable, so saved posts will reset when you reload.",
      );
    }
    if (removing && savedView)
      requestAnimationFrame(() => {
        (nextPost
          ? document.getElementById(`save-${nextPost.id}`)
          : feedTitle.current
        )?.focus({ preventScroll: true });
      });
  }

  function showAbout() {
    dialogTrigger.current = document.activeElement as HTMLElement;
    dialog.current?.showModal();
  }
  function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls =
      event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    }
  }
  function focusFeed() {
    requestAnimationFrame(() => {
      feedTitle.current?.focus({ preventScroll: true });
      feedTitle.current?.scrollIntoView({ block: "start" });
    });
  }
  function openFeed(view: "feed" | "saved") {
    setSavedView(view === "saved");
    resetFilters();
    focusFeed();
  }
  function followFeed(
    event: MouseEvent<HTMLAnchorElement>,
    view: "feed" | "saved",
  ) {
    if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    )
      openFeed(view);
  }
  function resetFilters() {
    setCategory("All posts");
    setQuery("");
    setSort("picks");
  }
  function clearFilters() {
    resetFilters();
    requestAnimationFrame(() => document.getElementById("search")?.focus());
  }
  function selectCategory(value: Category) {
    history.pushState(null, "", "#feed");
    setSavedView(false);
    setCategory(value);
    setQuery("");
    setSort("picks");
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(".filter-active")
        ?.focus({ preventScroll: true });
      document
        .getElementById("feed-controls")
        ?.scrollIntoView({ block: "start" });
    });
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="The Pond home">
            <FrogMark />
            <span>
              the pond<span className="brand-dot">.</span>
            </span>
            <span className="brand-by">an IdentityMD community feed</span>
          </a>
          <nav aria-label="Main navigation">
            <a
              className={!savedView ? "nav-active" : ""}
              aria-current={!savedView ? "page" : undefined}
              href="#feed"
              onClick={(event) => followFeed(event, "feed")}
            >
              The feed
            </a>
            <a
              className={savedView ? "nav-active" : ""}
              aria-current={savedView ? "page" : undefined}
              href="#saved"
              onClick={(event) => followFeed(event, "saved")}
            >
              <Bookmark size={16} />
              Saved
              {saved.length > 0 && (
                <span className="saved-count">{saved.length}</span>
              )}
            </a>
            <button type="button" onClick={showAbout}>
              About
            </button>
          </nav>
          <a
            className="header-link"
            href="https://imd.fun"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore IdentityMD <ArrowUpRight size={17} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </header>

      <main id="main" className="page-shell" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Signal from <br />
              the <span>pond.</span>
            </h1>
            <p>Top tweets about IdentityMD, all in one place.</p>
            <a
              className="primary-button"
              href="#feed"
              onClick={(event) => followFeed(event, "feed")}
            >
              Explore the feed <ArrowDown size={17} />
            </a>
          </div>
          <div className="hero-art">
            <img
              src="./images/pond-agents.webp"
              alt="Two Pepe frogs equipped with an AI blaster and a laptop, ready to discover ideas."
              width="1536"
              height="1024"
              fetchPriority="high"
            />
          </div>
        </section>

        <div className="collection-note">
          <button type="button" onClick={showAbout}>
            A curated snapshot <Info size={14} />
          </button>
        </div>

        <div className="content-layout">
          <section className="feed-section" aria-labelledby="feed-title">
            <div className="section-heading">
              <div className="feed-title-group">
                <span className="heading-icon">
                  {savedView ? <Bookmark size={21} /> : <Flame size={21} />}
                </span>
                <h2 ref={feedTitle} id="feed-title" tabIndex={-1}>
                  {savedView ? "Saved posts" : "The feed"}
                </h2>
                <span className="count-badge">
                  {savedView ? saved.length : posts.length}
                </span>
              </div>
              <div className="sort-control">
                <label htmlFor="sort">Sort by</label>
                <div className="select-wrap">
                  <select
                    id="sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as Sort)}
                  >
                    <option value="picks">Pond picks</option>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            {savedView && (
              <p className="feed-intro">
                Good ideas, kept close. Saved only in this browser.
              </p>
            )}
            <div className="feed-controls" id="feed-controls">
              <div
                className="filter-buttons"
                role="group"
                aria-label="Filter posts by topic"
              >
                {categories.map((item) => {
                  const Icon = categoryIcons[item];
                  return (
                    <button
                      type="button"
                      key={item}
                      aria-pressed={category === item}
                      className={category === item ? "filter-active" : ""}
                      onClick={() => setCategory(item)}
                    >
                      <Icon size={15} />
                      {item}
                    </button>
                  );
                })}
              </div>
              <div className="search-control">
                <label className="search-label" htmlFor="search">
                  Search the feed
                </label>
                <div className="search-box">
                  <Search size={18} />
                  <input
                    id="search"
                    name="search"
                    type="search"
                    autoComplete="off"
                    placeholder="Search posts, people, or ideas…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query && (
                    <button
                      className="icon-button"
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setQuery("");
                        document.getElementById("search")?.focus();
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="results-meta" role="status">
              {visiblePosts.length}{" "}
              {visiblePosts.length === 1 ? "post" : "posts"}
              {query.trim()
                ? ` matching “${query.trim()}”`
                : category !== "All posts"
                  ? ` about ${category.toLowerCase()}`
                  : savedView
                    ? " saved for later"
                    : " selected for the pond"}
              {(query || category !== "All posts") && (
                <button type="button" onClick={clearFilters}>
                  Clear filters <X size={12} />
                </button>
              )}
            </div>
            {visiblePosts.length ? (
              <div className="posts-grid">
                {visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    rank={posts.indexOf(post) + 1}
                    saved={saved.includes(post.id)}
                    onSave={toggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                {savedView && saved.length === 0 ? (
                  <Bookmark size={32} />
                ) : (
                  <Search size={32} />
                )}
                <h3>
                  {savedView && saved.length === 0
                    ? "A little quiet in here."
                    : "No posts found."}
                </h3>
                <p>
                  {savedView && saved.length === 0
                    ? "Save a post from the feed to keep a good idea for later."
                    : "Try another search or clear your filters to see more posts."}
                </p>
                {savedView && saved.length === 0 ? (
                  <a
                    className="secondary-button"
                    href="#feed"
                    onClick={(event) => followFeed(event, "feed")}
                  >
                    Explore the feed <ArrowRight size={16} />
                  </a>
                ) : (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
            <div className="feed-end">
              <FrogMark />
              <p>You’ve reached the edge of the pond.</p>
              <a
                href="https://x.com/search?q=IdentityMD&src=typed_query"
                target="_blank"
                rel="noopener noreferrer"
              >
                Keep exploring on X <ArrowUpRight size={15} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </section>

          <aside className="sidebar" aria-label="About the collection">
            <section className="mission-card">
              <div className="mission-top">
                <span className="mini-brand">
                  <Cpu size={18} />
                  identity<span>.md</span>
                </span>
                <ArrowUpRight size={18} />
              </div>
              <div className="circuit-art" aria-hidden="true">
                <span />
                <span />
                <span />
                <div className="chip">
                  <Cpu size={35} />
                </div>
                <span />
                <span />
                <span />
              </div>
              <h2>About IdentityMD</h2>
              <p>Meet the project behind the conversation.</p>
              <a
                href="https://imd.fun"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discover IdentityMD <ArrowUpRight size={16} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </section>
            <section className="topics-card">
              <h2>
                <Sparkles size={18} />
                Around the pond
              </h2>
              <p>A few good rabbit holes.</p>
              {(["Building", "Ideas", "Community"] as const).map(
                (item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectCategory(item)}
                  >
                    <span className="topic-number">0{index + 1}</span>
                    <span>
                      <strong>
                        {item === "Building"
                          ? "Agents that ship"
                          : item === "Ideas"
                            ? "Identity meets AI"
                            : "People of the pond"}
                      </strong>
                      <small>
                        {posts.filter((post) => post.category === item).length}{" "}
                        curated posts · {item}
                      </small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ),
              )}
            </section>
            <section className="curation-card">
              <span className="curation-icon">
                <ShieldCheck size={21} />
              </span>
              <h2>About this collection</h2>
              <p>
                Excerpts and summaries link to the original posts on X.
              </p>
              <button type="button" onClick={showAbout}>
                How we pick posts <ArrowRight size={14} />
              </button>
            </section>
            <p className="snapshot-note">
              <span className="status-dot" />
              Snapshot · {dateLabel(snapshotDate)}
              <br />
              <span>
                Independent community project.
                <br />
                Not affiliated with X.
              </span>
            </p>
          </aside>
        </div>

        <footer className="site-footer">
          <a className="brand footer-brand" href="#">
            <FrogMark />
            <span>the pond.</span>
          </a>
          <p>Less noise. More ribbit.</p>
          <button type="button" onClick={showAbout}>
            About this feed <ArrowUpRight size={14} />
          </button>
        </footer>
      </main>
      <p className="sr-only" role="status">
        {notice}
      </p>
      <div
        className={`toast ${notice ? "toast-visible" : ""}`}
        role="region"
        aria-label="Bookmark notification"
      >
        <Check size={18} aria-hidden="true" />
        <p>{notice}</p>
        {notice && (
          <button
            type="button"
            className="icon-button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <dialog
        ref={dialog}
        className="about-dialog"
        aria-labelledby="about-title"
        onKeyDown={trapDialogFocus}
        onClose={() => dialogTrigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-content">
          <div className="dialog-top">
            <FrogMark />
            <button
              type="button"
              className="icon-button"
              onClick={() => dialog.current?.close()}
              aria-label="Close about this feed"
            >
              <X size={22} />
            </button>
          </div>
          <h2 id="about-title">A little more signal.</h2>
          <p>
            The Pond is an independent collection of public posts about
            IdentityMD, curated for people curious about AI agents and the
            people building with them.
          </p>
          <h3>What makes a Pond pick?</h3>
          <p>
            Posts are selected for their connection to IdentityMD, a useful
            idea, a concrete build, or a community perspective. “Top” means
            editorial picks, not a ranking by likes or reach.
          </p>
          <h3>A snapshot, not a live feed</h3>
          <p>
            Collected on {dateLabel(snapshotDate)}. Excerpts and summaries link
            to their originals on X. Public indexing can be incomplete; check
            the source for full context and current details. X may ask you to
            sign in.
          </p>
          <h3>Your saved posts stay here</h3>
          <p>
            Bookmarks are stored in this browser. They aren’t synced to X or
            another device. Clearing your browser’s site data also clears your
            saved posts.
          </p>
          <a
            className="secondary-button"
            href="https://imd.fun"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit IdentityMD <ExternalLink size={15} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </dialog>
    </>
  );
}
