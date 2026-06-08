import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  fetchCandidateDetailApi,
  addScoreApi,
  generateSummaryApi,
} from "../api/candidateApi";
import MarkdownRenderer from "../components/MarkdownRenderer";
import useScoreStream from "../hooks/useScoreStream";

function CandidateDetailPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [scoreData, setScoreData] = useState({
    category: "",
    score: 1,
    note: "",
  });

  useEffect(() => {
    fetchCandidate();
  }, []);

  // SSE: real-time score updates
  const handleScoreFromStream = useCallback((score) => {
    setCandidate((prev) => {
      if (!prev) return prev;
      // Avoid duplicates (e.g. if the submitter is also the listener)
      const exists = (prev.scores ?? []).some((s) => s.id === score.id);
      if (exists) return prev;
      return {
        ...prev,
        scores: [...(prev.scores ?? []), score],
      };
    });
  }, []);

  useScoreStream(id, handleScoreFromStream);

  const fetchCandidate = async () => {
    try {
      const data = await fetchCandidateDetailApi(id);

      setCandidate(data);
      setPageError("");
    } catch (err) {
      console.log(err);
      setPageError("Unable to load candidate details.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();

    try {
      setScoreSubmitting(true);
      setActionError("");
      await addScoreApi(id, scoreData);
      fetchCandidate();
      setScoreData({
        category: "",
        score: 1,
        note: "",
      });
    } catch (err) {
      console.log(err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit score.";
      setActionError(String(message));
    } finally {
      setScoreSubmitting(false);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    setActionError("");

    try {
      const data = await generateSummaryApi(id);

      setCandidate((prev) => ({
        ...(prev || {}),
        ai_summary: (data.summary ?? "").trim(),
      }));
    } catch (err) {
      console.log(err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate summary.";
      setActionError(String(message));
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-56 animate-pulse rounded-lg bg-slate-100 lg:col-span-2" />
          <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-900">
          Something went wrong
        </div>
        <div className="mt-1 text-sm text-slate-600">{pageError}</div>
        <div className="mt-4 flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to candidates
          </Link>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchCandidate();
            }}
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-slate-900">
          Candidate not found
        </div>
        <div className="mt-4">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              Candidates
            </Link>
            <span className="text-slate-300">/</span>
            <span className="truncate text-slate-900">{candidate.name}</span>
          </div>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">
            {candidate.name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <div>
              <span className="text-slate-500">Role:</span>{" "}
              {candidate.role_applied}
            </div>
            <div>
              <span className="text-slate-500">Status:</span> {candidate.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchCandidate();
            }}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </header>

      {actionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Candidate profile
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {candidate.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Skills</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {candidate.skills || "—"}
                </dd>
              </div>
            </dl>

            {candidate.internal_notes && (
              <div className="mt-5 rounded-lg bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-700">
                  Internal notes
                </div>
                <div className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {candidate.internal_notes}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Scores</h2>
                <div className="text-xs text-slate-500">
                  {(candidate.scores ?? []).length} total
                </div>
              </div>
            </div>

            {(candidate.scores ?? []).length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-600">
                No scores yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {(candidate.scores ?? []).map((score) => (
                  <li key={score.id} className="px-5 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {score.category}
                        </div>
                        {score.note && (
                          <div className="mt-1 whitespace-pre-line text-sm text-slate-600">
                            {score.note}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                          {score.score}/5
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  AI Summary
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Generate a short overview based on candidate information.
                </p>
              </div>
              <button
                type="button"
                onClick={generateSummary}
                disabled={summaryLoading}
                className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {summaryLoading ? "Generating..." : "Generate"}
              </button>
            </div>

            {candidate.ai_summary ? (
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <MarkdownRenderer content={candidate.ai_summary} />
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-600">
                No summary generated yet.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Add score</h2>
            <p className="mt-1 text-sm text-slate-600">
              Log an evaluation for this candidate.
            </p>

            <form onSubmit={handleScoreSubmit} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Category
                </label>
                <input
                  required
                  placeholder="e.g. Communication"
                  value={scoreData.category}
                  onChange={(e) =>
                    setScoreData({
                      ...scoreData,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">
                    Score (1-5)
                  </label>
                  <span className="text-xs font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded-full shadow-sm transition-all duration-200 scale-105">
                    {scoreData.score} / 5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={scoreData.score}
                  onChange={(e) =>
                    setScoreData({
                      ...scoreData,
                      score: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <div className="flex justify-between text-[10px] font-medium text-slate-400 px-1 select-none">
                  <span>1 (Poor)</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5 (Excellent)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Note
                </label>
                <textarea
                  rows={4}
                  placeholder="Optional context"
                  value={scoreData.note}
                  onChange={(e) =>
                    setScoreData({
                      ...scoreData,
                      note: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={scoreSubmitting}
                className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scoreSubmitting ? "Submitting..." : "Submit score"}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Tips</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>
                Use consistent categories (e.g. Technical, Culture,
                Communication).
              </li>
              <li>Add short notes that justify the score.</li>
              <li>Generate a summary once you have at least one score.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CandidateDetailPage;
