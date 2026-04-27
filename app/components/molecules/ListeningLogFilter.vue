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
  { value: "5", label: "★5" },
  { value: "4", label: "★4" },
  { value: "3", label: "★3" },
  { value: "2", label: "★2" },
  { value: "1", label: "★1" },
];

function update<K extends keyof ListeningLogFilterState>(
  current: ListeningLogFilterState,
  key: K,
  value: ListeningLogFilterState[K]
) {
  emit("update:modelValue", { ...current, [key]: value });
}
</script>

<template>
  <div class="filter">
    <div class="filter-row">
      <div class="filter-field filter-field-keyword">
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label for="filter-keyword" class="filter-label">キーワード</label>
        <TextInput
          id="filter-keyword"
          :model-value="modelValue.keyword"
          placeholder="作曲家・曲名・メモを検索"
          @update:model-value="(v) => update(modelValue, 'keyword', v)"
        />
      </div>
      <div class="filter-field">
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label for="filter-rating" class="filter-label">評価</label>
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
        <label for="filter-from" class="filter-label">期間（開始）</label>
        <input
          id="filter-from"
          class="filter-date"
          type="date"
          :value="modelValue.fromDate"
          @input="update(modelValue, 'fromDate', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="filter-field filter-field-date">
        <label for="filter-to" class="filter-label">期間（終了）</label>
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
        <span>お気に入りのみ</span>
      </label>
      <ButtonSecondary
        v-if="isActive"
        class="filter-reset"
        label="条件をクリア"
        @click="emit('reset')"
      />
    </div>
  </div>
</template>

<style scoped>
.filter {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-secondary);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
}

.filter-row-bottom {
  justify-content: space-between;
  align-items: center;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.filter-date {
  border: 1px solid var(--color-secondary);
  border-radius: 6px;
  padding: 0.55rem 0.7rem;
  font-size: 0.95rem;
  background: var(--color-bg-input);
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.filter-date:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--color-text);
  cursor: pointer;
}

.filter-reset {
  margin-left: auto;
}
</style>
