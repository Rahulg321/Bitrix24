"use client";

import React, { useTransition } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { DealType } from "@prisma/client";
import DeletePocFromDB from "@/app/actions/delete-poc";
import EditPoc from "@/app/actions/edit-poc";
import { useToast } from "@/hooks/use-toast";

interface PocItemProps {
  name: string;
  workPhone: string;
  email: string;
  websites: string[];
  dealId: string;
  pocId: string;
  dealType: DealType;
}

const PocItem: React.FC<PocItemProps> = ({
  name,
  workPhone,
  email,
  websites,
  dealId,
  pocId,
  dealType,
}) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="mb-4 bg-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="">{email}</p>
        <p className="">{workPhone}</p>
        <p className="">{websites}</p>
      </CardContent>
      <CardFooter className="space-x-2">
      <Button>Edit</Button>
      <Button
      variant={"destructive"}
      onClick={async () => {
        startTransition(async () => {
          const response = await DeletePocFromDB(
            pocId,
            dealId,
          );
          if (response.type === "success") {
            toast({
              title: "PoC deleted successfully",
              description: "The PoC has been deleted successfully",
            });
          }

          if (response.type === "error") {
            toast({
              title: "Error deleting PoC",
              description: response.message,
              variant: "destructive",
            });
          }
        });
      }}
      >
      {isPending ? "Deleting......" : "Delete"}
      </Button>
      </CardFooter>
    </Card>
  );
};

export default PocItem;
