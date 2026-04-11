import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import type { Construct } from "constructs";

const DOMAIN_NAME = "nocturne-app.com";

export class DnsStack extends cdk.Stack {
  public readonly hostedZone: route53.IHostedZone;
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Route53 Hosted Zone
    this.hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: DOMAIN_NAME,
    });

    // ACM 証明書（CloudFront 用: us-east-1 にデプロイ必須）
    // nocturne-app.com + *.nocturne-app.com でワイルドカード対応
    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: DOMAIN_NAME,
      subjectAlternativeNames: [`*.${DOMAIN_NAME}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    new cdk.CfnOutput(this, "NameServers", {
      value: cdk.Fn.join(", ", this.hostedZone.hostedZoneNameServers!),
      description: "お名前.comに設定するNSレコード",
    });

    new cdk.CfnOutput(this, "HostedZoneId", {
      value: this.hostedZone.hostedZoneId,
      description: "Route53 Hosted Zone ID",
    });

    new cdk.CfnOutput(this, "CertificateArn", {
      value: this.certificate.certificateArn,
      description: "ACM 証明書 ARN",
    });
  }
}
