import { Button, Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout } from "@/lib/email/templates/email-layout";

export interface NewOrderAlertEmailProps {
  orderNumber: string;
  orderUrl: string;
  customerEmail: string | null;
  totalAmount: string;
  items: Array<{ name: string; size: string; color: string; quantity: number }>;
  /** Overrides the default "was just paid" line — for COD / manual-wallet
   * orders, which reach the admin at different points in their lifecycle. */
  headline?: string;
  /** When set (payment proof just submitted for a manual_wallet order),
   * renders a second button linking straight to the screenshot. */
  proofUrl?: string;
}

function NewOrderAlertEmail({
  orderNumber,
  orderUrl,
  customerEmail,
  totalAmount,
  items,
  headline,
  proofUrl,
}: NewOrderAlertEmailProps) {
  return (
    <EmailLayout previewText={`New order ${orderNumber} — ${totalAmount}`}>
      <Text style={{ fontSize: "12px", color: "#24433A", letterSpacing: "1px", margin: "0 0 8px" }}>
        NEW ORDER
      </Text>
      <Text style={{ fontSize: "16px", color: "#1C1B17", margin: "0 0 24px" }}>
        <strong>{orderNumber}</strong> {headline ?? "was just paid — time to pack it up."}
      </Text>

      {items.map((item, index) => (
        <Section key={index} style={{ marginBottom: "8px" }}>
          <Row>
            <Column>
              <Text style={{ fontSize: "14px", color: "#1C1B17", margin: 0 }}>{item.name}</Text>
              <Text style={{ fontSize: "12px", color: "#6B6555", margin: 0 }}>
                {item.size} / {item.color} · Qty {item.quantity}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}

      <Hr style={{ borderColor: "#D9D2C3", margin: "16px 0" }} />

      <Row>
        <Column>
          <Text style={{ fontSize: "14px", color: "#6B6555", margin: 0 }}>Total</Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: "14px", color: "#1C1B17", fontWeight: "bold", margin: 0 }}>
            {totalAmount}
          </Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={{ fontSize: "14px", color: "#6B6555", margin: 0 }}>Customer</Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: "14px", color: "#1C1B17", margin: 0 }}>
            {customerEmail ?? "—"}
          </Text>
        </Column>
      </Row>

      <Section style={{ marginTop: "28px" }}>
        <Button
          href={orderUrl}
          style={{
            backgroundColor: "#24433A",
            color: "#F7F4ED",
            padding: "12px 20px",
            fontSize: "14px",
          }}
        >
          View order in admin
        </Button>
        {proofUrl && (
          <Button
            href={proofUrl}
            style={{
              backgroundColor: "transparent",
              color: "#24433A",
              border: "1px solid #24433A",
              padding: "12px 20px",
              fontSize: "14px",
              marginLeft: "12px",
            }}
          >
            View screenshot
          </Button>
        )}
      </Section>
    </EmailLayout>
  );
}

export { NewOrderAlertEmail };
