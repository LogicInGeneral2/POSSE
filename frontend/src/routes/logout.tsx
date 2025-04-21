import { Navigate } from "react-router";
import { handleLogout } from "../api";

export const Logout = () => {
  handleLogout();
  return <Navigate to="/" />;
};
