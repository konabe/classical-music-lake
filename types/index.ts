// 鑑賞ログ（曲・演奏家の記録）
export interface ListeningLog {
  id: string
  listenedAt: string       // ISO 8601 日時
  composer: string         // 作曲家
  piece: string            // 曲名
  performer: string        // 演奏家・楽団
  conductor?: string       // 指揮者（任意）
  rating: number           // 評価 1〜5
  isFavorite: boolean      // お気に入りフラグ
  memo?: string            // 感想・メモ
  createdAt: string
  updatedAt: string
}

export type CreateListeningLogInput = Omit<ListeningLog, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateListeningLogInput = Partial<Omit<ListeningLog, 'id' | 'createdAt' | 'updatedAt'>>

// コンサート記録
export interface Concert {
  id: string
  date: string             // 公演日 (YYYY-MM-DD)
  venue: string            // 会場
  title: string            // 公演タイトル
  orchestra?: string       // 楽団
  conductor?: string       // 指揮者
  soloists?: string[]      // ソリスト
  program: string[]        // プログラム（曲目）
  rating: number           // 評価 1〜5
  isFavorite: boolean      // お気に入りフラグ
  memo?: string            // 感想・メモ
  createdAt: string
  updatedAt: string
}

export type CreateConcertInput = Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateConcertInput = Partial<Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>>
