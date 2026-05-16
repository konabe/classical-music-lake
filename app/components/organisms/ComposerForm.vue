<script setup lang="ts">
import type { CreateComposerInput } from "@/types";
import { PIECE_ERAS, PIECE_REGIONS } from "@/types";
import { toSelectOptions } from "@/utils/select-options";

const eraOptions = toSelectOptions(PIECE_ERAS);
const regionOptions = toSelectOptions(PIECE_REGIONS);

const props = defineProps<{
  initialValues?: Partial<CreateComposerInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreateComposerInput];
}>();

const form = reactive({
  name: "",
  era: "",
  region: "",
  imageUrl: "",
  // 年は number | "" で保持（空 = 未入力）。HTML の number input の v-model が空文字を返すため
  birthYear: "" as number | "",
  deathYear: "" as number | "",
});

watch(
  () => props.initialValues,
  (initialValues) => {
    form.name = initialValues?.name ?? "";
    form.era = initialValues?.era ?? "";
    form.region = initialValues?.region ?? "";
    form.imageUrl = initialValues?.imageUrl ?? "";
    form.birthYear = initialValues?.birthYear ?? "";
    form.deathYear = initialValues?.deathYear ?? "";
  },
  { immediate: true },
);

function handleSubmit() {
  emit("submit", {
    name: form.name,
    era: (form.era === "" ? undefined : form.era) as CreateComposerInput["era"],
    region: (form.region === "" ? undefined : form.region) as CreateComposerInput["region"],
    imageUrl: form.imageUrl === "" ? undefined : form.imageUrl,
    birthYear: form.birthYear === "" ? undefined : form.birthYear,
    deathYear: form.deathYear === "" ? undefined : form.deathYear,
  });
}
</script>

<template>
  <form class="composer-form" @submit.prevent="handleSubmit">
    <FormGroup label="作曲家名" input-id="name" required>
      <TextInput id="name" v-model="form.name" required placeholder="例：ベートーヴェン" />
    </FormGroup>

    <div class="form-row">
      <FormGroup label="生年" input-id="birth-year">
        <input
          id="birth-year"
          v-model.number="form.birthYear"
          type="number"
          step="1"
          min="-3000"
          max="9999"
          class="native-input"
          placeholder="例：1770"
        />
      </FormGroup>

      <FormGroup label="没年" input-id="death-year">
        <input
          id="death-year"
          v-model.number="form.deathYear"
          type="number"
          step="1"
          min="-3000"
          max="9999"
          class="native-input"
          placeholder="例：1827（存命なら空欄）"
        />
      </FormGroup>
    </div>

    <FormGroup label="時代" input-id="era">
      <SelectInput
        id="era"
        v-model="form.era"
        :options="eraOptions"
        placeholder="選択してください"
      />
    </FormGroup>

    <FormGroup label="地域" input-id="region">
      <SelectInput
        id="region"
        v-model="form.region"
        :options="regionOptions"
        placeholder="選択してください"
      />
    </FormGroup>

    <FormGroup label="画像 URL" input-id="imageUrl">
      <TextInput
        id="imageUrl"
        v-model="form.imageUrl"
        placeholder="例：https://upload.wikimedia.org/..."
      />
    </FormGroup>

    <FormActions :submit-label="submitLabel" @cancel="$router.push('/composers')" />
  </form>
</template>

<style scoped>
.composer-form {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.native-input {
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.55rem 0.1rem;
  font-size: 0.95rem;
  font-family: var(--font-sans);
  background: transparent;
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.25s ease;
  font-variant-numeric: tabular-nums;
}

.native-input::placeholder {
  color: var(--color-text-faint);
  font-style: italic;
}

.native-input:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}
</style>
