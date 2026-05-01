import type {
  LoginDTO,
  LoginResponseDTO,
  UserDTO,
  User,
  VerifyUserDTO,
  PasswordResetDTO,
  Expense,
  ExpenseSummary,
  AiInsightResponse,
  ApiResponse,
} from "@/types";

const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const BASE_URL = configuredBaseUrl || "/api";
export const AUTH_EXPIRED_EVENT = "rivo:auth-expired";
export const AUTH_EXPIRED_STORAGE_KEY = "rivo-session-expired";

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
  storage()?.removeItem("rivo-profile");
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith("/auth") || path.startsWith("auth");
}

function handleExpiredAuth(path: string, status: number): void {
  const token = getToken();
  if (!token || status !== 401 || isAuthEndpoint(path)) return;

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(AUTH_EXPIRED_STORAGE_KEY, "true");
  }
  clearStoredAuth();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorCode?: string,
    public correlationId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function unwrapData<T>(response: ApiResponse<T>): T {
  return (response.data ?? response.methodBody) as T;
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

  if (token && !isAuthEndpoint(path)) {
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

  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    handleExpiredAuth(path, response.status);
    if (parsed && typeof parsed === "object") {
      const body = parsed as Partial<ApiResponse<unknown>>;
      throw new ApiError(
        response.status,
        body.message || body.header?.responseMessage || `Error ${response.status}`,
        body.errorCode,
        body.correlationId
      );
    }
    throw new ApiError(response.status, String(parsed || `Error ${response.status}`));
  }

  if (!text) return undefined as T;

  return parsed as T;
}

export const authApi = {
  login: (data: LoginDTO) =>
    request<ApiResponse<LoginResponseDTO>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(unwrapData),

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

  summary: () => request<ApiResponse<ExpenseSummary>>("/expenses/summary"),

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

export const aiApi = {
  insight: (prompt: string) =>
    request<ApiResponse<AiInsightResponse>>("/ai/insights", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }).then(unwrapData),
};
