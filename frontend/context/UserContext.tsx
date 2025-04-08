import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  Student,
  Supervisor,
  UserContextType,
} from "../src/services/types";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../src/api/constants";

// Create UserContext with a default value of `undefined`
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | Student | Supervisor | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sync user state to localStorage when changed
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData: User | Student | Supervisor) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Clear JWT tokens from localStorage
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  };

  // Return loading state to prevent UI flickers
  if (loading) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to safely use UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
