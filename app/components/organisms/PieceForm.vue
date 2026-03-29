<script setup lang="ts">
import type { CreatePieceInput, PieceGenre, PieceEra, PieceFormation, PieceRegion } from "~/types";

const genreOptions: { value: PieceGenre; label: string }[] = [
  { value: "交響曲", label: "交響曲" },
  { value: "協奏曲", label: "協奏曲" },
  { value: "室内楽", label: "室内楽" },
  { value: "独奏曲", label: "独奏曲" },
  { value: "歌曲", label: "歌曲" },
  { value: "オペラ", label: "オペラ" },
  { value: "宗教音楽", label: "宗教音楽" },
  { value: "その他", label: "その他" },
];

const eraOptions: { value: PieceEra; label: string }[] = [
  { value: "バロック", label: "バロック" },
  { value: "古典派", label: "古典派" },
  { value: "ロマン派", label: "ロマン派" },
  { value: "近現代", label: "近現代" },
  { value: "その他", label: "その他" },
];

const formationOptions: { value: PieceFormation; label: string }[] = [
  { value: "ピアノ独奏", label: "ピアノ独奏" },
  { value: "弦楽四重奏", label: "弦楽四重奏" },
  { value: "管弦楽", label: "管弦楽" },
  { value: "声楽", label: "声楽" },
  { value: "その他", label: "その他" },
];

const regionOptions: { value: PieceRegion; label: string }[] = [
  { value: "ドイツ・オーストリア", label: "ドイツ・オーストリア" },
  { value: "フランス", label: "フランス" },
  { value: "ロシア", label: "ロシア" },
  { value: "イタリア", label: "イタリア" },
  { value: "その他", label: "その他" },
];

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
  () => props.initialValues,
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
  const values: CreatePieceInput = {
    title: form.title,
    composer: form.composer,
    videoUrl: form.videoUrl || undefined,
    genre: (form.genre || undefined) as CreatePieceInput["genre"],
    era: (form.era || undefined) as CreatePieceInput["era"],
    formation: (form.formation || undefined) as CreatePieceInput["formation"],
    region: (form.region || undefined) as CreatePieceInput["region"],
  };
  emit("submit", values);
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
