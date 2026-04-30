import { useState, useEffect } from "react";
import { IndustryIntelligenceData } from "@/types/industry-intelligence";

interface State {
  data: IndustryIntelligenceData | null;
  loading: boolean;
  error: string | null;
}

export function useIndustryIntelligence() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch("http://localhost:8000/api/industry-intelligence")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<IndustryIntelligenceData>;
      })
      .then((json) => {
        if (!cancelled) setState({ data: json, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
