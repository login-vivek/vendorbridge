import { useContext } from "react";
import { AuthContext } from "./AuthContext";
export type { Role, AuthUser } from "./AuthContext";

export function useAuth() {
  return useContext(AuthContext);
}
