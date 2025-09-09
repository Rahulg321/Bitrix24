"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { toast } from "sonner";
import axios from "axios";
import {
  NewScreenerFormSchema,
  newScreenerFormSchema,
} from "@/lib/zod-schemas/new-screener-form-schema";

const AddScreenerDialog = () => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof newScreenerFormSchema>>({
    resolver: zodResolver(newScreenerFormSchema),
    defaultValues: {
      name: "",
      description: "",
      file: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Update the form field value
      form.setValue("file", selectedFile);
      setError(null);
    }
  };

  const onSubmit = async (values: NewScreenerFormSchema) => {
    startTransition(async () => {
      console.log(values);

      if (!values.file) {
        setError("Please select a file");
        return;
      }

      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", values.file);
        formData.append("name", values.name);
        formData.append("description", values.description);

        const response = await axios.post(`/api/upload-screener`, formData);

        console.log("response", response);

        if (response.status !== 200) {
          throw new Error("Could not upload screener");
        }

        toast.success("Successful!!", {
          description: `${values.name} created successfully`,
        });

        router.refresh();
        form.reset();
        setError(null);
        setOpen(false);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to create resource. Please try again.",
        );
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create resource. Please try again.",
        );
        console.error(err);
      }
    });
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Screener
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Screener</DialogTitle>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid w-full items-center gap-4">
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Document</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChange}
                            className="flex-1"
                          />
                        </FormControl>
                        <FormMessage />
                        {error && (
                          <span className="mt-1 text-sm font-semibold text-red-500">
                            {error}
                          </span>
                        )}
                        {field.value && !error && (
                          <p className="mt-1 text-sm text-green-600">
                            <FileText className="mr-1 inline size-4" />
                            {field.value.name} (
                            {(field.value.size / 1024).toFixed(2)} KB)
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="shrink-0" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddScreenerDialog;
