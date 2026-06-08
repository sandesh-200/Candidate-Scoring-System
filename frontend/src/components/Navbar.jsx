import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            TK
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
              TechKraft Dashboard
            </div>
            <div className="text-xs text-slate-500">
              Candidate review console
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
