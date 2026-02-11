import type { Document, DocumentFormData } from '@site/src/types/document';

const API_BASE = 'http://localhost:3001/api/documents';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export const documentApi = {
  getAll(): Promise<Document[]> {
    return fetch(API_BASE).then((res) => handleResponse<Document[]>(res));
  },

  getBySlug(slug: string): Promise<Document> {
    return fetch(`${API_BASE}/by-slug/${slug}`).then((res) =>
      handleResponse<Document>(res),
    );
  },

  create(data: DocumentFormData): Promise<Document> {
    return fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Document>(res));
  },

  update(id: number, data: DocumentFormData): Promise<Document> {
    return fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Document>(res));
  },

  remove(id: number): Promise<void> {
    return fetch(`${API_BASE}/${id}`, { method: 'DELETE' }).then((res) =>
      handleResponse<void>(res),
    );
  },
};
