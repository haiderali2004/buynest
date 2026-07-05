import { Body, Container, Head, Hr, Html, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  previewText: string;
  children: ReactNode;
}

/**
 * Email clients re-implement CSS support inconsistently and mostly don't
 * load web fonts, so this intentionally doesn't try to reproduce the
 * site's exact Fraunces/Archivo look — just its palette, via web-safe
 * font fallbacks (Georgia for the serif "display" feel, Arial for body).
 */
function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: "#F0ECE3", margin: 0, padding: "32px 0" }}>
        <Container
          style={{
            backgroundColor: "#F7F4ED",
            border: "1px solid #D9D2C3",
            maxWidth: "560px",
            margin: "0 auto",
            padding: "32px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <Text
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "22px",
              color: "#1C1B17",
              margin: "0 0 24px",
            }}
          >
            BuyNest
          </Text>

          {children}

          <Hr style={{ borderColor: "#D9D2C3", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: "12px", color: "#6B6555", margin: 0 }}>
            BuyNest — considered clothing, cut for the long run.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export { EmailLayout };
