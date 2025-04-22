import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { InferNewDealComponent } from "../../app/(protected)/infer/InferDealComponent";

export const InferDealDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Bot className="mr-2 h-4 w-4" /> Infer Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogTitle>Infer Deal</DialogTitle>
        <InferNewDealComponent />
      </DialogContent>
    </Dialog>
  );
};
