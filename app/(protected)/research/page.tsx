"use client";

import { useState, useTransition } from "react";
import { readStreamableValue } from "ai/rsc";
import { generateCompanyDeepResearch } from "@/app/actions/do-company-deep-research";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ResearchPage() {
  const [generation, setGeneration] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleResearch = async () => {
    setGeneration(""); // Clear previous generation
    startTransition(async () => {
      try {
        const { output } = await generateCompanyDeepResearch(
          "Please write an investment pitch for investing in the company Dark Alpha Capital use this link to get more information about the company -> (www.darkalphacapital.com), the founder is a guy named Destiny Aigbe. Dark Alpha Capital is a venture capital firm that invests in early-stage startups.",
        );

        if (output) {
          for await (const delta of readStreamableValue(output)) {
            if (delta) {
              setGeneration((currentGeneration) => currentGeneration + delta);
            }
          }
        }
      } catch (error) {
        console.error("Error generating research:", error);
        setGeneration(
          "An error occurred while generating the research. Please try again.",
        );
      }
    });
  };

  return (
    <section className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Company Research</h1>

        <Button disabled={isPending} onClick={handleResearch} className="w-fit">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Research...
            </>
          ) : (
            "Generate Research"
          )}
        </Button>

        {generation ? (
          <Card className="mt-4 p-6">
            <div className="prose max-w-none">
              {generation.split("\n").map((line, index) => (
                <p key={index}>{line || " "}</p>
              ))}
            </div>
          </Card>
        ) : isPending ? (
          <div className="text-sm text-muted-foreground">
            Research generation in progress... This may take a minute.
          </div>
        ) : null}
      </div>
    </section>
  );
}
