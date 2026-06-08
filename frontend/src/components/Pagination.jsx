function Pagination({
  page,

  setPage,

  hasNextPage,
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 sm:justify-end">
      <div className="text-sm text-slate-600 sm:mr-4">Page {page}</div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => setPage(page + 1)}
          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
