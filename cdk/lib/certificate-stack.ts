import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export const ROOT_DOMAIN = "nocturne.app";

export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Route 53 で取得済みのホストゾーンを参照（ドメイン登録時に自動作成される）
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: ROOT_DOMAIN,
    });

    // CloudFront は us-east-1 の証明書のみ対応のため、このスタックを us-east-1 にデプロイする
    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: ROOT_DOMAIN,
      // ワイルドカードで staging.nocturne.app も同一証明書でカバー
      subjectAlternativeNames: [`*.${ROOT_DOMAIN}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
  }
}
