"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import React, { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { useJobWebSocket } from "@/hooks/use-job-websocket";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Job = {
  jobId: string;
  dealId: string;
  status: "queued" | "processing" | "done" | "failed";
  createdAt: number;
  userEmail?: string;
};

const NotificationPopover = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState(false);
  const { jobs, activeJobs, completedJobs, isConnected } =
    useJobWebSocket(userId);

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "queued":
        return "bg-gray-100 text-gray-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "done":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="relative rounded-full p-2 transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <BellIcon className="size-5 text-foreground" />
            {activeJobs.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
              >
                {activeJobs.length}
              </Badge>
            )}
            <div
              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={
                isConnected ? "WebSocket connected" : "WebSocket disconnected"
              }
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 sm:w-96 lg:w-[480px]" align="end">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h5 className="flex items-center gap-2 font-semibold text-foreground">
                <FileText className="size-4" />
                Your Deals Queue
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={
                    isConnected
                      ? "WebSocket connected"
                      : "WebSocket disconnected"
                  }
                />
              </h5>
            </div>
          </div>

          <ScrollArea className="h-[400px] px-4">
            {jobs.size === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No jobs in queue</p>
                <p className="text-xs">
                  Start screening deals to see progress here
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {activeJobs.length > 0 && (
                  <div>
                    <h6 className="mb-2 text-sm font-medium text-foreground">
                      Active ({activeJobs.length})
                    </h6>
                    <div className="space-y-2">
                      {activeJobs
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((job) => (
                          <div
                            key={job.jobId}
                            className="rounded-lg border border-border bg-background p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(job.status)}
                                  <span className="truncate font-mono text-xs text-muted-foreground">
                                    {job.jobId.slice(0, 8)}...
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                      job.status,
                                    )}`}
                                  >
                                    {job.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Deal ID: {job.dealId}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* <Link href={`/raw-deals/${job.dealId}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link> */}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(job.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {completedJobs.length > 0 && (
                  <div>
                    <h6 className="mb-2 text-sm font-medium text-foreground">
                      Completed ({completedJobs.length})
                    </h6>
                    <div className="space-y-2">
                      {completedJobs
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .slice(0, 5) // Show only last 5 completed jobs
                        .map((job) => (
                          <div
                            key={job.jobId}
                            className="rounded-lg border border-border bg-muted/30 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(job.status)}
                                  <span className="truncate font-mono text-xs text-muted-foreground">
                                    {job.jobId.slice(0, 8)}...
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                      job.status,
                                    )}`}
                                  >
                                    {job.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Deal ID: {job.dealId}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link href={`/raw-deals/${job.dealId}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(job.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationPopover;
