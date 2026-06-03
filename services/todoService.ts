import api from "./api";

export interface TodoResponse {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  listId?: string;
  list?: {
    id: string;
  };
}

export const getTodos = async (): Promise<TodoResponse[]> => {
  const response = await api.get("/todo");

  return response.data;
};

export const createTodo = async (
  title: string,
  description: string,
  dueDate: string,
  listId: string
) => {
  const response = await api.post("/todo", {
    title,
    description,
    dueDate,
    listId,
  });

  return response.data;
};

export const updateTodo = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    completed: boolean;
    dueDate: string;
    listId: string;
  }>
) => {
  const response = await api.patch(`/todo/${id}`, data);

  return response.data;
};

export const deleteTodo = async (id: string) => {
  const paths = [`/todo/${id}`, `/todos/${id}`, `/task/${id}`, `/tasks/${id}`];
  let lastError: unknown;

  for (const path of paths) {
    try {
      await api.delete(path);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};
