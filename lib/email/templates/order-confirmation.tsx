import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailLayout } from "@/lib/email/templates/email-layout";

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  items: Array<{ name: string; size: string; color: string; quantity: number; subtotal: string }>;
  totalAmount: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}

function OrderConfirmationEmail({
  orderNumber,
  items,
  totalAmount,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Order ${orderNumber} confirmed`}>
      <Text style={{ fontSize: "12px", color: "#24433A", letterSpacing: "1px", margin: "0 0 8px" }}>
        ORDER CONFIRMED
      </Text>
      <Text style={{ fontSize: "16px", color: "#1C1B17", margin: "0 0 24px" }}>
        Thanks for your order — <strong>{orderNumber}</strong> is confirmed and being prepared.
      </Text>

      {items.map((item, index) => (
        <Section key={index} style={{ marginBottom: "12px" }}>
          <Row>
            <Column>
              <Text style={{ fontSize: "14px", color: "#1C1B17", margin: 0 }}>{item.name}</Text>
              <Text style={{ fontSize: "12px", color: "#6B6555", margin: 0 }}>
                {item.size} / {item.color} · Qty {item.quantity}
              </Text>
            </Column>
            <Column align="right">
              <Text style={{ fontSize: "14px", color: "#1C1B17", margin: 0 }}>{item.subtotal}</Text>
            </Column>
          </Row>
        </Section>
      ))}

      <Hr style={{ borderColor: "#D9D2C3", margin: "16px 0" }} />

      <Row>
        <Column>
          <Text style={{ fontSize: "16px", color: "#1C1B17", fontWeight: "bold", margin: 0 }}>
            Total
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: "16px", color: "#1C1B17", fontWeight: "bold", margin: 0 }}>
            {totalAmount}
          </Text>
        </Column>
      </Row>

      {shippingAddress && (
        <>
          <Hr style={{ borderColor: "#D9D2C3", margin: "16px 0" }} />
          <Text style={{ fontSize: "12px", color: "#6B6555", letterSpacing: "1px", margin: "0 0 8px" }}>
            SHIPPING TO
          </Text>
          <Text style={{ fontSize: "14px", color: "#1C1B17", margin: 0, lineHeight: "20px" }}>
            {shippingAddress.fullName}
            <br />
            {shippingAddress.addressLine1}
            {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
            <br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            <br />
            {shippingAddress.country}
          </Text>
        </>
      )}
    </EmailLayout>
  );
}

export { OrderConfirmationEmail };
