export interface Document {
  id: number;
  title: string;
  slug: string;
  category: string;
  sidebar_position: number;
  author: string;
  last_updated: string;
  content: string;
}

export type DocumentFormData = Omit<Document, 'id' | 'last_updated'>;
