"use client";

import { deleteScreener } from "@/app/actions/delete-screener";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const DeleteScreenerButton = ({ screenerId }: { screenerId: string }) => {
  return (
    <div>
      <Button
        variant="destructive"
        size="icon"
        onClick={async () => {
          const response = await deleteScreener(screenerId);

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

export default DeleteScreenerButton;
