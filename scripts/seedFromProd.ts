// scripts/seedFromProd.ts
import fetch from 'node-fetch'
import { PrismaClient } from '@prisma/client'

type DealDTO = {
  id: string
  brokerage: string
  dealCaption: string
  revenue: number
  ebitda: number
  title?: string
  description?: string
  ebitdaMargin: number
  industry: string
  sourceWebsite: string
  publishedAt: string
}

const prisma = new PrismaClient()

async function main() {
  // 1. Fetch the live deals JSON
  const res = await fetch('https://bitrix24-three.vercel.app/api/raw-deals')
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
  const deals = (await res.json()) as DealDTO[]


  // 2. Upsert each deal
  for (const d of deals) {
    await prisma.deal.upsert({
      where: { id: d.id },
      create: {
        id:            d.id,
        brokerage:     d.brokerage,
        dealCaption:   d.dealCaption,
        revenue:       d.revenue,
        ebitda:        d.ebitda,
        title:         d.title ?? '',
        description:   d.description ?? '',
        ebitdaMargin:  d.ebitdaMargin,
        industry:      d.industry,
        sourceWebsite: d.sourceWebsite,
        publishedAt:   new Date(d.publishedAt),
      },
      update: {
        title:         d.title,
        description:   d.description,
        ebitdaMargin:  d.ebitdaMargin,
        publishedAt:   new Date(d.publishedAt),
      },
    })
  }

  console.log(`✔ Upserted ${deals.length} deals`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
