"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { InferNewDealComponent } from "../../app/(protected)/infer/InferDealComponent"; // adjust path if needed

export const InferDealDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Bot className="mr-2 h-4 w-4" /> Infer Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <InferNewDealComponent />
      </DialogContent>
    </Dialog>
  );
};
