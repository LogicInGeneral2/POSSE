import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../api/constants";
import LoadingSpinner from "../components/commons/loading";
import { refreshAccessToken } from "../services";

interface JWTPayload {
  exp: number;
  [key: string]: any;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    const success = await refreshAccessToken();

    setIsAuthorized(success);
    setIsRefreshing(false);
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    const decoded = jwtDecode<JWTPayload>(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;

    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    return <LoadingSpinner />;
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedRoute;
