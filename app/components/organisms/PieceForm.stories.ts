import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Composer } from "@/types";
import PieceForm from "@/components/organisms/PieceForm.vue";

const meta: Meta<typeof PieceForm> = {
  title: "Organisms/PieceForm",
  component: PieceForm,
};

export default meta;
type Story = StoryObj<typeof PieceForm>;

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";

const composers: Composer[] = [
  {
    id: COMPOSER_ID_BEETHOVEN,
    name: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "モーツァルト",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: { composers },
};

export const WithInitialValues: Story = {
  args: {
    composers,
    initialValues: {
      title: "交響曲第9番",
      composerId: COMPOSER_ID_BEETHOVEN,
      videoUrls: ["https://www.youtube.com/watch?v=abc123"],
    },
  },
};

export const WithMultipleVideoUrls: Story = {
  args: {
    composers,
    initialValues: {
      title: "交響曲第9番",
      composerId: COMPOSER_ID_BEETHOVEN,
      videoUrls: [
        "https://www.youtube.com/watch?v=abc123",
        "https://www.youtube.com/watch?v=def456",
        "https://www.youtube.com/watch?v=ghi789",
      ],
    },
  },
};

export const WithCategories: Story = {
  args: {
    composers,
    initialValues: {
      title: "交響曲第9番",
      composerId: COMPOSER_ID_BEETHOVEN,
      genre: "交響曲",
      era: "古典派",
      formation: "管弦楽",
      region: "ドイツ・オーストリア",
    },
  },
};

export const CustomSubmitLabel: Story = {
  args: {
    composers,
    submitLabel: "登録する",
  },
};
