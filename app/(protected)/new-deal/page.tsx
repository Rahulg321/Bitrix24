import React from "react";

import { Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateNewDealForm from "@/components/forms/new-deal-form";
import { Metadata } from "next";
import { BulkImportDialog } from "@/components/Dialogs/bulk-import-dialog";
import { InferDealDialog } from "@/components/Dialogs/infer-deal-dialog";

export const metadata: Metadata = {
  title: "Add New Deal",
  description:
    "Add a new Deal to the Database by bulk importing or adding it manually",
};

const NewDealPage = async () => {
  return (
    <section className="big-container block-space min-h-screen">
      <div className="mb-6 text-center">
        <h1>Add New Deal</h1>
        <p>
          Add a new Deal to the Database by bulk importing or adding it manually
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        <div className="">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="h-fit rounded-lg border bg-muted p-6 shadow-lg">
              <h2 className="mb-4 text-center text-xl font-semibold">
                Bulk Import Deals
              </h2>
              <p className="mb-2 text-center text-gray-600 dark:text-gray-200">
                Quickly import multiple deals at once by uploading a file. Save
                time and effort with bulk import functionality.
              </p>

              <p className="mb-6 text-center text-red-600">
                keep in mind that the excel sheet should be in a specific format
                for bulk upload
              </p>
              <BulkImportDialog />
            </div>
            <div className="h-fit rounded-lg border bg-muted p-6 shadow-lg">
              <h2 className="mb-4 text-center text-xl font-semibold">
                Infer Deal
              </h2>
              <p className="mb-2 text-center text-gray-600 dark:text-gray-200">
                Enter the description of a deal and use AI to generate the
                required format for the deal, save it to the database and then
                scrape it
              </p>

              <p className="mb-6 text-center text-red-600">
                Note:- Double check the output given by AI and save it
                accordingly
              </p>
              <div className="flex justify-center">
              <InferDealDialog />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="mb-4">Add Deal Manually</h2>
          <CreateNewDealForm />
        </div>
      </div>
    </section>
  );
};

export default NewDealPage;
