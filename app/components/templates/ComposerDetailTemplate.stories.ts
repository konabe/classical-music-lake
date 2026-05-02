import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerDetailTemplate from "./ComposerDetailTemplate.vue";
import type { Composer, Piece } from "~/types";

const meta: Meta<typeof ComposerDetailTemplate> = {
  title: "Templates/ComposerDetailTemplate",
  component: ComposerDetailTemplate,
};

export default meta;
type Story = StoryObj<typeof ComposerDetailTemplate>;

const sample: Composer = {
  id: "1",
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

const samplePieces: Piece[] = [
  {
    id: "p1",
    title: "交響曲第9番 ニ短調 作品125「合唱」",
    composerId: "1",
    genre: "交響曲",
    era: "古典派",
    formation: "管弦楽",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "p2",
    title: "ピアノソナタ第14番 嬰ハ短調 作品27-2「月光」",
    composerId: "1",
    genre: "独奏曲",
    era: "古典派",
    formation: "ピアノ独奏",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-02T00:00:00.000Z",
    updatedAt: "2024-06-02T00:00:00.000Z",
  },
  {
    id: "p3",
    title: "ヴァイオリン協奏曲 ニ長調 作品61",
    composerId: "1",
    genre: "協奏曲",
    era: "古典派",
    formation: "管弦楽",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-03T00:00:00.000Z",
    updatedAt: "2024-06-03T00:00:00.000Z",
  },
];

const baseArgs = {
  composer: sample,
  error: null,
  isAdmin: false,
  pieces: [],
  piecesError: null,
  piecesPending: false,
};

export const AsAdmin: Story = {
  args: { ...baseArgs, isAdmin: true, pieces: samplePieces },
};

export const AsVisitor: Story = {
  args: { ...baseArgs, pieces: samplePieces },
};

export const NoPieces: Story = {
  args: baseArgs,
};

export const ErrorState: Story = {
  args: { ...baseArgs, composer: null, error: new Error("fail") },
};

export const WithImage: Story = {
  args: {
    ...baseArgs,
    composer: {
      ...sample,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/320px-Beethoven.jpg",
    },
    pieces: samplePieces,
  },
};

export const PiecesError: Story = {
  args: { ...baseArgs, piecesError: new Error("fail") },
};

export const PiecesLoading: Story = {
  args: { ...baseArgs, piecesPending: true },
};
