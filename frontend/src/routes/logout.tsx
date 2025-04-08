import { handleLogout } from "../components/logout";
import { Navigate } from "react-router";

export const Logout = () => {
  handleLogout();

  return <Navigate to="/" />;
};
