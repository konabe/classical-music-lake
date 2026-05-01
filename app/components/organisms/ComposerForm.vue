<script setup lang="ts">
import type { CreateComposerInput } from "~/types";
import { PIECE_ERAS, PIECE_REGIONS } from "~/types";
import { toSelectOptions } from "~/utils/select-options";

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
});

watch(
  () => props.initialValues,
  (initialValues) => {
    form.name = initialValues?.name ?? "";
    form.era = initialValues?.era ?? "";
    form.region = initialValues?.region ?? "";
    form.imageUrl = initialValues?.imageUrl ?? "";
  },
  { immediate: true },
);

function handleSubmit() {
  emit("submit", {
    name: form.name,
    era: (form.era === "" ? undefined : form.era) as CreateComposerInput["era"],
    region: (form.region === "" ? undefined : form.region) as CreateComposerInput["region"],
    imageUrl: form.imageUrl === "" ? undefined : form.imageUrl,
  });
}
</script>

<template>
  <form class="composer-form" @submit.prevent="handleSubmit">
    <FormGroup label="作曲家名" input-id="name" required>
      <TextInput id="name" v-model="form.name" required placeholder="例：ベートーヴェン" />
    </FormGroup>

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
</style>
