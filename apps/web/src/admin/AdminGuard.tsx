import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/admin/auth/useAuth";

export function AdminGuard() {
  const loc = useLocation();
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "rgba(255,255,255,0.75)",
          pointerEvents: "none"
        }}
      >
        Checking session…
      </div>
    );
  }

  if (status !== "authed") {
    const from = loc.pathname + loc.search;
    return <Navigate to="/admin/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
