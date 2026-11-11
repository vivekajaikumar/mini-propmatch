
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
    children: ReactNode;
};

export function ProtectedRoute({
                                   children,
                               }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Wait until the server verifies the session.
    if (loading) {
        return (
            <div
                role="status"
                className="flex min-h-[60vh] items-center justify-center text-gray-400"
            >
                Checking your session...
            </div>
        );
    }

    // Visitors must log in before accessing this page.
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Authenticated users can access the page.
    return <>{children}</>;
}
