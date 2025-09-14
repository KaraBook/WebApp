import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
          <button onClick={logout} className="px-4 py-2 rounded border">
            Logout
          </button>
        </div>

        <div className="mt-6 bg-white shadow rounded-xl p-6">
          <p className="text-sm text-gray-600">Welcome,</p>
          <p className="text-xl font-medium">
            {user?.name || user?.mobile || "Owner"}
          </p>
          <p className="text-gray-500 mt-1">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
