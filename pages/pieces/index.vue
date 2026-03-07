<script setup lang="ts">
import type { Piece } from "~/types";

const apiBase = useApiBase();
const { data: pieces, error } = await useFetch<Piece[]>(`${apiBase}/pieces`);
</script>

<template>
  <div>
    <div class="page-header">
      <h1>楽曲マスタ</h1>
      <NuxtLink to="/pieces/new" class="btn-primary">+ 新しい楽曲</NuxtLink>
    </div>

    <div v-if="error" class="empty-state">
      <p>楽曲一覧の取得に失敗しました。時間をおいて再度お試しください。</p>
    </div>
    <div v-else-if="!pieces?.length" class="empty-state">
      <p>楽曲が登録されていません。最初の楽曲を追加しましょう。</p>
    </div>

    <ul v-else class="piece-list">
      <li v-for="piece in pieces" :key="piece.id" class="piece-item">
        <div class="piece-main">
          <div class="piece-title">{{ piece.title }}</div>
          <div class="piece-composer">{{ piece.composer }}</div>
        </div>
        <div class="piece-actions">
          <NuxtLink :to="`/pieces/${piece.id}/edit`" class="btn-secondary">編集</NuxtLink>
          <button class="btn-danger" disabled>削除</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #1a1a2e;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #888;
}

.piece-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.piece-item {
  background: #fff;
  border: 1px solid #e0d8cc;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.piece-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #1a1a2e;
}

.piece-composer {
  font-size: 0.9rem;
  color: #666;
}

.piece-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-primary {
  background: #1a1a2e;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2d2d50;
}

.btn-secondary {
  background: #f0ece4;
  color: #333;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  text-align: center;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e0d8cc;
}

.btn-danger {
  background: #fff0f0;
  color: #c0392b;
  border: 1px solid #f5c6c6;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
