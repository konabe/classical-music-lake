<script setup lang="ts">
import type { Piece } from "~/types";

const apiBase = useApiBase();
const { data: pieces, pending } = useFetch<Piece[]>(`${apiBase}/pieces`);
</script>

<template>
  <HomeTemplate :pieces="pieces ?? []" :loading="pending" />
</template>
