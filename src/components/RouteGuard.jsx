import { Navigate, useLocation } from "react-router-dom";

export default function RouteGuard({ allow, children }) {
    const loc = useLocation();
    // Se allow for false, redireciona para locked
    if (!allow) {
        return <Navigate to={`/locked?to=${encodeURIComponent(loc.pathname)}`} replace />;
    }
    return children;
}
