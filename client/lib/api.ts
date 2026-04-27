import type {
  LoginDTO,
  LoginResponseDTO,
  UserDTO,
  User,
  VerifyUserDTO,
  PasswordResetDTO,
  Expense,
  ApiResponse,
} from "@/types";

const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const BASE_URL = configuredBaseUrl || "/api";
export const AUTH_EXPIRED_EVENT = "expensify:auth-expired";

function buildUrl(path: string): string {
  const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    if (!s || typeof s.getItem !== "function") return null;
    // probe it — Node 22 may expose localStorage with methods that throw
    s.getItem("__probe__");
    return s;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return storage()?.getItem("token") ?? null;
}

export function setToken(token: string): void {
  storage()?.setItem("token", token);
}

export function removeToken(): void {
  storage()?.removeItem("token");
}

export function getStoredUsername(): string | null {
  return storage()?.getItem("username") ?? null;
}

export function setStoredUsername(username: string): void {
  storage()?.setItem("username", username);
}

export function removeStoredUsername(): void {
  storage()?.removeItem("username");
}

function clearStoredAuth(): void {
  removeToken();
  removeStoredUsername();
  storage()?.removeItem("expensify-profile");
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith("/auth") || path.startsWith("auth");
}

function handleExpiredAuth(path: string, status: number): void {
  const token = getToken();
  if (!token || status !== 401 || isAuthEndpoint(path)) return;

  clearStoredAuth();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      "Network error: unable to reach the backend. Please check server/CORS configuration and try again."
    );
  }

  const text = await response.text();

  if (!response.ok) {
    handleExpiredAuth(path, response.status);
    throw new ApiError(response.status, text || `Error ${response.status}`);
  }

  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const authApi = {
  login: (data: LoginDTO) =>
    request<LoginResponseDTO>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  signup: (data: UserDTO) =>
    request<ApiResponse<User>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verify: (data: VerifyUserDTO) =>
    request<string>("/auth/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resend: (username: string) =>
    request<string>(`/auth/resend?username=${encodeURIComponent(username)}`, {
      method: "POST",
    }),

  forgot: (username: string) =>
    request<string>(`/auth/forget?username=${encodeURIComponent(username)}`, {
      method: "POST",
    }),

  resetPassword: (data: PasswordResetDTO) =>
    request<string>("/auth/forget/newPassword", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const expenseApi = {
  add: (data: Expense) =>
    request<ApiResponse<Expense>>("/add", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: () => request<ApiResponse<Expense[]>>("/expenses"),

  remove: (data: Expense) =>
    request<ApiResponse<Expense>>("/remove", {
      method: "DELETE",
      body: JSON.stringify(data),
    }),

  update: (data: Expense) =>
    request<ApiResponse<Expense>>("/update", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
