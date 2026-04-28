import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ListeningLogStatisticsTemplate from "./ListeningLogStatisticsTemplate.vue";
import type { ListeningLogStatistics } from "~/composables/useListeningLogStatistics";

const meta: Meta<typeof ListeningLogStatisticsTemplate> = {
  title: "Templates/ListeningLogStatisticsTemplate",
  component: ListeningLogStatisticsTemplate,
};

export default meta;
type Story = StoryObj<typeof ListeningLogStatisticsTemplate>;

const populated: ListeningLogStatistics = {
  total: 24,
  favoriteCount: 7,
  averageRating: 4.04,
  ratingDistribution: { 1: 1, 2: 2, 3: 5, 4: 7, 5: 9 },
  topComposers: [
    { composer: "ベートーヴェン", count: 8 },
    { composer: "モーツァルト", count: 6 },
    { composer: "ブラームス", count: 5 },
  ],
  monthlyTrend: [
    { month: "2024-09", count: 4 },
    { month: "2024-10", count: 6 },
    { month: "2024-11", count: 5 },
    { month: "2024-12", count: 9 },
  ],
};

const empty: ListeningLogStatistics = {
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
