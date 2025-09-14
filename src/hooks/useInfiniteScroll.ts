import { useCallback, useEffect, useRef } from "react";

export type UseInfiniteScrollOptions = {
  /** Called when the sentinel enters view. */
  onLoadMore: () => void;
  /** Prevent the observer from firing (e.g., while loading). */
  disabled?: boolean;
  /** Stop observing when there's no more data. */
  hasMore?: boolean;
  /** IntersectionObserver options */
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * Simple infinite-scroll hook.
 * Attaches an IntersectionObserver to a "sentinel" element you render at the bottom of your list.
 */
export function useInfiniteScroll({
  onLoadMore,
  disabled = false,
  hasMore = true,
  root = null,
  rootMargin = "100px",
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const targetRef = useRef<Element | null>(null);
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  // Use a callback ref so React always gives us the latest DOM node
  const setRef = useCallback((node: Element | null) => {
    targetRef.current = node;
  }, []);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || disabled || !hasMore) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !disabled && hasMore) {
          // Call the latest callback
          callbackRef.current?.();
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, disabled, hasMore]);

  return { setRef };
}
