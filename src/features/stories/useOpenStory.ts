import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../state/provider';

let activeTransition: ViewTransition | null = null;
export function cancelStoryTransition() {
  activeTransition?.skipTransition();
}
function waitForStoryRender(id: string) {
  return new Promise<void>((resolve) => {
    const ready = () =>
      document.querySelector<HTMLElement>('article[data-story-id]')?.dataset.storyId === id;
    if (ready()) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (ready()) finish();
    });
    const timeout = window.setTimeout(finish, 1000);
    function finish() {
      observer.disconnect();
      window.clearTimeout(timeout);
      resolve();
    }
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export function useOpenStory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reduced } = useApp();
  return (id: string, card: HTMLElement) => {
    const from = location.pathname + location.search;
    const open = (motion: 'shared' | 'soft' | 'reduced') =>
      navigate('/story/' + id, { state: { from, motion } });
    if (reduced || typeof document.startViewTransition !== 'function') {
      activeTransition?.skipTransition();
      open(reduced ? 'reduced' : 'soft');
      return;
    }
    // Ignore a repeated activation before the first navigation snapshot is ready.
    if (activeTransition && document.documentElement.dataset.articleTransition === 'capturing')
      return;
    activeTransition?.skipTransition();
    document
      .querySelectorAll<HTMLElement>('[data-story-opening]')
      .forEach((element) => delete element.dataset.storyOpening);
    const cover =
      card.querySelector<HTMLElement>('.hero') ??
      card.querySelector<HTMLElement>('img,.image-fallback');
    const sourceTitle = cover?.querySelector<HTMLElement>('.hero-copy');
    if (cover) cover.dataset.storyOpening = 'true';
    if (sourceTitle) sourceTitle.dataset.storyOpeningTitle = 'true';
    document.documentElement.dataset.articleTransition = 'capturing';
    const transition = document.startViewTransition(async () => {
      document.documentElement.dataset.articleTransition = 'opening';
      const rendered = waitForStoryRender(id);
      flushSync(() => open('shared'));
      // Declarative Router may schedule a concurrent render; snapshot the committed article.
      await rendered;
    });
    activeTransition = transition;
    const cleanup = () => {
      if (cover) delete cover.dataset.storyOpening;
      if (sourceTitle) delete sourceTitle.dataset.storyOpeningTitle;
      if (activeTransition === transition) {
        activeTransition = null;
        delete document.documentElement.dataset.articleTransition;
      }
    };
    // A skipped or unsupported snapshot must never interfere with navigation.
    void transition.ready.catch(() => {});
    void transition.finished.then(cleanup, cleanup);
  };
}
