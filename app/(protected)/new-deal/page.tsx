import React from "react";

import { Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateNewDealForm from "@/components/forms/new-deal-form";
import { Metadata } from "next";
// BulkImportDialog is unused, consider removing if not needed elsewhere
// import { BulkImportDialog } from "@/components/Dialogs/bulk-import-dialog";
import BulkImportCard from "@/components/cards/bulk-import-card";
import DealsFromDoc from "./deals-doc";

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

      <div className="flex items-center justify-between">
        <div>
          <h2>Add Deal from Document</h2>
          <p>
            Add a new Deal to the Database by bulk importing or adding it
            manually
          </p>
        </div>

        <Link href="/new-deal/document">
          <Button>Add Deal from Document</Button>
        </Link>
      </div>

      {/* Changed lg breakpoint to md for earlier responsiveness */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-2 md:gap-8 lg:mt-12">
        <BulkImportCard />
        <div className="h-fit rounded-lg border bg-muted p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-semibold">Infer Deal</h2>
          <p className="mb-2 text-center text-gray-600 dark:text-gray-200">
            Enter the description of a deal and use AI to generate the required
            format for the deal, save it to the database and then scrape it
          </p>

          <p className="mb-6 text-center text-red-600">
            Note:- Double check the output given by AI and save it accordingly
          </p>
          <div className="flex justify-center">
            <Button className="w-full" asChild>
              <Link href="/import">
                <Bot className="mr-2 h-4 w-4" /> Import Deal
              </Link>
            </Button>
          </div>
        </div>
        {/* Changed col-span-2 to md:col-span-2 to match the grid breakpoint */}
        <div className="h-fit rounded-lg border p-6 shadow-lg md:col-span-2">
          <h2 className="mb-4">Add Deal Manually</h2>
          <CreateNewDealForm />
        </div>
      </div>
    </section>
  );
};

export default NewDealPage;
