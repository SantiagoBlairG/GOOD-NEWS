import { NavLink, Link, Routes, Route, useLocation, useNavigationType } from 'react-router';
import { useLayoutEffect, useRef, useEffect } from 'react';
import { Sun, House, Compass, Bookmark, SlidersHorizontal } from 'lucide-react';
import { AppProvider, useApp } from '../state/provider';
import { SwipeDeck } from '../features/home/SwipeDeck';
import { Article } from '../features/stories/Article';
import { Discover } from '../features/discover/Discover';
import { Saved } from '../features/saved/Saved';
import { Profile } from '../features/profile/Profile';
import { ThemeToggle } from '../components/ThemeToggle';
import { cancelStoryTransition } from '../features/stories/useOpenStory';

import { Button } from '../components/ui/button';
function Missing() {
  return (
    <section className="empty">
      <Sun />
      <h1>A little detour.</h1>
      <p>We couldn’t find this page.</p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </section>
  );
}
const scrollPositions = new Map<string, number>();
function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(location);
  useLayoutEffect(() => {
    if (navigationType === 'POP') cancelStoryTransition();
    const old = previous.current;
    scrollPositions.set(old.key, window.scrollY);
    if (!old.pathname.startsWith('/story/'))
      scrollPositions.set(old.pathname + old.search, window.scrollY);
    const restore =
      navigationType === 'POP'
        ? scrollPositions.get(location.key)
        : !location.pathname.startsWith('/story/')
          ? scrollPositions.get(location.pathname + location.search)
          : 0;
    window.scrollTo(0, restore ?? 0);
    previous.current = location;
  }, [location, navigationType]);
  return null;
}
function Shell() {
  const { storageWarning } = useApp();
  const location = useLocation();
  const article = location.pathname.startsWith('/story/');
  const nav = useRef<HTMLElement>(null);
  const discoverSearch = useRef('');
  if (location.pathname === '/discover' || location.pathname === '/discover/map')
    discoverSearch.current = location.search;
  useEffect(() => {
    if (!nav.current) return;
    const update = () =>
      document.documentElement.style.setProperty(
        '--nav-height',
        `${nav.current?.offsetHeight ?? 90}px`,
      );
    const observer = new ResizeObserver(update);
    observer.observe(nav.current);
    update();
    return () => observer.disconnect();
  }, [article]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollRestoration />
      {!article && (
        <header className="brand-bar">
          <Link to="/" className="brand">
            <Sun />
            <span>
              bright side<span className="brand-dot">.</span>
            </span>
          </Link>
          <span className="edition">A little good goes a long way.</span>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>
      )}
      {storageWarning && !article && (
        <p role="status" className="storage-warning">
          {storageWarning}
        </p>
      )}
      <main id="main-content" tabIndex={-1} className={article ? 'article-main' : ''}>
        <Routes>
          <Route path="/" element={<SwipeDeck />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/map" element={<Discover fullMap />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/saved/topic/:topicId" element={<Saved />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/story/:storyId" element={<Article />} />
          <Route path="*" element={<Missing />} />
        </Routes>
      </main>
      {storageWarning && article && (
        <p role="status" className="storage-warning">
          {storageWarning}
        </p>
      )}
      {!article && (
        <nav ref={nav} className="bottom-nav" aria-label="Primary">
          {[
            { path: '/', label: 'Home', Icon: House },
            { path: '/discover', label: 'Discover', Icon: Compass },
            { path: '/saved', label: 'Saved', Icon: Bookmark },
            { path: '/profile', label: 'Profile', Icon: SlidersHorizontal },
          ].map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path === '/discover' ? path + discoverSearch.current : path}
              end={path === '/'}
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}
export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
