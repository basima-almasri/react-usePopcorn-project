import { useEffect, useState } from "react";
export function useLocalStorage(intial, key) {
  const intialWatched = () => {
    const moviesWatched = JSON.parse(localStorage.getItem("watched"));
    return moviesWatched ? moviesWatched : intial;
  };
  const [value, setValue] = useState(intialWatched());
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);
  return [value, setValue];
}
