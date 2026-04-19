<script setup lang="ts">
import type { CreatePieceInput } from "~/types";
import { PIECE_ERAS, PIECE_FORMATIONS, PIECE_GENRES, PIECE_REGIONS } from "~/types";
import { toSelectOptions } from "~/utils/select-options";

const genreOptions = toSelectOptions(PIECE_GENRES);

const eraOptions = toSelectOptions(PIECE_ERAS);

const formationOptions = toSelectOptions(PIECE_FORMATIONS);

const regionOptions = toSelectOptions(PIECE_REGIONS);

const props = defineProps<{
  initialValues?: Partial<CreatePieceInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();

const form = reactive({
  title: "",
  composer: "",
  videoUrl: "",
  genre: "",
  era: "",
  formation: "",
  region: "",
});

watch(
  () => {
    return props.initialValues;
  },
  (initialValues) => {
    form.title = initialValues?.title ?? "";
    form.composer = initialValues?.composer ?? "";
    form.videoUrl = initialValues?.videoUrl ?? "";
    form.genre = initialValues?.genre ?? "";
    form.era = initialValues?.era ?? "";
    form.formation = initialValues?.formation ?? "";
    form.region = initialValues?.region ?? "";
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", {
    title: form.title,
    composer: form.composer,
    videoUrl: form.videoUrl || undefined,
    genre: (form.genre || undefined) as CreatePieceInput["genre"],
    era: (form.era || undefined) as CreatePieceInput["era"],
    formation: (form.formation || undefined) as CreatePieceInput["formation"],
    region: (form.region || undefined) as CreatePieceInput["region"],
  });
}
</script>

<template>
  <form class="piece-form" @submit.prevent="handleSubmit">
    <FormGroup label="曲名" input-id="title" required>
      <TextInput id="title" v-model="form.title" required placeholder="例：交響曲第9番" />
    </FormGroup>

    <FormGroup label="作曲家" input-id="composer" required>
      <TextInput id="composer" v-model="form.composer" required placeholder="例：ベートーヴェン" />
    </FormGroup>

    <FormGroup label="動画 URL" input-id="videoUrl">
      <TextInput
        id="videoUrl"
        v-model="form.videoUrl"
        placeholder="例：https://www.youtube.com/watch?v=..."
      />
    </FormGroup>

    <FormGroup label="ジャンル" input-id="genre">
      <SelectInput
        id="genre"
        v-model="form.genre"
        :options="genreOptions"
        placeholder="選択してください"
      />
    </FormGroup>

    <FormGroup label="時代" input-id="era">
      <SelectInput
        id="era"
        v-model="form.era"
        :options="eraOptions"
        placeholder="選択してください"
      />
    </FormGroup>

    <FormGroup label="編成" input-id="formation">
      <SelectInput
        id="formation"
        v-model="form.formation"
        :options="formationOptions"
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

    <FormActions :submit-label="submitLabel" @cancel="$router.push('/pieces')" />
  </form>
</template>

<style scoped>
.piece-form {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
</style>
