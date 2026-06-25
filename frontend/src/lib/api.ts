import type {
  AuthTokenResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";
import type {
  DashboardSummary,
  DashboardSummaryFilters,
} from "@/types/dashboard";
import type {
  CreateTaskPayload,
  Task,
  TaskMovement,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "@/types/task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Invalid credentials.":
    "E-mail ou senha incorretos. Verifique os dados e tente novamente.",
  "Invalid credentials":
    "E-mail ou senha incorretos. Verifique os dados e tente novamente.",
  "Email is already in use.":
    "Este e-mail já está cadastrado. Tente fazer login ou usar outro e-mail.",
  "User already exists":
    "Este e-mail já está cadastrado. Tente fazer login ou usar outro e-mail.",
  "Email already exists":
    "Este e-mail já está cadastrado. Tente fazer login ou usar outro e-mail.",
  "Task not found.": "Task não encontrada.",
  "User not found.": "Usuário não encontrado.",
  "Not found": "Recurso não encontrado.",
  Unauthorized: "Você não está autorizado a realizar esta ação.",
  Forbidden: "Acesso negado.",
  "Bad request": "Dados inválidos. Verifique e tente novamente.",
};

function mapErrorMessage(originalMessage: string): string {
  return ERROR_MESSAGE_MAP[originalMessage] ?? originalMessage;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = "Não foi possível concluir a requisição.";

    try {
      const payload = (await response.json()) as {
        message?: string | string[];
      };

      if (Array.isArray(payload.message)) {
        message = payload.message.map((msg) => mapErrorMessage(msg)).join(", ");
      } else if (typeof payload.message === "string") {
        message = mapErrorMessage(payload.message);
      }
    } catch {
      message = `Erro HTTP ${response.status}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function registerUser(payload: RegisterPayload): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload: LoginPayload): Promise<AuthTokenResponse> {
  return request<AuthTokenResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser(token: string): Promise<User> {
  return request<User>("/auth/me", {
    token,
  });
}

export function getUsers(token: string): Promise<User[]> {
  return request<User[]>("/users", {
    token,
  });
}

export function getTasks(token: string): Promise<Task[]> {
  return request<Task[]>("/tasks", {
    token,
  });
}

export function createTask(
  payload: CreateTaskPayload,
  token: string,
): Promise<Task> {
  return request<Task>("/tasks", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateTask(
  id: string,
  payload: UpdateTaskPayload,
  token: string,
): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function updateTaskStatus(
  id: string,
  payload: UpdateTaskStatusPayload,
  token: string,
): Promise<Task> {
  return request<Task>(`/tasks/${id}/status`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export function deleteTask(id: string, token: string): Promise<void> {
  return request<void>(`/tasks/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getTaskMovements(
  id: string,
  token: string,
): Promise<TaskMovement[]> {
  return request<TaskMovement[]>(`/tasks/${id}/movements`, {
    token,
  });
}

export function getDashboardSummary(
  token: string,
  filters: DashboardSummaryFilters = {},
): Promise<DashboardSummary> {
  const searchParams = new URLSearchParams();

  if (filters.startDate) {
    searchParams.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    searchParams.set("endDate", filters.endDate);
  }

  const query = searchParams.toString();

  return request<DashboardSummary>(
    `/dashboard/summary${query.length > 0 ? `?${query}` : ""}`,
    {
      token,
    },
  );
}
