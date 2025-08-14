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
import { dealDocumentFormSchema, DealDocumentFormValues } from "@/lib/schemas";
import { DealDocumentCategory, DealType } from "@prisma/client";
import { toast } from "sonner";

interface DealDocumentUploadDialogProps {
  dealId: string;
  dealType: DealType;
  onUploaded?: () => void;
}

const DealDocumentUploadDialog: React.FC<DealDocumentUploadDialogProps> = ({
  dealId,
  dealType,
  onUploaded,
}) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<DealDocumentFormValues>({
    resolver: zodResolver(dealDocumentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "OTHER",
    },
  });

  const onSubmit = (data: DealDocumentFormValues) => {
    startTransition(async () => {
      console.log("data", data);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("file", data.file);
      formData.append("dealId", dealId);

      try {
        const result = await fetch("/api/upload-deal-document", {
          method: "POST",
          body: formData,
        });

        if (result.ok) {
          toast.success("Document uploaded successfully");
          form.reset();
          setIsOpen(false);
          onUploaded?.();
        } else {
          throw new Error(result.statusText);
        }
      } catch (error) {
        console.error("Error uploading deal document:", error);
        toast.error("Error uploading document");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document for this deal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a PDF, DOCX, or TXT file (max 10MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(DealDocumentCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              <FileIcon className="mr-2 h-4 w-4" />
              {isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DealDocumentUploadDialog;
