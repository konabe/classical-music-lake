<script setup lang="ts">
import type { PaginatedResponse } from "~/composables/usePieces";
import type { Piece } from "~/types";

const apiBase = useApiBase();
const { data, pending } = useFetch<PaginatedResponse<Piece>>(`${apiBase}/pieces`);
</script>

<template>
  <HomeTemplate :pieces="data?.items ?? []" :loading="pending" />
</template>
