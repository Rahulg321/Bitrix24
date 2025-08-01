"use client";

import React from "react";
import { Button } from "../ui/button";
import * as XLSX from "xlsx";
import { BulkImportDialog } from "../Dialogs/bulk-import-dialog";

const BulkImportCard = () => {
  return (
    <div className="h-fit rounded-lg border bg-muted p-6 shadow-lg">
      <h2 className="mb-4 text-center text-xl font-semibold">
        Bulk Import Deals
      </h2>
      <p className="mb-2 text-center text-gray-600 dark:text-gray-200">
        Quickly import multiple deals at once by uploading a file. Save time and
        effort with bulk import functionality.
      </p>

      <p className="mb-6 text-center text-red-600">
        keep in mind that the excel sheet should be in a specific format for
        bulk upload
      </p>

      <div className="mb-6 space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Required Format:</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">
            <li>Brokerage (Required)</li>
            <li>First Name (Optional)</li>
            <li>Last Name (Optional)</li>
            <li>Work Phone (Optional)</li>
            <li>Email (Optional)</li>
            <li>LinkedIn URL (Optional)</li>
            <li>Deal Caption (Required)</li>
            <li>Revenue (Required, number)</li>
            <li>EBITDA (Required, number)</li>
            <li>EBITDA Margin (Required, number)</li>
            <li>Industry (Required)</li>
            <li>Source Website (Required)</li>
            <li>Upload (Required, &quot;Y&quot; or &quot;N&quot;)</li>
            <li>UploadOnCRM (Required, &quot;Yes&quot; or &quot;No&quot;)</li>
            <li>Company Location (Optional)</li>
            <li>Deal Status (Optional)</li>
            <li>Deal Link (Required)</li>
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const headers = [
                "Brokerage",
                "First Name",
                "Last Name",
                "Work Phone",
                "Email",
                "LinkedIn URL",
                "Deal Caption",
                "Revenue",
                "EBITDA",
                "EBITDA Margin",
                "Industry",
                "Source Website",
                "Upload",
                "UploadOnCRM",
                "Company Location",
                "Deal Status",
                "Deal Link",
              ];
              const ws = XLSX.utils.aoa_to_sheet([headers]);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Template");
              XLSX.writeFile(wb, "deal-import-template.xlsx");
            }}
          >
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const headers = [
                "Brokerage",
                "First Name",
                "Last Name",
                "Work Phone",
                "Email",
                "LinkedIn URL",
                "Deal Caption",
                "Revenue",
                "EBITDA",
                "EBITDA Margin",
                "Industry",
                "Source Website",
                "Upload",
                "UploadOnCRM",
                "Company Location",
                "Deal Status",
                "Deal Link",
              ];
              const exampleData = [
                headers,
                [
                  "Example Brokerage",
                  "John",
                  "Doe",
                  "1234567890",
                  "john@example.com",
                  "https://linkedin.com/in/johndoe",
                  "Example Deal",
                  "1000000",
                  "200000",
                  "20",
                  "Technology",
                  "https://example.com",
                  "Y",
                  "Yes",
                  "New York",
                  "Open",
                  "https://examplebrokerage.com/deal/example",
                ],
              ];
              const ws = XLSX.utils.aoa_to_sheet(exampleData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Example");
              XLSX.writeFile(wb, "deal-import-example.xlsx");
            }}
          >
            Download Example
          </Button>
        </div>
      </div>

      <BulkImportDialog />
    </div>
  );
};

export default BulkImportCard;
