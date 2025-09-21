"use client";

import { Results } from "@/components/results";
import { Config, Result } from "@/lib/types";
import { generateChartConfig } from "@/lib/ai/chart-generator";
import { useState, useEffect } from "react";

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
      console.log("RealDataResults - Processing tool results:", toolResults);
      
      if (!toolResults || toolResults.length === 0) {
        setError("No tool results provided");
        setLoading(false);
        return;
      }

      // Try to find deals data in various possible structures
      let deals = null;
      
      // Method 1: Look for direct deals array
      for (const result of toolResults) {
        console.log("Checking result:", result);
        
        // Check for the actual structure from the API response
        if (result.output?.deals && Array.isArray(result.output.deals)) {
          deals = result.output.deals;
          break;
        }
        
        if (result.result?.deals && Array.isArray(result.result.deals)) {
          deals = result.result.deals;
          break;
        }
        
        if (result.result?.data && Array.isArray(result.result.data)) {
          deals = result.result.data;
          break;
        }
        
        if (result.result?.results && Array.isArray(result.result.results)) {
          deals = result.result.results;
          break;
        }
        
        if (Array.isArray(result.result)) {
          deals = result.result;
          break;
        }
      }

      console.log("RealDataResults - Found deals:", deals);

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
            location: deal.companyLocation || 'Unknown',
            id: deal.id
          };
        });

        console.log("RealDataResults - Transformed results:", results);

        // Use AI to generate the best chart configuration
        const { config } = await generateChartConfig(results, query);
        
        // Determine columns based on the chart config
        const columns = [config.xKey, ...config.yKeys];
        
        console.log("RealDataResults - Generated config:", config);
        
        setChartData({
          results,
          columns,
          chartConfig: config
        });
        
      } catch (err) {
        console.error("Error generating chart config:", err);
        setError(`Failed to generate chart configuration: ${err.message}`);
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
            📊 Real data from your database
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
            📊 Real data from your database
          </div>
          <div className="text-sm text-muted-foreground">
            No chart data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-background/50 p-4 shadow-sm">
        <div className="mb-2 text-sm text-muted-foreground">
          📊 Real data from your database
        </div>
        <Results 
          results={chartData.results} 
          columns={chartData.columns} 
          chartConfig={chartData.chartConfig}
        />
      </div>
    </div>
  );
}