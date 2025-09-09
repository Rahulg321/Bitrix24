"use client";

import { deleteReasoning } from "@/app/actions/delete-reasoning";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const DeleteReasoningButton = ({
  reasoningId,
  dealId,
}: {
  reasoningId: string;
  dealId: string;
}) => {
  return (
    <div>
      <Button
        variant="destructive"
        size="icon"
        onClick={async () => {
          const response = await deleteReasoning(reasoningId, dealId);

          if (response.success) {
            toast.success(response.message);
          } else {
            console.log(response);
            toast.error(response.message);
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DeleteReasoningButton;
