import { useState, useEffect, useCallback } from "react";
import { Storage } from "../storage/asyncStorage";

export function useKeyword() {
  const [keyword, setKeywordState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Storage.getKeyword().then((saved) => {
      setKeywordState(saved);
      setLoaded(true);
    });
  }, []);

  const setKeyword = useCallback(async (value: string) => {
    await Storage.setKeyword(value);
    setKeywordState(value);
  }, []);

  return { keyword, setKeyword, loaded };
}
