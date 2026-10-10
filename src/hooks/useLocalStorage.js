import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Could not read "${key}" from localStorage`, error);
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    function syncFromStorage(event) {
      if (event.key !== key || event.newValue === null) return;

      try {
        setValue(JSON.parse(event.newValue));
      } catch (error) {
        console.error(`Could not read "${key}" from localStorage`, error);
      }
    }

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, [key]);

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch (error) {
          console.error(`Could not save "${key}" to localStorage`, error);
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update, loaded];
}