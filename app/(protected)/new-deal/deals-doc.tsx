"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  FileText,
  Building2,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Loader2,
} from "lucide-react";
import { useState, useTransition } from "react";
import {
  InferRawDealsSchema,
  inferRawDealsSchema,
} from "@/lib/zod-schemas/raw-deal-schema";
import BulkUploadDealsToDB from "@/app/actions/bulk-upload-deal";
import { toast } from "sonner";
import { experimental_useObject as useObject } from "@ai-sdk/react";

const DealsFromDoc = () => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const {
    object,
    isLoading,
    submit: submitAnalysis,
  } = useObject({
    api: "/api/analyze",
    schema: inferRawDealsSchema,
  });

  const [isSavingDeals, startSavingDeals] = useTransition();

  // Type assertion for the object to access listings safely
  const typedObject = object as InferRawDealsSchema | null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setError(null);

      // Get the file from form data
      const file = formData.get("pdf") as File;
      if (!file) {
        throw new Error("No file selected");
      }

      // Convert file to base64 for the useObject hook
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const charArray = Array.from(uint8Array, (byte) =>
        String.fromCharCode(byte),
      );
      const binaryString = charArray.join("");
      const base64Data = btoa(binaryString);

      // Create the data object that useObject expects
      const fileData = {
        pdf: {
          name: file.name,
          data: `data:application/pdf;base64,${base64Data}`,
          type: file.type,
        },
      };

      // Use the submit function from useObject hook with the file data
      await submitAnalysis(fileData);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to analyze the document. Please try again.");
      toast.error("Failed to analyze the document. Please try again.");
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveAllDeals = async () => {
    startSavingDeals(async () => {
      try {
        console.log("Saving deals");
        if (!typedObject?.listings) {
          throw new Error("No deals to save");
        }

        const response = await BulkUploadDealsToDB(typedObject.listings);
        console.log(response);
        toast.success(response.success);
        setFileName("");
        setError(null);
      } catch (error) {
        console.error("Saving deals failed:", error);
        toast.error("Saving deals failed");
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Deal Analysis</h1>
        <p className="text-muted-foreground">
          Upload a PDF document to extract and analyze business deals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Upload a PDF containing business deals, listings, or opportunities
            for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf" className="text-sm font-medium">
                Select PDF Document
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pdf"
                  name="pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !fileName}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Generating...</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Extracting business deals from your PDF
            </p>
          </CardContent>
        </Card>
      )}

      {typedObject?.listings && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Extracted Deals</h2>
              <Badge variant="secondary">
                {typedObject.listings.length} deals found
              </Badge>
            </div>
          </div>

          <div>
            <Button onClick={handleSaveAllDeals}>
              {isSavingDeals ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Deals...
                </>
              ) : (
                "Save All Deals"
              )}
            </Button>
          </div>

          {typedObject.listings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No business deals found in the document.</p>
                  <p className="text-sm">
                    Make sure the PDF contains business listings or
                    opportunities.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {typedObject.listings.map((deal: any, index: number) => (
                <Card key={index} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{deal.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {deal.industry}
                          {deal.companyLocation && (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              {deal.companyLocation}
                            </>
                          )}
                        </CardDescription>
                      </div>
                      {deal.brokerage && (
                        <Badge variant="outline">{deal.brokerage}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {deal.dealTeaser && (
                      <p className="text-sm text-muted-foreground">
                        {deal.dealTeaser}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Asking Price
                        </p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(deal.askingPrice)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Revenue
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(deal.revenue)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          EBITDA
                        </p>
                        <p className="font-semibold">
                          {formatCurrency(deal.ebitda)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          EBITDA Margin
                        </p>
                        <p className="font-semibold">
                          {deal.ebitdaMargin ? `${deal.ebitdaMargin}%` : "N/A"}
                        </p>
                      </div>
                    </div>

                    {(deal.firstName ||
                      deal.lastName ||
                      deal.email ||
                      deal.workPhone ||
                      deal.linkedinUrl) && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Contact Information
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {(deal.firstName || deal.lastName) && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {deal.firstName} {deal.lastName}
                                </span>
                              </div>
                            )}
                            {deal.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <a
                                  href={`mailto:${deal.email}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {deal.email}
                                </a>
                              </div>
                            )}
                            {deal.workPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <a
                                  href={`tel:${deal.workPhone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {deal.workPhone}
                                </a>
                              </div>
                            )}
                            {deal.linkedinUrl && (
                              <div className="flex items-center gap-1">
                                <Linkedin className="h-3 w-3" />
                                <a
                                  href={deal.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  LinkedIn
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {deal.tags && deal.tags.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {deal.tags.map((tag: string, tagIndex: number) => (
                              <Badge
                                key={tagIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DealsFromDoc;
