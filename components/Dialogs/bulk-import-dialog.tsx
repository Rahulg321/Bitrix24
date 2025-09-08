"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  File as FileIcon,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { TransformedDeal } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import BulkUploadDealsToDB from "@/app/actions/bulk-upload-deal";
import BulkScreenDeals from "@/app/actions/bulk-screen";

import useSWR from "swr";
import { DealScreenersGET } from "@/app/types";
import { fetcher } from "@/lib/utils";

type SheetDeal = {
  Brokerage: string;
  "First Name"?: string;
  "Last Name"?: string;
  "Work Phone"?: string;
  Email?: string;
  "LinkedIn URL"?: string;
  "Deal Caption": string;
  Revenue: number;
  EBITDA: number;
  "EBITDA Margin": number;
  Industry: string;
  "Source Website": string;
  Upload: "Y" | "N";
  UploadOnCRM: "Yes" | "No";
  "Company Location"?: string;
};

export function BulkImportDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [deals, setDeals] = useState<SheetDeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const {
    data: screeners,
    error: screenerFetchError,
    isLoading,
  } = useSWR<DealScreenersGET>(`/api/deal-screeners`, fetcher);
  const [selectedScreenerId, setSelectedScreenerId] = React.useState<
    string | null
  >(null);

  const expectedHeaders = [
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
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv")
      ) {
        setFile(file);
        setError(null);
        parseFile(file);
      } else {
        setFile(null);
        setDeals([]);
        setError("Please upload a valid Excel (.xlsx) or CSV file.");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
      const headerRow = (rows[0] || []) as string[];
      console.log("headerRow", headerRow);
      console.log("expectedHeaders", expectedHeaders);

      const missing = expectedHeaders.filter((h) => !headerRow.includes(h));
      const extra = headerRow.filter((h) => !expectedHeaders.includes(h));
      if (missing.length > 0 || extra.length > 0) {
        const msgs: string[] = [];
        if (missing.length) msgs.push(`Missing columns: ${missing.join(", ")}`);
        if (extra.length) msgs.push(`Unexpected columns: ${extra.join(", ")}`);
        setError(`Invalid file format. ${msgs.join(". ")}`);
        setDeals([]);
        return;
      }

      const jsonData = XLSX.utils.sheet_to_json(worksheet) as SheetDeal[];
      setDeals(jsonData);
      setError(null);
    };
    reader.readAsArrayBuffer(file);
  };

  const transformDeals = (deals: SheetDeal[]): TransformedDeal[] => {
    return deals.map((deal) => ({
      brokerage: deal["Brokerage"],
      firstName: deal["First Name"],
      lastName: deal["Last Name"],
      linkedinUrl: deal["LinkedIn URL"],
      email: deal.Email,
      workPhone: deal["Work Phone"],
      dealCaption: deal["Deal Caption"],
      revenue: deal.Revenue,
      ebitda: deal.EBITDA,
      ebitdaMargin: deal["EBITDA Margin"],
      industry: deal.Industry,
      sourceWebsite: deal["Source Website"],
      companyLocation: deal["Company Location"],
    }));
  };

  const handleUpload = async () => {
    if (!file || deals.length === 0) return;

    setUploading(true);
    setSuccess(null);
    setError(null);

    const formattedDeals = transformDeals(deals);
    console.log("formattedDeals", formattedDeals);
    const uploadResponse = await BulkUploadDealsToDB(formattedDeals);

    if (uploadResponse.status != 200) {
      setError(uploadResponse.message);
      toast({
        title: "Error uploading deals",
        variant: "destructive",
        description: uploadResponse.message,
      });

      setUploading(false);
      setUploadComplete(true);
      return;
    }
    console.log(selectedScreenerId)
    if (selectedScreenerId === null) {
      setSuccess("Deals uploaded successfully");
      setDeals([]);
      setFile(null);

      setUploading(false);
      setUploadComplete(true);
      return;
    }

    const screenerContent = screeners?.find(
      (screener) => screener.id === selectedScreenerId,
    )?.content;

    const screenResponse = await BulkScreenDeals(
      uploadResponse.dbDeals!,
      screenerContent!,
    );
    if (screenResponse.status != 200) {
      setError(screenResponse.message);
      toast({
        title: "Error screening deals",
        variant: "destructive",
        description: screenResponse.message,
      });

      setUploading(false);
      setUploadComplete(true);
      return;
    }

    setSuccess("Deals uploaded successfully");
    setDeals([]);
    setFile(null);

    // toasting doesn't appear to work
    toast({ title: "Deals uploaded successfully" });

    setUploading(false);
    setUploadComplete(true);
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setSuccess(null);
          setIsOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import Deals
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90vw] sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Bulk Import Deals</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[250px] w-full sm:h-[350px] md:h-[400px] lg:h-[450px]">
            <div className="grid gap-4 py-4">
              <div
                {...getRootProps()}
                className={cn(
                  "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center",
                  isDragActive ? "border-primary" : "border-muted-foreground",
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center">
                    <FileIcon className="mr-2 h-6 w-6" />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <p>
                    Drag & drop an Excel or CSV file here, or click to select
                    one
                  </p>
                )}
              </div>
              {success && (
                <div className="flex items-start text-green-600 dark:text-green-400">
                  <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="min-w-0 break-words">{success}</span>
                </div>
              )}
              {error && (
                <div className="flex items-start text-destructive">
                  <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="min-w-0 break-words">{error}</span>
                </div>
              )}
              {deals.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {deals.length} deals found in the file
                </p>
              )}
              {uploading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                htmlFor="screener-select"
              >
                Select Screener
              </label>
              <select
                id="screener-select"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedScreenerId ?? ""}
                onChange={(e) =>
                  setSelectedScreenerId(
                    e.target.value === "" ? null : e.target.value,
                  )
                }
              >
                <option value="">No Screener</option>
                {screeners &&
                  screeners.map((screener) => (
                    <option key={screener.id} value={screener.id}>
                      {screener.name}
                    </option>
                  ))}
              </select>
            </div>
          </ScrollArea>
          <Button
            onClick={handleUpload}
            disabled={!file || deals.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Upload Deals"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
