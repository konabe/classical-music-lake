import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ListeningLogStatistics from "./ListeningLogStatistics.vue";
import type { ListeningLogStatistics as Stats } from "~/composables/useListeningLogStatistics";

const meta: Meta<typeof ListeningLogStatistics> = {
  title: "Organisms/ListeningLogStatistics",
  component: ListeningLogStatistics,
};

export default meta;
type Story = StoryObj<typeof ListeningLogStatistics>;

const populated: Stats = {
  total: 25,
  favoriteCount: 9,
  averageRating: 4.16,
  ratingDistribution: { 1: 1, 2: 2, 3: 5, 4: 8, 5: 9 },
  topComposers: [
    { composer: "ベートーヴェン", count: 8 },
    { composer: "モーツァルト", count: 6 },
    { composer: "ブラームス", count: 5 },
    { composer: "シューベルト", count: 4 },
    { composer: "マーラー", count: 2 },
  ],
  monthlyTrend: [
    { month: "2024-08", count: 3 },
    { month: "2024-09", count: 4 },
    { month: "2024-10", count: 6 },
    { month: "2024-11", count: 5 },
    { month: "2024-12", count: 7 },
  ],
};

const empty: Stats = {
  total: 0,
  favoriteCount: 0,
  averageRating: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  topComposers: [],
  monthlyTrend: [],
};

export const Populated: Story = {
  args: { statistics: populated },
};

export const Empty: Story = {
  args: { statistics: empty },
};
