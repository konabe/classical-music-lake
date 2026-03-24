<script setup lang="ts">
defineProps<{
  title: string;
  newPagePath: string;
}>();

const router = useRouter();
</script>

<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
    <ButtonPrimary @click="router.push(newPagePath)"><slot /></ButtonPrimary>
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
  color: #1e2d5a;
}
</style>
