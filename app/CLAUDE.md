# フロントエンド コンポーネント作成ガイドライン

## Atomic Design の層の選び方

| 層        | 格納先                  | 判断基準                                          |
| --------- | ----------------------- | ------------------------------------------------- |
| Atoms     | `components/atoms/`     | ボタン・入力欄など、これ以上分割できない最小単位  |
| Molecules | `components/molecules/` | 2つ以上の Atom を組み合わせた再利用可能な UI 部品 |
| Organisms | `components/organisms/` | Molecules/Atoms を組み合わせた独立したセクション  |
| Templates | `components/templates/` | ページ全体のレイアウト。Organisms を組み合わせる  |

## 新規コンポーネント作成時のチェックリスト

コンポーネントを新規作成するときは、**必ず以下の3ファイルをセットで作成**すること。

- [ ] `{ComponentName}.vue` — コンポーネント本体
- [ ] `{ComponentName}.test.ts` — ユニットテスト
- [ ] `{ComponentName}.stories.ts` — Storybook ストーリー

---

## テストの書き方

```ts
import { mountSuspended } from "@nuxt/test-utils/runtime";
import MyComponent from "./MyComponent.vue";

describe("MyComponent", () => {
  it("〇〇が表示される", async () => {
    const wrapper = await mountSuspended(MyComponent, {
      props: { ... },
    });
    expect(wrapper.find(".my-class").exists()).toBe(true);
  });
});
```

### ポイント

- `mountSuspended` を使う（`@nuxt/test-utils/runtime` から）
- `ButtonPrimary` / `ButtonSecondary` / `ButtonDanger` など Atom を内部で使うコンポーネントは、
  ボタン要素のテストに `global: { components: { ButtonPrimary } }` の明示的な登録が必要な場合がある
- クリックイベントのテストは `.btn-secondary` / `.btn-danger` などのクラスで要素を探してから `.trigger("click")`
- ルーター遷移のテストは `vi.spyOn(wrapper.vm.$router, "push")` でスパイする

### テストの構成例（`describe` 分割）

```text
describe("ComponentName", () => {
  describe("表示", () => { ... })
  describe("イベント", () => { ... })
  describe("props による挙動の変化", () => { ... })
})
```

---

## Storybook ストーリーの書き方

```ts
import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import MyComponent from "./MyComponent.vue";

const meta: Meta<typeof MyComponent> = {
  title: "Molecules/MyComponent",  // 層名/コンポーネント名
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: { ... },
};
```

### ポイント

- `title` は `"{Layer}/{ComponentName}"` 形式（例: `"Molecules/PageHeader"`）
- スロットが必要なストーリーは `render` 関数を使う:
  ```ts
  export const WithSlot: Story = {
    args: { title: "タイトル" },
    render: (args) => ({
      components: { MyComponent },
      setup: () => ({ args }),
      template: `<MyComponent v-bind="args">スロット内容</MyComponent>`,
    }),
  };
  ```
- 代表的なバリエーション（デフォルト・エラー状態・空状態など）をストーリーとして列挙する

---

## コンポーネントの実装規約

- `<script setup lang="ts">` を使う
- props は `defineProps<{ ... }>()` で型定義（`any` 禁止）
- イベントは `defineEmits<{ eventName: [payload] }>()` で定義
- スタイルは `<style scoped>` を使う
- コンポーネント内で `useRouter()` を使う場合は `router.push()` で遷移する
- 親から渡された値を直接変更しない（`v-model` の場合は `emit('update:modelValue', ...)` を使う）
