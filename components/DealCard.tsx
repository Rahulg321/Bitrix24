// components/DealCard.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DollarSign,
  Edit,
  Trash2,
  MapPin,
  Briefcase,
  Type,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Deal, UserRole } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import DeleteDealFromDB from "@/app/actions/delete-deal";
import { cn } from "@/lib/utils";

import moveToInProcess from "@/app/actions/move-to-in-process";
import { exportDealToBitrix } from "@/app/actions/upload-bitrix";

const DealCard = ({
  deal,
  userRole,
  className,
  showActions = true,
  showScreenButton = true,
}: {
  deal: Deal;
  userRole: UserRole;
  className?: string;
  showActions?: boolean;
  showScreenButton?: boolean;
}) => {
  const editLink   = `/raw-deals/${deal.id}/edit`;
  const detailLink = `/raw-deals/${deal.id}`;
  const screenLink = `/raw-deals/${deal.id}/screen`;
  const { toast } = useToast();

  // Wrapper that Next.js expects for <form action={…}>
  const handleMove = async (_formData: FormData): Promise<void> => {
    await moveToInProcess(deal.id);
  };

  const handleExport = async (_formData: FormData): Promise<void> => {
    await exportDealToBitrix(deal);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);

  const handleDelete = async () => {
    try {
      const response = await DeleteDealFromDB(deal.dealType, deal.id);
      toast({
        title: response.type === "success" ? "Deal Deleted" : "Error",
        description: response.message,
        variant: response.type === "success" ? "default" : "destructive",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className={cn(
        "group w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-2 text-lg font-bold text-gray-800 group-hover:text-primary dark:text-gray-200">
            {deal.dealCaption}
          </CardTitle>
          {showActions && (
            <div className="flex space-x-2">
              {/* Edit */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10"
                      asChild
                    >
                      <Link href={editLink}>
                        <Edit className="h-4 w-4 text-primary" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Deal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* Delete */}
              {userRole === "ADMIN" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/20"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Deal</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-3">
        <InfoItem
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          label="Revenue"
          value={formatCurrency(deal.revenue)}
        />
        <InfoItem
          icon={<Type className="h-4 w-4 text-emerald-500" />}
          label="DealType"
          value={deal.dealType}
        />
        <InfoItem
          icon={<DollarSign className="h-4 w-4 text-blue-500" />}
          label="EBITDA"
          value={formatCurrency(deal.ebitda)}
        />
        <InfoItem
          icon={<Briefcase className="h-4 w-4 text-violet-500" />}
          label="Industry"
          value={deal.industry}
        />
        {deal.askingPrice != null && (
          <InfoItem
            icon={<DollarSign className="h-4 w-4 text-amber-500" />}
            label="Asking Price"
            value={formatCurrency(deal.askingPrice)}
          />
        )}
        {deal.companyLocation && (
          <InfoItem
            icon={<MapPin className="h-4 w-4 text-rose-500" />}
            label="Location"
            value={deal.companyLocation}
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-3">
        {/* View Details */}
        <Button className="w-full bg-primary/90 hover:bg-primary" asChild>
          <Link href={detailLink}>View Details</Link>
        </Button>

        {showScreenButton && (
          <>
            {/* Screen Deal */}
            <Button
              className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary"
              asChild
              variant="outline"
            >
              <Link href={screenLink}>Screen Deal</Link>
            </Button>

            {/* RAW → Move to In Process */}
            {deal.status === "RAW" && (
              <form action={handleMove} className="w-full">
                <Button
                  type="submit"
                  className="w-full border-yellow-500 hover:bg-yellow-100 hover:text-yellow-800"
                  variant="outline"
                >
                  Move to In Process
                </Button>
              </form>
            )}

            {/* IN_PROCESS → Publish to Bitrix */}
            {deal.status === "IN_PROCESS" && (
              <form action={handleExport} className="w-full">
                <Button
                  type="submit"
                  className="w-full border-green-500 hover:bg-green-100 hover:text-green-800"
                  variant="outline"
                >
                  Publish to Bitrix
                </Button>
              </form>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center text-sm">
    {icon}
    <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
      {label}:
    </span>
    <span className="ml-1 truncate text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-200">
      {value}
    </span>
  </div>
);

export default DealCard;
