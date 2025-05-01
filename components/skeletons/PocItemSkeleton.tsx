import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PocItemSkeleton: React.FC = () => {
  return (
    <Card className="mb-4">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-5 w-20" />
    </CardHeader>
    <CardContent>
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="mt-2 h-3 w-1/4" />
    </CardContent>
    </Card>
  );
};

export default PocItemSkeleton;
