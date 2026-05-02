<script setup lang="ts">
import type { Composer, CreatePieceInput } from "~/types";
import { PIECE_ERAS, PIECE_FORMATIONS, PIECE_GENRES, PIECE_REGIONS } from "~/types";
import { toSelectOptions } from "~/utils/select-options";

const genreOptions = toSelectOptions(PIECE_GENRES);

const eraOptions = toSelectOptions(PIECE_ERAS);

const formationOptions = toSelectOptions(PIECE_FORMATIONS);

const regionOptions = toSelectOptions(PIECE_REGIONS);

const VIDEO_URLS_MAX = 10;

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
  videoUrls: [""] as string[],
  genre: "",
  era: "",
  formation: "",
  region: "",
});

function initializeVideoUrls(initial: readonly string[] | undefined): string[] {
  if (initial === undefined || initial.length === 0) {
    return [""];
  }
  return [...initial];
}

watch(
  () => props.initialValues,
  (initialValues) => {
    form.title = initialValues?.title ?? "";
    form.composerId = initialValues?.composerId ?? "";
    form.videoUrls = initializeVideoUrls(initialValues?.videoUrls);
    form.genre = initialValues?.genre ?? "";
    form.era = initialValues?.era ?? "";
    form.formation = initialValues?.formation ?? "";
    form.region = initialValues?.region ?? "";
  },
  { immediate: true },
);

const canAddVideoUrl = computed<boolean>(() => form.videoUrls.length < VIDEO_URLS_MAX);

function addVideoUrl() {
  if (canAddVideoUrl.value === true) {
    form.videoUrls.push("");
  }
}

function removeVideoUrl(index: number) {
  form.videoUrls.splice(index, 1);
  if (form.videoUrls.length === 0) {
    form.videoUrls.push("");
  }
}

function handleSubmit() {
  const trimmedVideoUrls = form.videoUrls.map((url) => url.trim()).filter((url) => url.length > 0);
  emit("submit", {
    title: form.title,
    composerId: form.composerId,
    videoUrls: trimmedVideoUrls.length === 0 ? undefined : trimmedVideoUrls,
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

    <FormGroup label="動画 URL" input-id="videoUrls-0">
      <div class="video-urls">
        <div v-for="(_, index) in form.videoUrls" :key="index" class="video-url-row">
          <TextInput
            :id="`videoUrls-${index}`"
            v-model="form.videoUrls[index]"
            placeholder="例：https://www.youtube.com/watch?v=..."
          />
          <button
            type="button"
            class="video-url-remove"
            :aria-label="`${index + 1} 番目の動画 URL を削除`"
            @click="removeVideoUrl(index)"
          >
            &times;
          </button>
        </div>
        <button
          type="button"
          class="video-url-add"
          :disabled="!canAddVideoUrl"
          @click="addVideoUrl"
        >
          + 動画 URL を追加
        </button>
      </div>
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

.video-urls {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.video-url-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.video-url-row > :first-child {
  flex: 1;
}

.video-url-remove {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--color-hairline-strong);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.video-url-remove:hover {
  border-color: var(--color-bordeaux);
  color: var(--color-bordeaux);
}

.video-url-add {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed var(--color-hairline-strong);
  color: var(--color-text-muted);
  padding: 0.45rem 0.9rem;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  letter-spacing: var(--tracking-wide);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease;
}

.video-url-add:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.video-url-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
