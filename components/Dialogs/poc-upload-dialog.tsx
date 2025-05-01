"use client";

import React, { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileIcon } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { pocFormSchema, PocFormValues } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import AddPoc from "@/app/actions/add-poc";
import { DealType } from "@prisma/client";

interface PocUploadDialogProps {
  dealId: string;
  dealType: DealType;
}

const PocUploadDialog: React.FC<PocUploadDialogProps> = ({
  dealId,
  dealType,
}) => {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<PocFormValues>({
    resolver: zodResolver(pocFormSchema),
                                      defaultValues: {
                                        name: "",
                                        workPhone: "",
                                        email: "",
                                        websites: [],
                                      },
  });

  const onSubmit = (data: PocFormValues) => {
    startTransition(async () => {
      console.log("data", data);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("workPhone", data.workPhone);
      formData.append("email", data.email);

      console.log("formData", formData);

      try {
        const result = await AddPoc(formData, dealId, dealType);

        if (result.success) {
          toast({
            title: "PoC uploaded successfully",
            description:
            "The Point of Contact has been added to the deal.",
          });
          form.reset();
          setIsOpen(false);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error uploading PoC:", error);
        toast({
          title: "Error uploading PoC",
          description:
          "There was a problem uploading the Point of Contact. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
    <Button variant="outline">
    <Upload className="mr-2 h-4 w-4" />
    Upload PoC
    </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
    <DialogTitle>Upload PoC</DialogTitle>
    <DialogDescription>
    Upload a Point of Contact (PoC) for this deal.
    </DialogDescription>
    </DialogHeader>
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
      <Input {...field} />
      </FormControl>
      <FormMessage />
      </FormItem>
    )}
    />
    <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
      <Textarea {...field} />
      </FormControl>
      <FormMessage />
      </FormItem>
    )}
    />
    <FormField
    control={form.control}
    name="workPhone"
    render={({ field }) => (
      <FormItem>
      <FormLabel>Work Phone</FormLabel>
      <FormControl>
      <Textarea {...field} />
      </FormControl>
      <FormMessage />
      </FormItem>
    )}
    />
    <Button type="submit" className="w-full" disabled={isPending}>
    <FileIcon className="mr-2 h-4 w-4" />
    {isPending ? "Uploading..." : "Upload PoC"}
    </Button>
    </form>
    </Form>
    </DialogContent>
    </Dialog>
  );
};

export default PocUploadDialog;
