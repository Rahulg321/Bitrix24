"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import SaveRollupDialog from "@/components/Dialogs/save-rollup-dialog";

// Simplified placeholder type
interface PlaceholderDeal {
  id: string;
  brokerage: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  workPhone?: string | null;
  revenue: number;
  ebitda: number;
  industry: string;
  dealCaption: string;
  title?: string | null;
}

export default function RollupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Placeholder deals
  const [deals, setDeals] = useState<PlaceholderDeal[]>([
    {
      id: "1",
      brokerage: "Example Brokerage",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      workPhone: "1234567890",
      revenue: 1000000,
      ebitda: 200000,
      industry: "Technology",
      dealCaption: "Tech Acquisition",
      title: "Tech Acquisition",
    },
    {
      id: "2",
      brokerage: "Example Brokerage",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      linkedinUrl: null,
      workPhone: null,
      revenue: 500000,
      ebitda: 100000,
      industry: "Finance",
      dealCaption: "Finance Merger",
      title: "Finance Merger",
    },
    {
      id: "3",
      brokerage: "Example Brokerage",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      linkedinUrl: null,
      workPhone: null,
      revenue: 750000,
      ebitda: 150000,
      industry: "Healthcare",
      dealCaption: "Healthcare Expansion",
      title: "Healthcare Expansion",
    },
  ]);

  // Track selected deals
  const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedDeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const deleteSelected = () => {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can delete deals from a rollup.");
      return;
    }

    setDeals((prev) => prev.filter((deal) => !selectedDeals.has(deal.id)));
    setSelectedDeals(new Set());
    toast.success("Selected deals deleted.");
  };

  const handleSaveRollup = (name: string, description: string) => {
    if (userRole !== "ADMIN") {
      toast.error("Only admins can save a rollup.");
      return;
    }

    if (selectedDeals.size === 0) {
      toast.error("Please select at least one deal to save a rollup.");
      return;
    }

    const selected = deals.filter((d) => selectedDeals.has(d.id));
    // TODO: send to API instead of console
    console.log("Saving Rollup:", { name, description, deals: selected });
    toast.success(`Rollup "${name}" saved with ${selected.length} deals!`);
  };

  return (
    <div className="p-6">
      {/* Previous Page Button */}
      <Button
        variant="outline"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous Page
      </Button>

      <h1 className="text-2xl font-bold mb-4">Deals Found</h1>

      {/* Deal List */}
      <div className="flex flex-col gap-4 mb-4 border p-4 rounded-md">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="flex items-start gap-3 border-b last:border-b-0 pb-3"
          >
            <input
              type="checkbox"
              checked={selectedDeals.has(deal.id)}
              onChange={() => toggleSelect(deal.id)}
              className="mt-1 h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <div className="flex-1 space-y-1">
              <div className="font-semibold">{deal.title}</div>
              <div className="text-sm text-muted-foreground">
                <p>Brokerage: {deal.brokerage}</p>
                <p>
                  Name: {deal.firstName} {deal.lastName}
                </p>
                <p>Email: {deal.email || "—"}</p>
                <p>LinkedIn: {deal.linkedinUrl || "—"}</p>
                <p>Phone: {deal.workPhone || "—"}</p>
                <p>Revenue: ${deal.revenue.toLocaleString()}</p>
                <p>EBITDA: ${deal.ebitda.toLocaleString()}</p>
                <p>Industry: {deal.industry}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="destructive" onClick={deleteSelected}>
          Delete Selected
        </Button>

        {}
        <SaveRollupDialog onSave={handleSaveRollup} />
      </div>
    </div>
  );
}
