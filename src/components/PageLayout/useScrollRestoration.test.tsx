import { afterEach, describe, expect, it } from 'vitest';
import { useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { useScrollRestoration } from './useScrollRestoration';

/**
 * Scrolls the region from a layout effect, i.e. during the commit and before
 * React has run any passive effect. Rendered as a sibling *after* the region
 * so the region's ref is already attached when it runs.
 */
const ScrollDuringCommit = ({ to }: { to: number }) => {
  useLayoutEffect(() => {
    const region = document.querySelector<HTMLElement>('[data-testid="region"]')!;
    region.scrollTop = to;
    region.dispatchEvent(new Event('scroll'));
  }, [to]);
  return null;
};

const Harness = ({ pageKey, scrollOnMount }: { pageKey: string; scrollOnMount?: number }) => {
  const ref = useScrollRestoration(pageKey, undefined);
  return (
    <>
      <div ref={ref} data-testid="region" style={{ height: 100, overflow: 'auto' }}>
        <div style={{ height: 1000 }} />
      </div>
      {scrollOnMount !== undefined && <ScrollDuringCommit to={scrollOnMount} />}
    </>
  );
};

let root: Root | undefined;
let host: HTMLElement | undefined;

afterEach(() => {
  root?.unmount();
  host?.remove();
});

const mount = () => {
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
};

const render = (pageKey: string, scrollOnMount?: number) => {
  flushSync(() => root!.render(<Harness pageKey={pageKey} scrollOnMount={scrollOnMount} />));
  return host!.querySelector<HTMLElement>('[data-testid="region"]')!;
};

/** A user scroll: move, then the event the browser would dispatch. */
const scroll = (element: HTMLElement, top: number) => {
  element.scrollTop = top;
  element.dispatchEvent(new Event('scroll'));
};

describe('useScrollRestoration', () => {
  // The Chromatic failure in `RestoresScrollPerKey`. The listener used to be
  // attached in a passive effect, so a scroll landing between the commit and
  // React's passive-effect flush was never recorded - and returning to that
  // page restored 0. Storybook's production build starts a play function
  // inside that window; the dev server happened not to, which is why it only
  // failed on Chromatic.
  it('records a scroll that happens before passive effects have run', () => {
    mount();
    const region = render('tickets', 200);
    expect(region.scrollTop).toBe(200);

    render('team');
    expect(region.scrollTop).toBe(0);

    render('tickets');
    expect(region.scrollTop).toBe(200);
  });

  it('keeps each key’s own offset', () => {
    mount();
    const region = render('tickets');
    scroll(region, 200);
    render('team');
    scroll(region, 80);
    render('tickets');
    expect(region.scrollTop).toBe(200);
    render('team');
    expect(region.scrollTop).toBe(80);
  });
});
