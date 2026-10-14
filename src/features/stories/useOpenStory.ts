import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../../state/provider';
import { animate } from 'motion/react';

let activeTransition: ViewTransition | null = null;
let returnRoute: string | null = null;
let returning = false;
let markerSequence = 0;
function markCover(cover?: HTMLElement, title?: HTMLElement | null) {
  const owner = String(++markerSequence);
  if (cover) {
    cover.dataset.storyMotionOwner = owner;
    cover.dataset.storyOpening = 'true';
  }
  if (title) {
    title.dataset.storyMotionOwner = owner;
    title.dataset.storyOpeningTitle = 'true';
  }
  return () => {
    for (const element of [cover, title]) {
      if (element?.dataset.storyMotionOwner !== owner) continue;
      delete element.dataset.storyOpening;
      delete element.dataset.storyOpeningTitle;
      delete element.dataset.storyMotionOwner;
    }
  };
}
export function cancelStoryTransition() {
  if (
    document.documentElement.dataset.articleTransition === 'returning' &&
    document.querySelector<HTMLElement>('main[data-route]')?.dataset.route === returnRoute
  )
    return;
  activeTransition?.skipTransition();
}
function waitForRender(ready: () => boolean) {
  return new Promise<void>((resolve) => {
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
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-route'],
    });
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
      returning = false;
      returnRoute = null;
      open(reduced ? 'reduced' : 'soft');
      return;
    }
    // Ignore a repeated activation before the first navigation snapshot is ready.
    if (activeTransition && document.documentElement.dataset.articleTransition === 'capturing')
      return;
    activeTransition?.skipTransition();
    returning = false;
    returnRoute = null;
    document
      .querySelectorAll<HTMLElement>('[data-story-opening], [data-story-opening-title]')
      .forEach((element) => {
        delete element.dataset.storyOpening;
        delete element.dataset.storyOpeningTitle;
      });
    const cover =
      card.querySelector<HTMLElement>('.hero') ??
      card.querySelector<HTMLElement>('img,.image-fallback');
    const sourceTitle = cover?.querySelector<HTMLElement>('.hero-copy');
    const clearMarkers = markCover(cover ?? undefined, sourceTitle);
    document.documentElement.dataset.articleTransition = 'capturing';
    const transition = document.startViewTransition(async () => {
      document.documentElement.dataset.articleTransition = 'opening';
      const rendered = waitForRender(
        () => document.querySelector<HTMLElement>('article[data-story-id]')?.dataset.storyId === id,
      );
      flushSync(() => open('shared'));
      // Declarative Router may schedule a concurrent render; snapshot the committed article.
      await rendered;
    });
    activeTransition = transition;
    const cleanup = () => {
      clearMarkers();
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

export function useBackStory(id: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const { reduced } = useApp();
  return async () => {
    if (returning) return;
    returning = true;
    const origin = location.state?.from;
    const target = typeof origin === 'string' && origin.startsWith('/') ? origin : '/';
    const go = () => (target === origin ? navigate(-1) : navigate('/'));
    const ready = () =>
      document.querySelector<HTMLElement>('main[data-route]')?.dataset.route === target;
    activeTransition?.skipTransition();
    if (reduced || typeof document.startViewTransition !== 'function') {
      try {
        const article = document.querySelector<HTMLElement>('article[data-story-id]');
        if (article)
          await animate(
            article,
            { opacity: 0, y: reduced ? 0 : 12 },
            { duration: reduced ? 0.1 : 0.18, ease: [0.22, 1, 0.36, 1] },
          );
        const rendered = waitForRender(ready);
        go();
        await rendered;
      } finally {
        returning = false;
      }
      return;
    }
    returnRoute = target;
    document.documentElement.dataset.articleTransition = 'closing';
    let cover: HTMLElement | undefined;
    let title: HTMLElement | null | undefined;
    let clearMarkers = () => {};
    const transition = document.startViewTransition(async () => {
      document.documentElement.dataset.articleTransition = 'returning';
      const rendered = waitForRender(ready);
      flushSync(go);
      await rendered;
      const candidates = [...document.querySelectorAll<HTMLElement>('[data-story-link]')].filter(
        (element) => element.dataset.storyLink === id,
      );
      const card = candidates.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      cover =
        card?.querySelector<HTMLElement>('.hero') ??
        card?.querySelector<HTMLElement>('img,.image-fallback') ??
        undefined;
      title = cover?.querySelector<HTMLElement>('.hero-copy');
      clearMarkers = markCover(cover, title);
    });
    activeTransition = transition;
    const cleanup = () => {
      clearMarkers();
      if (activeTransition === transition) {
        activeTransition = null;
        returnRoute = null;
        returning = false;
        delete document.documentElement.dataset.articleTransition;
      }
    };
    void transition.ready.catch(() => {});
    void transition.finished.then(cleanup, cleanup);
  };
}
