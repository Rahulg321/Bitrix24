import QuestionnaireCard from "@/components/cards/questionnaire-card";
import BaseLineUploadForm from "@/components/forms/baseline-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchQuestionnaires } from "@/lib/firebase/db";
import prismaDB from "@/lib/prisma.server";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Questionnaires",
  description:
    "View all the different questionnaires we have available for you",
};

const QuestionnairePage = async () => {
  const docs = await prismaDB.questionnaire.findMany({
    orderBy: { created_at: "desc" },
  });
  return (
    <section className="container mx-auto py-8">
      <h2 className="mb-4 md:mb-6">Questionnaires</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                Available Questionnaires {docs.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {docs.length > 0 ? (
                  <div className="space-y-4">
                    {docs.map((questionnaire) => (
                      <QuestionnaireCard
                        key={questionnaire.id}
                        questionnaire={questionnaire}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No questionnaires found.
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Form</CardTitle>
            </CardHeader>
            <CardContent>
              <BaseLineUploadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuestionnairePage;
