export interface ListeningLog {
  id: string;
  listenedAt: string;
  composer: string;
  piece: string;
  performer: string;
  conductor?: string;
  rating: number;
  isFavorite: boolean;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateListeningLogInput = Omit<ListeningLog, "id" | "createdAt" | "updatedAt">;
export type UpdateListeningLogInput = Partial<Omit<ListeningLog, "id" | "createdAt" | "updatedAt">>;
