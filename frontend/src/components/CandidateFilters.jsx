function CandidateFilters({
  filters,

  setFilters,

  onApply,

  onReset,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          <p className="text-xs text-slate-500">Narrow down candidates by role, skill, and status.</p>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Keyword</label>
          <input
            placeholder="Name or email"
            value={filters.keyword}
            onChange={(e) =>
              setFilters({
                ...filters,
                keyword: e.target.value,
              })
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Role Applied</label>
          <input
            placeholder="e.g. Frontend Engineer"
            value={filters.role_applied}
            onChange={(e) =>
              setFilters({
                ...filters,
                role_applied: e.target.value,
              })
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Skill</label>
          <input
            placeholder="e.g. React"
            value={filters.skill}
            onChange={(e) =>
              setFilters({
                ...filters,
                skill: e.target.value,
              })
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Status</label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default CandidateFilters;
