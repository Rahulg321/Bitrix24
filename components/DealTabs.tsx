"use client";
// components/DealTabs.tsx


import React, { useState, Suspense } from 'react';
import type { Deal } from '@prisma/client';
import Link from 'next/link';
import {
  Hash,
  Tag,
  CheckCircle,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Building,
  DollarSign,
  Percent,
  CreditCard,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DealDetailItem } from '@/components/DealDetailItem';
import { ScrollArea } from '@/components/ui/scroll-area';

import DealHistoryView from '@/components/DealHistoryView';
import dynamic from 'next/dynamic';
import AIReasoningSkeleton from '@/components/skeletons/AIReasoningSkeleton';
import SimUploadDialog from '@/components/Dialogs/sim-upload-dialog';
import SimItemSkeleton from '@/components/skeletons/SimItemSkeleton';
import DealDocumentUploadDialog from '@/components/Dialogs/deal-document-upload-dialog';

const FetchDealAIScreenings = dynamic(() => import('@/components/FetchDealAIScreenings'), { ssr: true });
const FetchDealSim = dynamic(() => import('@/components/FetchDealSim'), { ssr: true });
const FetchDealDocuments = dynamic(() => import('@/components/fetch-deal-documents'), { ssr: true });
const FetchDealPOC = dynamic(() => import('@/components/FetchDealPOC'), { ssr: true });

interface Props {
  deal: Deal;
}

export default function DealTabs({ deal }: Props) {
  const [active, setActive] = useState<
    'basic' | 'financial' | 'ai' | 'docs' | 'sims' | 'pocs' | 'history'
  >('basic');

  return (
    <div>
      {/* ── Tab Headers ── */}
      <div className="flex flex-wrap gap-2 border-b mb-4">
        {[
          { id: 'basic', label: 'Basic Information' },
          { id: 'financial', label: 'Financial Details' },
          { id: 'ai', label: 'AI Reasoning' },
          { id: 'docs', label: 'Deal Documents' },
          { id: 'sims', label: 'SIMs' },
          { id: 'pocs', label: 'Point of Contacts' },
          { id: 'history', label: 'Version History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id as any)}
            className={`px-4 py-2 transition-colors ${active === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Panels ── */}
      <div className="space-y-4">
        {/* Basic Information */}
        {active === 'basic' && (
          <Card>
            <CardHeader className="border-b bg-primary/5">
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <DealDetailItem icon={<Hash />} label="Deal ID" value={deal.id} />
              <DealDetailItem
                icon={<Hash />}
                label="Bitrix ID"
                value={deal.bitrixId ?? '—'}
              />
              <DealDetailItem
                icon={<Tag />}
                label="Status"
                value={deal.status}
              />
              <DealDetailItem
                icon={<Tag />}
                label="Tags"
                value={deal.tags.length ? deal.tags.join(', ') : '—'}
              />
              <DealDetailItem
                icon={<CheckCircle />}
                label="Reviewed"
                value={deal.reviewed ? 'Yes' : 'No'}
              />
              <DealDetailItem
                icon={<CheckCircle />}
                label="Seen"
                value={deal.seen ? 'Yes' : 'No'}
              />
              <DealDetailItem
                icon={<CheckCircle />}
                label="Published"
                value={deal.published ? 'Yes' : 'No'}
              />
              <DealDetailItem
                icon={<Briefcase />}
                label="Brokerage"
                value={deal.brokerage}
              />
              <DealDetailItem
                icon={<MapPin />}
                label="Location"
                value={deal.companyLocation ?? '—'}
              />
              <DealDetailItem
                icon={<Building />}
                label="Industry"
                value={deal.industry}
              />
              <DealDetailItem
                icon={<Phone />}
                label="Phone"
                value={deal.workPhone ?? '—'}
              />
              <DealDetailItem
                icon={<Mail />}
                label="Email"
                value={deal.email ?? '—'}
              />
            </CardContent>
          </Card>
        )}

        {/* Financial Details */}
        {active === 'financial' && (
          <Card>
            <CardHeader className="border-b bg-primary/5">
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              <DealDetailItem
                icon={<DollarSign />}
                label="Revenue"
                value={`$${deal.revenue.toFixed(2)}`}
              />
              <DealDetailItem
                icon={<DollarSign />}
                label="EBITDA"
                value={`$${deal.ebitda.toFixed(2)}`}
              />
              <DealDetailItem
                icon={<Percent />}
                label="EBITDA Margin"
                value={`${((deal.ebitda / deal.revenue) * 100).toFixed(2)}%`}
              />
              <DealDetailItem
                icon={<CreditCard />}
                label="Asking Price"
                value={
                  deal.askingPrice != null
                    ? `$${deal.askingPrice.toFixed(2)}`
                    : '—'
                }
              />
              <DealDetailItem
                icon={<DollarSign />}
                label="Gross Revenue"
                value={
                  deal.grossRevenue != null
                    ? `$${deal.grossRevenue.toFixed(2)}`
                    : '—'
                }
              />
            </CardContent>
          </Card>
        )}

        {/* AI Reasoning */}
        {active === 'ai' && (
          <Card>
            <CardHeader className="flex justify-between border-b bg-primary/5">
              <CardTitle>AI Reasoning</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/raw-deals/${deal.id}/screen`}>
                  <Plus className="mr-2 h-4 w-4" /> Add AI Reasoning
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <Suspense fallback={<AIReasoningSkeleton />}>
                  <FetchDealAIScreenings
                    dealId={deal.id}
                    dealType={deal.dealType}
                  />
                </Suspense>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Deal Documents */}
        {active === 'docs' && (
          <Card>
            <CardHeader className="flex justify-between border-b bg-primary/5">
              <CardTitle>Deal Documents</CardTitle>
              <DealDocumentUploadDialog
                dealId={deal.id}
                dealType={deal.dealType}
              />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <FetchDealDocuments
                  dealId={deal.id}
                  dealType={deal.dealType}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* SIMs */}
        {active === 'sims' && (
          <Card>
            <CardHeader className="flex justify-between border-b bg-primary/5">
              <CardTitle>SIMs</CardTitle>
              <SimUploadDialog dealId={deal.id} dealType={deal.dealType} />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <Suspense fallback={<SimItemSkeleton />}>
                  <FetchDealSim
                    dealId={deal.id}
                    dealType={deal.dealType}
                  />
                </Suspense>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Point of Contacts */}
        {active === 'pocs' && (
          <Card>
            <CardHeader className="border-b bg-primary/5">
              <CardTitle>Point of Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <FetchDealPOC
                  dealId={deal.id}
                  dealType={deal.dealType}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Version History */}
        {active === 'history' && (
          <Card>
            <CardHeader className="border-b bg-primary/5">
              <CardTitle>Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <DealHistoryView dealId={deal.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
