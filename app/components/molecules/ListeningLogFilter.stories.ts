import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ListeningLogFilter from "./ListeningLogFilter.vue";
import type { ListeningLogFilterState } from "~/composables/useListeningLogFilter";

const meta: Meta<typeof ListeningLogFilter> = {
  title: "Molecules/ListeningLogFilter",
  component: ListeningLogFilter,
};

export default meta;
type Story = StoryObj<typeof ListeningLogFilter>;

const empty: ListeningLogFilterState = {
  keyword: "",
  rating: "",
  favoriteOnly: false,
  fromDate: "",
  toDate: "",
};

export const Default: Story = {
  args: { modelValue: empty, isActive: false },
};

export const Active: Story = {
  args: {
    modelValue: {
      keyword: "ベートーヴェン",
      rating: "5",
      favoriteOnly: true,
      fromDate: "2024-01-01",
      toDate: "2024-12-31",
    },
    isActive: true,
  },
};
