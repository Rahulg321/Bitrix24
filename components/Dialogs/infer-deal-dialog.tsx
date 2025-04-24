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
      <DialogContent className="max-w-5xl h-[90vh] max-h-[800px] overflow-hidden flex flex-col">
        <DialogTitle>Infer Deal</DialogTitle>
        <div className="flex-1 overflow-y-auto pr-2">
          <InferNewDealComponent />
        </div>
      </DialogContent>
    </Dialog>
  );
};