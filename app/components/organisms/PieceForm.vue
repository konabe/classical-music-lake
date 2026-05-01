<script setup lang="ts">
import type { Composer, CreatePieceInput } from "~/types";
import { PIECE_ERAS, PIECE_FORMATIONS, PIECE_GENRES, PIECE_REGIONS } from "~/types";
import { toSelectOptions } from "~/utils/select-options";

const genreOptions = toSelectOptions(PIECE_GENRES);

const eraOptions = toSelectOptions(PIECE_ERAS);

const formationOptions = toSelectOptions(PIECE_FORMATIONS);

const regionOptions = toSelectOptions(PIECE_REGIONS);

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<CreatePieceInput>;
    submitLabel?: string;
    composers?: Composer[];
    composersPending?: boolean;
  }>(),
  {
    initialValues: () => ({}),
    submitLabel: undefined,
    composers: () => [],
    composersPending: false,
  },
);

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();

const composerOptions = computed(() =>
  props.composers.map((c) => ({ value: c.id, label: c.name })),
);

const form = reactive({
  title: "",
  composerId: "",
  videoUrl: "",
  genre: "",
  era: "",
  formation: "",
  region: "",
});

watch(
  () => props.initialValues,
  (initialValues) => {
    form.title = initialValues?.title ?? "";
    form.composerId = initialValues?.composerId ?? "";
    form.videoUrl = initialValues?.videoUrl ?? "";
    form.genre = initialValues?.genre ?? "";
    form.era = initialValues?.era ?? "";
    form.formation = initialValues?.formation ?? "";
    form.region = initialValues?.region ?? "";
  },
  { immediate: true },
);

function handleSubmit() {
  emit("submit", {
    title: form.title,
    composerId: form.composerId,
    videoUrl: form.videoUrl === "" ? undefined : form.videoUrl,
    genre: (form.genre === "" ? undefined : form.genre) as CreatePieceInput["genre"],
    era: (form.era === "" ? undefined : form.era) as CreatePieceInput["era"],
    formation: (form.formation === ""
      ? undefined
      : form.formation) as CreatePieceInput["formation"],
    region: (form.region === "" ? undefined : form.region) as CreatePieceInput["region"],
  });
}
</script>

<template>
  <form class="piece-form" @submit.prevent="handleSubmit">
    <FormGroup label="曲名" input-id="title" required>
      <TextInput id="title" v-model="form.title" required placeholder="例：交響曲第9番" />
    </FormGroup>

    <FormGroup label="作曲家" input-id="composerId" required>
      <SelectInput
        id="composerId"
        v-model="form.composerId"
        required
        :options="composerOptions"
        :disabled="composersPending === true"
        :placeholder="composersPending === true ? '読み込み中...' : '作曲家を選択'"
      />
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
