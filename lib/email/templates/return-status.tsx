import { Text } from "@react-email/components";
import { EmailLayout } from "@/lib/email/templates/email-layout";

const STATUS_COPY: Record<string, string> = {
  approved: "Your return has been approved",
  rejected: "Your return request was not approved",
  item_received: "We've received your returned item(s)",
  refunded: "Your refund has been processed",
  cancelled: "Your return request was cancelled",
};

export interface ReturnStatusEmailProps {
  orderNumber: string;
  status: string;
  refundAmount?: string | null;
  adminNote?: string | null;
}

function ReturnStatusEmail({ orderNumber, status, refundAmount, adminNote }: ReturnStatusEmailProps) {
  const headline = STATUS_COPY[status] ?? `Your return status changed to ${status}`;

  return (
    <EmailLayout previewText={`${headline} — order ${orderNumber}`}>
      <Text style={{ fontSize: "12px", color: "#24433A", letterSpacing: "1px", margin: "0 0 8px" }}>
        RETURN UPDATE
      </Text>
      <Text style={{ fontSize: "16px", color: "#1C1B17", margin: "0 0 8px" }}>
        {headline} for order <strong>{orderNumber}</strong>.
      </Text>
      {refundAmount && (
        <Text style={{ fontSize: "14px", color: "#1C1B17", margin: "0 0 8px" }}>
          Refund amount: <strong>{refundAmount}</strong>
        </Text>
      )}
      {adminNote && (
        <Text style={{ fontSize: "14px", color: "#6B6555", margin: 0 }}>{adminNote}</Text>
      )}
    </EmailLayout>
  );
}

export { ReturnStatusEmail };
