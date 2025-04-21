// ProtectedRoute.tsx
import { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../api/constants"; // Correctly imported
import LoadingSpinner from "../components/commons/loading";
import { refreshAccessToken } from "../services";
import { handleLogout } from "../api";

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

  const checkAuth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN); // Using ACCESS_TOKEN constant
    if (!token) {
      handleLogout(); // Clear tokens and redirect
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (tokenExpiration < now) {
        if (!isRefreshing) {
          setIsRefreshing(true);
          const success = await refreshAccessToken();
          if (success) {
            setIsAuthorized(true);
          } else {
            handleLogout(); // Log out if refresh fails
            setIsAuthorized(false);
          }
          setIsRefreshing(false);
        }
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      handleLogout(); // Log out if token is invalid
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    checkAuth().catch(() => {
      handleLogout(); // Log out on unexpected errors
      setIsAuthorized(false);
    });

    // Periodically check token validity (every 30 seconds)
    const interval = setInterval(() => {
      checkAuth().catch(() => {
        handleLogout();
        setIsAuthorized(false);
      });
    }, 30 * 1000); // Reduced interval for faster detection

    return () => clearInterval(interval);
  }, []);

  if (isAuthorized === null) {
    return <LoadingSpinner />;
  }

  return isAuthorized ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedRoute;
