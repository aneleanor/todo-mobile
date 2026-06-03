import api from "./api";

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const getTasks = async (): Promise<TaskResponse[]> => {
  const response = await api.get("/todo");

  return response.data;
};

export const createTask = async (
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

export const deleteTask = async (id: string) => {
  await api.delete(`/todo/${id}`);
};

export const updateTask = async (id: string, data: any) => {
  const response = await api.patch(`/todo/${id}`, data);

  return response.data;
};