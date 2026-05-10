<script setup lang="ts">
import draggable from "vuedraggable";
import type { PieceMovement } from "~/types";

const props = defineProps<{
  workId: string;
  initialMovements: PieceMovement[];
}>();

const { replaceMovements } = useReplaceMovements();

type EditItem = {
  id?: string;
  title: string;
  videoUrlsText: string;
  _key: string;
};

let _seq = 0;

const items = ref<EditItem[]>(
  props.initialMovements.map((m) => ({
    id: m.id,
    title: m.title,
    videoUrlsText: (m.videoUrls ?? []).join("\n"),
    _key: `m-${_seq++}`,
  })),
);

const saving = ref(false);
const saveError = ref<string | null>(null);

function addMovement() {
  items.value.push({ title: "", videoUrlsText: "", _key: `m-${_seq++}` });
}

function removeMovement(index: number) {
  items.value.splice(index, 1);
}

async function handleSave() {
  saving.value = true;
  saveError.value = null;
  try {
    const payload = items.value.map((item, idx) => ({
      ...(item.id === undefined ? {} : { id: item.id }),
      index: idx,
      title: item.title,
      videoUrls: item.videoUrlsText
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u !== ""),
    }));
    await replaceMovements(props.workId, payload);
  } catch {
    saveError.value = "保存に失敗しました。入力内容を確認してください。";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="movement-editor">
    <ErrorMessage v-if="saveError" :message="saveError" variant="block" />

    <draggable v-model="items" item-key="_key" tag="ol" class="movement-list" handle=".drag-handle">
      <template #item="{ element, index }">
        <li class="movement-item">
          <span class="movement-num numeric">{{ String(index + 1).padStart(2, "0") }}</span>
          <button
            type="button"
            class="drag-handle"
            :aria-label="`${element.title || '楽章'} をドラッグして並べ替え`"
            tabindex="-1"
          >
            &#10741;
          </button>
          <div class="movement-fields">
            <TextInput
              v-model="element.title"
              placeholder="例：第一楽章 アレグロ"
              :data-testid="`movement-title-${index}`"
            />
            <textarea
              v-model="element.videoUrlsText"
              class="video-urls-input"
              placeholder="動画URL（1行に1つ）"
              rows="2"
              :data-testid="`movement-video-urls-${index}`"
            />
          </div>
          <button
            type="button"
            class="btn-remove"
            :data-testid="`remove-movement-${index}`"
            :aria-label="`楽章 ${index + 1} を削除`"
            @click="removeMovement(index)"
          >
            &times;
          </button>
        </li>
      </template>
    </draggable>

    <div class="editor-actions">
      <button type="button" class="btn-add" data-testid="add-movement" @click="addMovement">
        <span class="smallcaps">+ 楽章を追加</span>
      </button>
      <button
        type="button"
        class="btn-save"
        data-testid="save-movements"
        :disabled="saving"
        @click="handleSave"
      >
        <span class="smallcaps">{{ saving ? "保存中…" : "楽章を保存" }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.movement-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.movement-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-hairline);
}

.movement-item {
  display: grid;
  grid-template-columns: 40px 24px 1fr auto;
  align-items: start;
  gap: 0.8rem;
  padding: 0.85rem 0.5rem;
  border-bottom: 1px solid var(--color-hairline);
}

.movement-num {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-accent);
  font-weight: 300;
  padding-top: 0.4rem;
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
  padding-top: 0.55rem;
}

.drag-handle:hover {
  color: var(--color-accent);
}

.drag-handle:active {
  cursor: grabbing;
}

.movement-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.video-urls-input {
  border: none;
  border-bottom: 1px solid var(--color-hairline-strong);
  border-radius: 0;
  padding: 0.55rem 0.1rem;
  font-size: 0.85rem;
  font-family: var(--font-sans);
  background: transparent;
  color: var(--color-text);
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.25s ease;
}

.video-urls-input::placeholder {
  color: var(--color-text-faint);
  font-style: italic;
}

.video-urls-input:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
}

.btn-remove {
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
  margin-top: 0.3rem;
}

.btn-remove:hover {
  color: var(--color-bordeaux);
  border-color: var(--color-bordeaux);
}

.editor-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-add,
.btn-save {
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

.btn-add:hover,
.btn-save:hover:not(:disabled) {
  background: var(--color-bg-ink);
  color: var(--color-bg-paper);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:root.dark .btn-add,
:root.dark .btn-save {
  border-color: var(--color-text);
}
</style>
