export interface ListeningLog {
  id: string
  listenedAt: string
  composer: string
  piece: string
  performer: string
  conductor?: string
  rating: number
  isFavorite: boolean
  memo?: string
  createdAt: string
  updatedAt: string
}

export type CreateListeningLogInput = Omit<ListeningLog, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateListeningLogInput = Partial<Omit<ListeningLog, 'id' | 'createdAt' | 'updatedAt'>>

export interface Concert {
  id: string
  date: string
  venue: string
  title: string
  orchestra?: string
  conductor?: string
  soloists?: string[]
  program: string[]
  rating: number
  isFavorite: boolean
  memo?: string
  createdAt: string
  updatedAt: string
}

export type CreateConcertInput = Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateConcertInput = Partial<Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>>
