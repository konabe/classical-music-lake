<script setup lang="ts">
import draggable from "vuedraggable";
import { nowAsDatetimeLocal, toDatetimeLocal } from "~/utils/date";
import type { CreateConcertLogInput, Piece } from "~/types";

const props = defineProps<{
  initialValues?: Partial<CreateConcertLogInput>;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreateConcertLogInput];
}>();

const { data: pieces, pending: piecesPending, refresh: refreshPieces } = usePiecesAll();
void refreshPieces();

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
const selectedPieces = ref<Piece[]>(resolveInitialPieces());

function resolveInitialPieces(): Piece[] {
  if (props.initialValues?.pieceIds === undefined || pieces.value === null) {
    return [];
  }
  return props.initialValues.pieceIds
    .map((id) => pieces.value!.find((p) => p.id === id))
    .filter((p): p is Piece => p !== undefined);
}

watch(
  () => pieces.value,
  () => {
    if (selectedPieces.value.length === 0 && props.initialValues?.pieceIds !== undefined) {
      selectedPieces.value = resolveInitialPieces();
    }
  }
);

function addPiece() {
  if (selectedPieceId.value === "") {
    return;
  }
  const piece = pieces.value?.find((p) => p.id === selectedPieceId.value);
  if (piece === undefined) {
    return;
  }
  if (selectedPieces.value.some((p) => p.id === piece.id)) {
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

    <FormGroup label="開催日時" input-id="concert-date" required>
      <input id="concert-date" v-model="form.concertDate" type="datetime-local" required />
    </FormGroup>

    <FormGroup label="会場" input-id="venue" required>
      <TextInput id="venue" v-model="form.venue" placeholder="例: サントリーホール" required />
    </FormGroup>

    <FormGroup label="指揮者" input-id="conductor">
      <TextInput id="conductor" v-model="form.conductor" placeholder="例: カラヤン" />
    </FormGroup>

    <FormGroup label="オーケストラ / アンサンブル" input-id="orchestra">
      <TextInput
        id="orchestra"
        v-model="form.orchestra"
        placeholder="例: ベルリン・フィルハーモニー管弦楽団"
      />
    </FormGroup>

    <FormGroup label="ソリスト" input-id="soloist">
      <TextInput id="soloist" v-model="form.soloist" placeholder="例: アルゲリッチ" />
    </FormGroup>

    <FormGroup label="プログラム" input-id="piece-select">
      <div class="piece-selector">
        <select
          data-testid="piece-select"
          :disabled="piecesPending"
          @change="selectedPieceId = ($event.target as HTMLSelectElement).value"
        >
          <option value="">{{ piecesPending ? "読み込み中..." : "楽曲を選択" }}</option>
          <option v-for="piece in pieces" :key="piece.id" :value="piece.id">
            {{ piece.title }} / {{ piece.composer }}
          </option>
        </select>
        <button type="button" data-testid="add-piece" class="btn-add-piece" @click="addPiece">
          追加
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
            <span class="drag-handle" aria-label="ドラッグして並べ替え">☰</span>
            <span class="piece-info">{{ element.title }} / {{ element.composer }}</span>
            <button
              type="button"
              data-testid="remove-piece"
              class="btn-remove-piece"
              @click="removePiece(index)"
            >
              削除
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
  gap: 1.5rem;
}

.piece-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.piece-selector select {
  flex: 1;
}

.btn-add-piece {
  padding: 0.4rem 1rem;
  background: #4a6fa5;
  color: var(--color-on-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-add-piece:hover {
  background: #3a5f95;
}

.program-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.program-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.drag-handle {
  cursor: grab;
  user-select: none;
  color: var(--color-text-muted);
}

.piece-info {
  flex: 1;
  font-size: 0.95rem;
}

.btn-remove-piece {
  padding: 0.2rem 0.6rem;
  background: none;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-remove-piece:hover {
  background: var(--color-danger);
  color: var(--color-on-primary);
}

:global(.dark) .btn-add-piece {
  background: #6a8fc5;
}

:global(.dark) .btn-add-piece:hover {
  background: #7a9fd5;
}
</style>
