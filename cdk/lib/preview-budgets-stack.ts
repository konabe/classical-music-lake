import * as cdk from "aws-cdk-lib";
import * as budgets from "aws-cdk-lib/aws-budgets";
import type { Construct } from "constructs";

export interface PreviewBudgetsStackProps extends cdk.StackProps {
  /** 予算超過時の通知先メールアドレス */
  notifyEmail: string;
  /** 月次予算（USD） */
  monthlyLimitUsd?: number;
}

/**
 * PR プレビュー環境のコスト監視用スタック。
 *
 * 全ての PR プレビュースタック（`ClassicalMusicLakeStack-pr-*`）に共通で適用される
 * 月次予算アラートを 1 つ作成する。`Preview` タグを持つリソースを対象にフィルタする。
 *
 * 重要: AWS Budgets でユーザータグをフィルタとして使うには、AWS Billing コンソールで
 * `Preview` タグをコスト配分タグとしてアクティベートする必要がある。これは CDK では
 * 自動化できないため、初回デプロイ後に手動で実施すること（手順は OPERATIONS.md 参照）。
 *
 * 通常デプロイは行わず、Preview 機能の運用準備として 1 度だけデプロイすればよい。
 *   npx cdk deploy PreviewBudgetsStack
 */
export class PreviewBudgetsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PreviewBudgetsStackProps) {
    super(scope, id, props);

    const monthlyLimit = props.monthlyLimitUsd ?? 20;

    new budgets.CfnBudget(this, "PreviewMonthlyBudget", {
      budget: {
        budgetName: "classical-music-lake-preview-monthly",
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: { amount: monthlyLimit, unit: "USD" },
        costFilters: {
          // ユーザータグ Preview=true でフィルタ
          // CFN 構文: TagKeyValue は "user:<tagKey>$<tagValue>" の文字列リスト
          TagKeyValue: ["user:Preview$true"],
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: 80,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              subscriptionType: "EMAIL",
              address: props.notifyEmail,
            },
          ],
        },
        {
          notification: {
            notificationType: "FORECASTED",
            comparisonOperator: "GREATER_THAN",
            threshold: 100,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [
            {
              subscriptionType: "EMAIL",
              address: props.notifyEmail,
            },
          ],
        },
      ],
    });
  }
}
