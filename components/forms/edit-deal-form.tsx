"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import EditDealFromFirebase from "@/app/actions/edit-deal";
import { Deal } from "@prisma/client";

export const EditDealFormSchema = z.object({
  first_name: z.optional(z.string()),
  last_name: z.optional(z.string()),
  email: z.optional(z.string()),
  linkedinurl: z.optional(z.string()),
  deal_caption: z
    .string()
    .min(5, { message: "Title should be at least 5 characters long" }),
  title: z
    .string()
    .min(5, { message: "Title should be at least 5 characters long" }),
  work_phone: z.optional(z.string()),
  revenue: z.optional(z.coerce.number()),
  ebitda: z.optional(z.coerce.number()),
  ebitda_margin: z.optional(z.coerce.number()),
  gross_revenue: z.optional(z.coerce.number()),
  company_location: z.optional(z.string()),
  brokerage: z.optional(z.string()),
  source_website: z.optional(z.string()),
  inventory: z.optional(z.coerce.number()),
  industry: z.optional(z.string()),
  asking_price: z.optional(z.coerce.number()),
});

// infer type of formSchema
export type EditDealFormSchemaType = z.infer<typeof EditDealFormSchema>;

type EditDealFormProps = {
  deal: Deal;
};

const EditDealForm = ({ deal }: EditDealFormProps) => {
  const {
    brokerage,
    firstName,
    lastName,
    email,
    linkedinUrl,
    workPhone,
    dealCaption,
    revenue,
    ebitda,
    title,
    sourceWebsite,
    ebitdaMargin,
    grossRevenue,
    askingPrice,
    industry,
  } = deal;
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditDealFormSchemaType>({
    resolver: zodResolver(EditDealFormSchema),
    defaultValues: {
      brokerage: brokerage || "",
      first_name: firstName || "",
      last_name: lastName || "",
      email: email || "",
      linkedinurl: linkedinUrl || "",
      work_phone: workPhone || "",
      deal_caption: dealCaption || "",
      revenue: revenue || 0,
      ebitda: ebitda || 0,
      title: title || "",
      gross_revenue: grossRevenue || 0,
      asking_price: askingPrice || 0,
      ebitda_margin: ebitdaMargin || 0,
      industry: industry || "",
      source_website: sourceWebsite || "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: EditDealFormSchemaType) {
    startTransition(async () => {
      console.log("values", values);
      const response = await EditDealFromFirebase(values, deal.id);
      if (response.type === "success") {
        toast({
          title: `Deal Edit successfully`,
          description: `Deal Edit successfully from the collection`,
        });
      }

      if (response.type === "error") {
        toast({
          title: "Error saving deal",
          description: "Error saving deal",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="first_name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="last_name..." {...field} />
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
                <Input placeholder="email..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="linkedinurl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linkedin Url</FormLabel>
              <FormControl>
                <Input placeholder="Linkedin Url..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deal_caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deal Caption</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your deal title.</FormDescription>
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
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your deal title.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="work_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Phone</FormLabel>
              <FormControl>
                <Input placeholder="work_phone..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revenue</FormLabel>
              <FormControl>
                <Input placeholder="$200000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ebitda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ebitda</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ebitda_margin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ebitda Margin</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gross_revenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gross Revenue</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Location</FormLabel>
              <FormControl>
                <Input placeholder="name...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brokerage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brokerage</FormLabel>
              <FormControl>
                <Input placeholder="name...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source_website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Website</FormLabel>
              <FormControl>
                <Input placeholder="name...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input placeholder="asking_price...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="asking_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asking Price</FormLabel>
              <FormControl>
                <Input placeholder="asking_price...." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting" : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default EditDealForm;
