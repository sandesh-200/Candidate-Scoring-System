import { useEffect, useState } from "react";

import { fetchCandidatesApi } from "../api/candidateApi";

import { Link } from "react-router-dom";

import Pagination from "../components/Pagination";
import CandidateFilters from "../components/CandidateFilters";

function CandidateListPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    role_applied: "",
    skill: "",
    keyword: "",
  });

  useEffect(() => {
    fetchCandidates();
  }, [page]);

  const statusBadge = (status) => {
    const config = {
      new: "bg-sky-50 text-sky-700 ring-sky-600/20",
      reviewed: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
      hired: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
    };

    const classes = config[status] ?? "bg-slate-50 text-slate-700 ring-slate-600/20";

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${classes}`}>
        {status || "unknown"}
      </span>
    );
  };

  const fetchCandidates = async (options = {}) => {
    setLoading(true);

    try {
      const nextPage = options.page ?? page;
      const nextFilters = options.filters ?? filters;

      const params = {
        page: nextPage,
        page_size: 5,
      };

      if (nextFilters.status) {
        params.status = nextFilters.status;
      }

      if (nextFilters.role_applied) {
        params.role_applied = nextFilters.role_applied;
      }

      if (nextFilters.skill) {
        params.skill = nextFilters.skill;
      }

      if (nextFilters.keyword) {
        params.keyword = nextFilters.keyword;
      }

      const data = await fetchCandidatesApi(params);

      setCandidates(data);

      setHasNextPage(data.length === 5);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1);

    fetchCandidates({ page: 1 });
  };

  const handleReset = () => {
    const cleared = {
      status: "",
      role_applied: "",
      skill: "",
      keyword: "",
    };

    setFilters(cleared);
    setPage(1);
    fetchCandidates({ page: 1, filters: cleared });
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-600">
            Review applicants, add evaluation scores, and generate an interview-ready summary.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCandidates}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </header>

      <CandidateFilters
        filters={filters}
        setFilters={setFilters}
        onApply={handleFilter}
        onReset={handleReset}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Results</h2>
            <div className="text-xs text-slate-500">{candidates.length} candidates</div>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-sm font-medium text-slate-900">No candidates found</div>
            <div className="mt-1 text-sm text-slate-600">Try adjusting filters or clearing them.</div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="px-4 py-4 hover:bg-slate-50/50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {candidate.name}
                      </h3>
                      {statusBadge(candidate.status)}
                    </div>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-3">
                      <div className="truncate">{candidate.role_applied}</div>
                      <div className="hidden text-slate-300 sm:block">•</div>
                      <div className="truncate">{candidate.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/candidates/${candidate.id}`}
                      className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Pagination page={page} setPage={setPage} hasNextPage={hasNextPage} />
    </div>
  );
}

export default CandidateListPage;
