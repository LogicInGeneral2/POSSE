import { useUser } from "../../../context/UserContext";
import { logoutUser } from "../../services";

export const handleLogout = async () => {
  const { logout } = useUser();

  await logoutUser();
  logout();
};
