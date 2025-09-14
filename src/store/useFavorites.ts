import { useEffect, useMemo, useState } from "react";

export type FavouriteItem = {
  id: string;
  url: string;
  breedId?: string | null;
};

const KEY = "catlover:favourites";

function read(): FavouriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: FavouriteItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useFavourites() {
  const [items, setItems] = useState<FavouriteItem[]>(() => read());

  useEffect(() => write(items), [items]);

  // keep tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isFavourited = useMemo(() => {
    const ids = new Set(items.map((i) => i.id));
    return (id: string) => ids.has(id);
  }, [items]);

  function add(item: FavouriteItem) {
    setItems((prev) =>
      prev.some((i) => i.id === item.id) ? prev : [item, ...prev]
    );
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function toggle(item: FavouriteItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      return exists ? prev.filter((i) => i.id !== item.id) : [item, ...prev];
    });
  }

  return { items, add, remove, toggle, isFavourited };
}
