<script setup lang="ts">
import type { Piece } from "~/types";

const apiBase = useApiBase();
const { data: pieces, pending } = useFetch<Piece[]>(`${apiBase}/pieces`);

const { isAdmin } = useAuth();
const isAdminUser = isAdmin();
</script>

<template>
  <HomeTemplate :pieces="pieces ?? []" :loading="pending" :is-admin="isAdminUser" />
</template>
