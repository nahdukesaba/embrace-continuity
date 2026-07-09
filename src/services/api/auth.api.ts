import { http } from "@/services/http";
import type { AppUser, AuthSession, LoginInput, RegisterInput } from "@/types";

/** Auth is always live against the backend (per Chunk 2 plan). */
export const authApi = {
  async signIn(input: LoginInput): Promise<AuthSession> {
    const { data } = await http.post<AuthSession>("/auth/login", input);
    return data;
  },
  /** Register returns just the created user (no token); admin must approve. */
  async signUp(input: RegisterInput): Promise<{ user: AppUser }> {
    const { data } = await http.post<{ user: AppUser }>("/auth/register", input);
    return data;
  },
  async me(_token: string | null): Promise<AppUser | null> {
    const { data } = await http.get<AppUser>("/auth/me");
    return data;
  },
};
