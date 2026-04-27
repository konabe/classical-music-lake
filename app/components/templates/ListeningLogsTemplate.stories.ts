import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ListeningLog } from "~/types";
import type { ListeningLogFilterState } from "~/composables/useListeningLogFilter";
import ListeningLogsTemplate from "./ListeningLogsTemplate.vue";

const meta: Meta<typeof ListeningLogsTemplate> = {
  title: "Templates/ListeningLogsTemplate",
  component: ListeningLogsTemplate,
};

export default meta;
type Story = StoryObj<typeof ListeningLogsTemplate>;

const sampleLogs: ListeningLog[] = [
  {
    id: "1",
    userId: null,
    listenedAt: "2024-03-01T14:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番 ニ短調 Op.125",
    rating: 5,
    isFavorite: true,
    memo: "フルトヴェングラー指揮、バイロイト祝祭管弦楽団。歴史的名演。",
    createdAt: "2024-03-01T14:00:00.000Z",
    updatedAt: "2024-03-01T14:00:00.000Z",
  },
  {
    id: "2",
    userId: null,
    listenedAt: "2024-02-15T20:30:00.000Z",
    composer: "モーツァルト",
    piece: "ピアノ協奏曲第21番 ハ長調 K.467",
    rating: 4,
    isFavorite: false,
    createdAt: "2024-02-15T20:30:00.000Z",
    updatedAt: "2024-02-15T20:30:00.000Z",
  },
];

const emptyFilter: ListeningLogFilterState = {
  keyword: "",
  rating: "",
  favoriteOnly: false,
  fromDate: "",
  toDate: "",
};

export const WithLogs: Story = {
  args: {
    logs: sampleLogs,
    filterState: emptyFilter,
    filterActive: false,
    totalCount: sampleLogs.length,
  },
};

export const EmptyState: Story = {
  args: {
    logs: [],
    filterState: emptyFilter,
    filterActive: false,
    totalCount: 0,
  },
};

export const FilteredEmpty: Story = {
  args: {
    logs: [],
    filterState: { ...emptyFilter, keyword: "ストラヴィンスキー" },
    filterActive: true,
    totalCount: sampleLogs.length,
  },
};
