#!/usr/bin/env node
/**
 * モックデータ生成スクリプト
 *
 * 使い方:
 *   node scripts/generate-mock-data.mjs                        # 10件生成して stdout に出力
 *   node scripts/generate-mock-data.mjs --count=20             # 20件生成
 *   node scripts/generate-mock-data.mjs --output=mock-data.json  # ファイルに出力
 */

import { writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const args = process.argv.slice(2);
const countArg = args.find((a) => a.startsWith("--count="));
const outputArg = args.find((a) => a.startsWith("--output="));
const rawCount = countArg ? Number.parseInt(countArg.split("=")[1], 10) : 10;
if (!Number.isInteger(rawCount) || rawCount < 0) {
  console.error("エラー: --count には 0 以上の整数を指定してください");
  process.exit(1);
}
const count = rawCount;
const outputFile = outputArg ? outputArg.split("=")[1] : null;

const composers = [
  {
    name: "ベートーヴェン",
    pieces: [
      "交響曲第5番「運命」",
      "交響曲第9番「合唱」",
      "ピアノソナタ第14番「月光」",
      "ヴァイオリン協奏曲",
      "ピアノ協奏曲第5番「皇帝」",
    ],
  },
  {
    name: "モーツァルト",
    pieces: ["交響曲第40番", "レクイエム", "魔笛", "ピアノ協奏曲第21番", "クラリネット協奏曲"],
  },
  {
    name: "バッハ",
    pieces: [
      "ゴルトベルク変奏曲",
      "マタイ受難曲",
      "平均律クラヴィーア曲集",
      "無伴奏チェロ組曲",
      "ブランデンブルク協奏曲",
    ],
  },
  {
    name: "ショパン",
    pieces: ["ピアノ協奏曲第1番", "練習曲集「革命」", "夜想曲第2番", "バラード第1番", "幻想即興曲"],
  },
  {
    name: "ブラームス",
    pieces: ["交響曲第1番", "交響曲第4番", "ピアノ協奏曲第2番", "弦楽六重奏曲第1番"],
  },
  {
    name: "マーラー",
    pieces: ["交響曲第5番", "交響曲第9番", "大地の歌", "交響曲第6番「悲劇的」"],
  },
  {
    name: "シューベルト",
    pieces: ["交響曲第8番「未完成」", "冬の旅", "死と乙女", "ピアノソナタ第21番"],
  },
  {
    name: "ドビュッシー",
    pieces: ["牧神の午後への前奏曲", "海", "月の光", "ピアノのために"],
  },
];

const performers = [
  "ベルリン・フィルハーモニー管弦楽団",
  "ウィーン・フィルハーモニー管弦楽団",
  "ロイヤル・コンセルトヘボウ管弦楽団",
  "グレン・グールド",
  "マルタ・アルゲリッチ",
  "ヴラディーミル・ホロヴィッツ",
  "ヨーヨー・マ",
  "ヒラリー・ハーン",
  "ムスティスラフ・ロストロポーヴィチ",
  "ダニエル・バレンボイム",
];

const conductors = [
  "カルロス・クライバー",
  "カラヤン",
  "サイモン・ラトル",
  "レナード・バーンスタイン",
  "ニコラウス・アーノンクール",
  "セルジュ・チェリビダッケ",
  "クラウディオ・アバド",
  "ズービン・メータ",
];

const memos = [
  "素晴らしい演奏",
  "圧倒的な迫力",
  "繊細な表現が印象的",
  "テンポの緩急が絶妙",
  "アンサンブルの精度が高い",
  "独奏者の技巧に感動",
  "ライブの臨場感が伝わる",
  "録音の質が良い",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog(index) {
  const composerData = randomItem(composers);
  const daysAgo = index * 3 + Math.floor(Math.random() * 3);
  const listenedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const createdDate = new Date(listenedDate.getTime() + 60 * 60 * 1000);

  const log = {
    id: randomUUID(),
    listenedAt: listenedDate.toISOString(),
    composer: composerData.name,
    piece: randomItem(composerData.pieces),
    performer: randomItem(performers),
    rating: Math.floor(Math.random() * 5) + 1,
    isFavorite: Math.random() > 0.7,
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
  };

  if (Math.random() > 0.4) {
    log.conductor = randomItem(conductors);
  }

  if (Math.random() > 0.5) {
    log.memo = randomItem(memos);
  }

  return log;
}

const logs = Array.from({ length: count }, (_, i) => generateLog(i));
const json = JSON.stringify(logs, null, 2);

if (outputFile) {
  writeFileSync(outputFile, json, "utf-8");
  console.error(`${count}件のモックデータを ${outputFile} に書き出しました`);
} else {
  process.stdout.write(json + "\n");
}
