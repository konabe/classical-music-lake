<script setup lang="ts">
import type { ListeningLogFilterState } from "~/composables/useListeningLogFilter";

defineProps<{
  modelValue: ListeningLogFilterState;
  isActive: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ListeningLogFilterState];
  reset: [];
}>();

const ratingOptions = [
  { value: "5", label: "★ 5" },
  { value: "4", label: "★ 4" },
  { value: "3", label: "★ 3" },
  { value: "2", label: "★ 2" },
  { value: "1", label: "★ 1" },
];

function update<K extends keyof ListeningLogFilterState>(
  current: ListeningLogFilterState,
  key: K,
  value: ListeningLogFilterState[K],
) {
  emit("update:modelValue", { ...current, [key]: value });
}
</script>

<template>
  <section class="filter">
    <header class="filter-head">
      <span class="filter-tag smallcaps">Filter</span>
      <span class="filter-rule" aria-hidden="true" />
    </header>
    <div class="filter-row">
      <div class="filter-field filter-field-keyword">
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label for="filter-keyword" class="filter-label smallcaps">Keyword</label>
        <TextInput
          id="filter-keyword"
          :model-value="modelValue.keyword"
          placeholder="作曲家・曲名・メモを検索…"
          @update:model-value="(v) => update(modelValue, 'keyword', v)"
        />
      </div>
      <div class="filter-field">
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label for="filter-rating" class="filter-label smallcaps">Rating</label>
        <SelectInput
          id="filter-rating"
          :model-value="modelValue.rating"
          :options="ratingOptions"
          placeholder="すべて"
          @update:model-value="
            (v) => update(modelValue, 'rating', v as ListeningLogFilterState['rating'])
          "
        />
      </div>
      <div class="filter-field filter-field-date">
        <label for="filter-from" class="filter-label smallcaps">From</label>
        <input
          id="filter-from"
          class="filter-date"
          type="date"
          :value="modelValue.fromDate"
          @input="update(modelValue, 'fromDate', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="filter-field filter-field-date">
        <label for="filter-to" class="filter-label smallcaps">To</label>
        <input
          id="filter-to"
          class="filter-date"
          type="date"
          :value="modelValue.toDate"
          @input="update(modelValue, 'toDate', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="filter-row filter-row-bottom">
      <label class="filter-checkbox">
        <input
          type="checkbox"
          :checked="modelValue.favoriteOnly"
          @change="update(modelValue, 'favoriteOnly', ($event.target as HTMLInputElement).checked)"
        />
        <span class="checkbox-text smallcaps">Favorites only</span>
      </label>
      <ButtonSecondary v-if="isActive" class="filter-reset" @click="emit('reset')">
        Clear filter
      </ButtonSecondary>
    </div>
  </section>
</template>

<style scoped>
.filter {
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-left: 3px solid var(--color-accent);
  padding: 1.25rem 1.5rem 1.4rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.2rem;
}

.filter-tag {
  color: var(--color-bordeaux);
}
:root.dark .filter-tag {
  color: var(--color-accent);
}

.filter-rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: flex-end;
}

.filter-row-bottom {
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1 1 160px;
  min-width: 160px;
}

.filter-field-keyword {
  flex: 2 1 240px;
}

.filter-field-date {
  flex: 1 1 160px;
}

.filter-label {
  color: var(--color-text-muted);
}

.filter-date {
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.55rem 0.1rem;
  font-size: 0.95rem;
  background: transparent;
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
  transition: border-color 0.25s ease;
}

.filter-date:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.filter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--color-text);
  cursor: pointer;
}

.filter-checkbox input[type="checkbox"] {
  accent-color: var(--color-accent);
  width: 1.05rem;
  height: 1.05rem;
}

.checkbox-text {
  color: var(--color-text-muted);
}

.filter-reset {
  margin-left: auto;
}
</style>
