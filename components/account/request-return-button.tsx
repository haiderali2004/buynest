"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ReturnRequestDialog } from "@/components/account/return-request-dialog";
import type { ReturnableOrderItem } from "@/lib/account/returns";

function RequestReturnButton({
  orderId,
  items,
}: {
  orderId: string;
  items: ReturnableOrderItem[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Request a return
      </Button>
      <ReturnRequestDialog open={open} onOpenChange={setOpen} orderId={orderId} items={items} />
    </>
  );
}

export { RequestReturnButton };
