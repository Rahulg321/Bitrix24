"use client";

import { DynamicChart } from "@/components/dynamic-chart";
import { Config, Result } from "@/lib/types";
import { generateChartConfig } from "@/lib/ai/chart-generator";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RealDataResultsProps {
  toolResults?: any[];
  query: string;
}

export default function RealDataResults({ toolResults, query }: RealDataResultsProps) {
  const [chartData, setChartData] = useState<{
    results: Result[];
    columns: string[];
    chartConfig: Config;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processData = async () => {
    
      if (!toolResults || toolResults.length === 0) {
        setError("No tool results provided");
        setLoading(false);
        return;
      }

      const deals = toolResults[0]?.result?.deals;

      if (!deals || !Array.isArray(deals) || deals.length === 0) {
        setError("No deals found matching your criteria.");
        setLoading(false);
        return;
      }

      try {
        // Transform deals into Result format
        const results: Result[] = deals.map((deal: any, index: number) => {
          // Parse formatted strings like "$3,000,000" to numbers
          const parseCurrency = (value: any) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              return parseFloat(value.replace(/[$,]/g, '')) || 0;
            }
            return 0;
          };

          const parsePercentage = (value: any) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              return parseFloat(value.replace('%', '')) || 0;
            }
            return 0;
          };

          return {
            company: deal.title?.substring(0, 25) || `Deal ${index + 1}`,
            ebitda: parseCurrency(deal.ebitda),
            revenue: parseCurrency(deal.revenue),
            ebitdaMargin: parsePercentage(deal.ebitdaMargin),
            location: deal.companyLocation,
            industry: deal.industry || deal.sector,
            id: deal.id
          };
        });

       
        // Use AI to generate the best chart configuration
        const { config } = await generateChartConfig(results, query);
        
        
        const columns = [config.xKey, ...config.yKeys];
        
       
        
        setChartData({
          results,
          columns,
          chartConfig: config
        });
        
      } catch (err) {
        console.error("Error generating chart config:", err);
        const message = typeof err === "object" && err && "message" in err ? (err as any).message : String(err);
        setError(`Failed to generate chart configuration: ${message}`);
      }
      
      setLoading(false);
    };

    processData();
  }, [toolResults, query]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-lg border bg-background/50 p-4 shadow-sm">
          <div className="mb-2 text-sm text-muted-foreground">
            📊 Generating chart...
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="rounded-lg border bg-background/50 p-4 shadow-sm">
          <div className="mb-2 text-sm text-muted-foreground">
               Real data from your database
          </div>
          <div className="text-sm text-muted-foreground">
            Error: Error generatating chart
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="w-full">
        <div className="rounded-lg border bg-background/50 p-4 shadow-sm">
          <div className="mb-2 text-sm text-muted-foreground">
             Real data from your database
          </div>
          <div className="text-sm text-muted-foreground">
            No chart data available
          </div>
        </div>
      </div>
    );
  }

  // Build a readable label map for table headers
  const labelMap: Record<string, string> = {
    company: "Company",
    revenue: "Revenue",
    ebitda: "EBITDA",
    ebitdaMargin: "EBITDA Margin",
    location: "Location",
    industry: "Industry",
    id: "ID",
  };

  
  const orderedColumns = chartData.columns;

  // Format helpers
  const formatCurrency = (val: unknown) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val ?? 0));

  const formatValue = (col: string, val: unknown) => {
    if (col === "revenue" || col === "ebitda") return formatCurrency(val);
    if (col === "ebitdaMargin") return `${Number(val ?? 0)}%`;
    return String(val ?? "");
  };

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-background/50 p-4 shadow-sm">
        {/* Compact heading instead of verbose text list */}
        <div className="mb-3 text-sm font-medium text-foreground">Results</div>

        {/* Full-width table  */}
        <Table>
          <TableCaption className="sr-only">Query results</TableCaption>
              <TableHeader>
                <TableRow>
                  {orderedColumns.map((col) => (
                    <TableHead
                      key={`head-${col}`}
                      className={col === "revenue" || col === "ebitda" ? "text-right" : undefined}
                    >
                      {labelMap[col] ?? col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
          <TableBody>
            {chartData.results.map((r, rowIdx) => (
              <TableRow key={`row-${r.id ?? rowIdx}`}>
                {orderedColumns.map((col) => (
                  <TableCell
                    key={`cell-${r.id ?? rowIdx}-${col}`}
                    className={col === "revenue" || col === "ebitda" ? "text-right" : undefined}
                  >
                    {formatValue(col, (r as any)[col])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

       
        <div className="mt-4">
          <DynamicChart chartData={chartData.results} chartConfig={chartData.chartConfig} />
        </div>
      </div>
    </div>
  );
}