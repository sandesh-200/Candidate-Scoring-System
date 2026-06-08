import { useEffect, useRef } from "react";
export default function useScoreStream(candidateId, onScoreAdded) {
  const callbackRef = useRef(onScoreAdded);


  useEffect(() => {
    callbackRef.current = onScoreAdded;
  }, [onScoreAdded]);

  useEffect(() => {
    if (!candidateId) return;

    const token = localStorage.getItem("token");
    const url = `http://127.0.0.1:8000/candidates/${candidateId}/stream`;

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "score_added" && data.score) {
          callbackRef.current(data.score);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection lost — will auto-reconnect.");
    };

    return () => {
      eventSource.close();
    };
  }, [candidateId]);
}
