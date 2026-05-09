<script setup lang="ts">
import draggable from "vuedraggable";
import { nowAsDatetimeLocal, toDatetimeLocal } from "~/utils/date";
import type { CreateConcertLogInput, PieceWork } from "~/types";

const props = defineProps<{
  initialValues?: Partial<CreateConcertLogInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreateConcertLogInput];
}>();

const { data: pieces, pending: piecesPending, refresh: refreshPieces } = usePiecesAll();
const { data: composers, refresh: refreshComposers } = useComposersAll();
void refreshPieces();
void refreshComposers();

const composerNameById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const c of composers.value ?? []) {
    map[c.id] = c.name;
  }
  return map;
});

const form = reactive({
  title: props.initialValues?.title ?? "",
  concertDate:
    props.initialValues?.concertDate === undefined
      ? nowAsDatetimeLocal()
      : toDatetimeLocal(props.initialValues.concertDate),
  venue: props.initialValues?.venue ?? "",
  conductor: props.initialValues?.conductor ?? "",
  orchestra: props.initialValues?.orchestra ?? "",
  soloist: props.initialValues?.soloist ?? "",
});

const selectedPieceId = ref("");
const selectedPieces = ref<PieceWork[]>(resolveInitialPieces());

function resolveInitialPieces(): PieceWork[] {
  if (props.initialValues?.pieceIds === undefined || pieces.value === null) {
    return [];
  }
  return props.initialValues.pieceIds
    .map((id) => pieces.value!.find((p) => p.id === id))
    .filter((p): p is PieceWork => p !== undefined);
}

watch(
  () => pieces.value,
  () => {
    if (selectedPieces.value.length === 0 && props.initialValues?.pieceIds !== undefined) {
      selectedPieces.value = resolveInitialPieces();
    }
  },
);

function addPiece() {
  if (selectedPieceId.value === "") {
    return;
  }
  const piece = pieces.value?.find((p) => p.id === selectedPieceId.value);
  if (piece === undefined) {
    return;
  }
  if (selectedPieces.value.some((p) => p.id === piece.id) === true) {
    return;
  }
  selectedPieces.value.push(piece);
  selectedPieceId.value = "";
}

function removePiece(index: number) {
  selectedPieces.value.splice(index, 1);
}

function handleSubmit() {
  const input: CreateConcertLogInput = {
    title: form.title,
    concertDate: new Date(form.concertDate).toISOString(),
    venue: form.venue,
    conductor: form.conductor === "" ? undefined : form.conductor,
    orchestra: form.orchestra === "" ? undefined : form.orchestra,
    soloist: form.soloist === "" ? undefined : form.soloist,
    pieceIds: selectedPieces.value.map((p) => p.id),
  };
  emit("submit", input);
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <FormGroup label="コンサート名" input-id="title" required>
      <TextInput
        id="title"
        v-model="form.title"
        placeholder="例: 〇〇交響楽団 定期演奏会 第123回"
        required
      />
    </FormGroup>

    <div class="form-row">
      <FormGroup label="開催日時" input-id="concert-date" required>
        <input
          id="concert-date"
          v-model="form.concertDate"
          type="datetime-local"
          class="native-input"
          required
        />
      </FormGroup>

      <FormGroup label="会場" input-id="venue" required>
        <TextInput id="venue" v-model="form.venue" placeholder="例: サントリーホール" required />
      </FormGroup>
    </div>

    <div class="form-row">
      <FormGroup label="指揮者" input-id="conductor">
        <TextInput id="conductor" v-model="form.conductor" placeholder="例: カラヤン" />
      </FormGroup>
      <FormGroup label="ソリスト" input-id="soloist">
        <TextInput id="soloist" v-model="form.soloist" placeholder="例: アルゲリッチ" />
      </FormGroup>
    </div>

    <FormGroup label="オーケストラ / アンサンブル" input-id="orchestra">
      <TextInput
        id="orchestra"
        v-model="form.orchestra"
        placeholder="例: ベルリン・フィルハーモニー管弦楽団"
      />
    </FormGroup>

    <FormGroup label="プログラム" input-id="piece-select">
      <div class="piece-selector">
        <div class="select-wrap">
          <select
            data-testid="piece-select"
            class="native-select"
            :disabled="piecesPending"
            @change="selectedPieceId = ($event.target as HTMLSelectElement).value"
          >
            <option value="">{{ piecesPending ? "読み込み中…" : "楽曲を選択" }}</option>
            <option v-for="piece in pieces" :key="piece.id" :value="piece.id">
              {{ piece.title }} / {{ composerNameById[piece.composerId] ?? "(不明)" }}
            </option>
          </select>
          <span class="select-caret" aria-hidden="true">&#x25BE;</span>
        </div>
        <button type="button" data-testid="add-piece" class="btn-add-piece" @click="addPiece">
          <span class="smallcaps">Add</span>
        </button>
      </div>

      <draggable
        v-model="selectedPieces"
        item-key="id"
        tag="ol"
        class="program-list"
        handle=".drag-handle"
      >
        <template #item="{ element, index }">
          <li data-testid="program-item" class="program-item">
            <!-- NOSONAR: draggableがolラッパーを生成するためliの親はolになる -->
            <span class="program-num numeric">{{ String(index + 1).padStart(2, "0") }}</span>
            <button
              type="button"
              class="drag-handle"
              :aria-label="`${element.title} をドラッグして並べ替え`"
              tabindex="-1"
            >
              &#10741;
            </button>
            <span class="piece-info">
              <span class="piece-info-composer smallcaps">
                {{ composerNameById[element.composerId] ?? "(不明)" }}
              </span>
              <span class="piece-info-title">{{ element.title }}</span>
            </span>
            <button
              type="button"
              data-testid="remove-piece"
              class="btn-remove-piece"
              @click="removePiece(index)"
            >
              &times;
            </button>
          </li>
        </template>
      </draggable>
    </FormGroup>

    <FormActions
      :submit-label="props.submitLabel ?? '記録する'"
      @cancel="$router.push('/concert-logs')"
    />
  </form>
</template>

<style scoped>
.log-form {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  max-width: 720px;
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

.native-input,
.native-select {
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

.native-input:focus,
.native-select:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.select-wrap {
  position: relative;
  width: 100%;
}

.native-select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 1.6rem;
  cursor: pointer;
}

.select-caret {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-accent);
  font-size: 0.85rem;
}

.piece-selector {
  display: flex;
  gap: 0.8rem;
  align-items: flex-end;
}

.btn-add-piece {
  flex-shrink: 0;
  padding: 0.7rem 1.2rem;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-bg-ink);
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.btn-add-piece:hover {
  background: var(--color-bg-ink);
  color: var(--color-bg-paper);
}

:root.dark .btn-add-piece {
  border-color: var(--color-text);
}

.program-list {
  list-style: none;
  padding: 0;
  margin: 0.8rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid var(--color-hairline);
}

.program-item {
  display: grid;
  grid-template-columns: 40px 24px 1fr auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 0.5rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-hairline);
}

.program-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-accent);
  font-weight: 300;
}

.drag-handle {
  cursor: grab;
  user-select: none;
  color: var(--color-text-muted);
  background: none;
  border: none;
  padding: 0.2rem;
  font-size: 1rem;
  line-height: 1;
  transition: color 0.2s ease;
}

.drag-handle:hover {
  color: var(--color-accent);
}

.drag-handle:active {
  cursor: grabbing;
}

.piece-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.piece-info-composer {
  color: var(--color-text-muted);
  font-size: 0.65rem;
}

.piece-info-title {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-text);
}

.btn-remove-piece {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  color: var(--color-text-faint);
  border: 1px solid var(--color-hairline);
  border-radius: 0;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  transition:
    color 0.25s ease,
    border-color 0.25s ease;
}

.btn-remove-piece:hover {
  color: var(--color-bordeaux);
  border-color: var(--color-bordeaux);
}
</style>
