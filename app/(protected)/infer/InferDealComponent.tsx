"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { inferDealFromDescription } from "@/app/actions/infer-deal";
import { readStreamableValue } from "ai/rsc";
import SaveInferredDeal from "@/app/actions/save-infer-deal";

const InferDealSchema = z.object({
  description: z
    .string()
    .min(10, "Description should be at least 10 characters long"),
});

export type InferDealSchemaType = z.infer<typeof InferDealSchema>;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const InferNewDealComponent = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [saveDealPending, saveDealTransition] = useTransition();
  const [generation, setGeneration] = useState<string>("");

  const form = useForm<InferDealSchemaType>({
    resolver: zodResolver(InferDealSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: InferDealSchemaType) {
    startTransition(async () => {
      const object = await inferDealFromDescription(values);
      for await (const partialObject of readStreamableValue(object!)) {
        if (partialObject) {
          setGeneration(JSON.stringify(partialObject, null, 2));
        }
      }
    });
  }

  return (
    <section className="big-container block-space">
      <div className="mb-6 space-y-2 text-center md:mb-8">
        <h1>Infer a New Deal</h1>
        <span className="mb-2 block text-center text-muted-foreground">
          Enter the description of a deal and use AI to generate the required
          format for the deal, save it to the database and then scrape it
        </span>

        <span className="mb-6 block text-center text-red-600">
          Note:- Double check the output given by AI and save it accordingly
        </span>
      </div>
      <div className="space-y-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kat Sparks Commercial is proud to exclusively present the opportunity to acquire the fee simple interes......"
                        {...field}
                        rows={20}
                      />
                    </FormControl>
                    <FormDescription>
                      This is deal&apos;s detailed explanation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Inferring..." : "Infer Deal"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="space-y-4">
          <h2>Inferred Deal using ChatGPT</h2>
          <div className="text-wrap rounded-md border p-4 min-h-32">
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                overflowX: "hidden",
                fontSize: "0.875rem",
                lineHeight: "1.2",
                minHeight: "8rem",
              }}
            >
              {generation || "No deal generated yet."}
            </pre>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-6">
            <Button
              variant={"success"}
              onClick={() => {
                saveDealTransition(async () => {
                  const response = await SaveInferredDeal({ generation });
                  if (response.type === "success") {
                    toast({
                      title: "Success",
                      description: response.message,
                      action: (
                        <ToastAction
                          altText="View Deal"
                          onClick={() => {
                            router.push(
                              `/inferred-deals/${response.documentId}`,
                            );
                          }}
                        >
                          View Deal
                        </ToastAction>
                      ),
                    });
                  } else {
                    toast({
                      title: "Error",
                      description: response.message,
                      variant: "destructive",
                    });
                  }
                });
              }}
              disabled={
                generation === ""
                  ? true
                  : false || saveDealPending
                    ? true
                    : false
              }
            >
              <Save className="mr-2 size-4" />{" "}
              {saveDealPending ? "Saving..." : "Save Deal"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};