import { Text } from "@react-email/components";
import { EmailLayout } from "@/lib/email/templates/email-layout";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export interface OrderStatusEmailProps {
  orderNumber: string;
  status: string;
  note?: string | null;
}

function OrderStatusEmail({ orderNumber, status, note }: OrderStatusEmailProps) {
  const label = STATUS_LABEL[status] ?? status;

  return (
    <EmailLayout previewText={`Order ${orderNumber} is now ${label.toLowerCase()}`}>
      <Text style={{ fontSize: "12px", color: "#24433A", letterSpacing: "1px", margin: "0 0 8px" }}>
        ORDER UPDATE
      </Text>
      <Text style={{ fontSize: "16px", color: "#1C1B17", margin: "0 0 16px" }}>
        Order <strong>{orderNumber}</strong> is now <strong>{label}</strong>.
      </Text>
      {note && <Text style={{ fontSize: "14px", color: "#6B6555", margin: 0 }}>{note}</Text>}
    </EmailLayout>
  );
}

export { OrderStatusEmail };
