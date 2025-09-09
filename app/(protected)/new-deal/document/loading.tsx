import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import React from "react";

const loading = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-1/3 rounded" />
        <Skeleton className="mx-auto h-4 w-1/2 rounded" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          <CardDescription>
            <Skeleton className="h-4 w-2/3 rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4 rounded" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-48 rounded" />
                <Skeleton className="h-10 w-32 rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            <Skeleton className="h-4 w-1/2 rounded" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40 rounded" />
            <Badge variant="secondary">
              <Skeleton className="h-4 w-16 rounded" />
            </Badge>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32 rounded" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  </div>
                  <Badge variant="outline">
                    <Skeleton className="h-4 w-12 rounded" />
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-2/3 rounded" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-1">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-4 w-16 rounded" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((k) => (
                    <Badge key={k} variant="secondary" className="text-xs">
                      <Skeleton className="h-4 w-10 rounded" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default loading;
