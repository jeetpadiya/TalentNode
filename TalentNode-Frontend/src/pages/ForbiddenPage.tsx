import { Link } from "react-router-dom";

const ForbiddenPage = () => {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
      <p className="text-sm text-gray-600">
        You don’t have permission to view this page.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/dashboard" className="btn btn-primary">
          Go to dashboard
        </Link>
        <Link to="/" className="btn btn-secondary">
          Home
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;

