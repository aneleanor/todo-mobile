import api from "./api";

export interface ListResponse {
  id: string;
  name: string;
}

export const getLists = async (): Promise<ListResponse[]> => {
  const response = await api.get("/list");

  return response.data;
};

export const createList = async (name: string) => {
  const response = await api.post("/list", {
    name,
  });

  return response.data;
};

export const deleteList = async (id: string) => {
  const paths = [`/list/${id}`, `/lists/${id}`];
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

export const updateList = async (id: string, name: string) => {
  const response = await api.patch(`/list/${id}`, {
    name,
  });

  return response.data;
};
