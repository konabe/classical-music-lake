import {
  createMigrateComposerUsecase,
  type MigrateComposerSummary,
} from "../../usecases/migrate-composer-usecase";

export type MigrateEvent = {
  dryRun?: boolean;
};

const usecase = createMigrateComposerUsecase();

/**
 * 楽曲マスタの `composer: string` を `composerId: string`（Composer マスタへの参照）に移行する Lambda。
 * API Gateway には接続せず、AWS CLI / コンソールから invoke する。
 * `{ dryRun: true }` を渡すと DB を書き換えずにログ出力のみ行う。
 */
export const handler = async (event: MigrateEvent = {}): Promise<MigrateComposerSummary> => {
  return usecase.run({ dryRun: event.dryRun });
};
