// scripts/seedFromProd.cjs
;(async () => {
  // Node 18+ has fetch built‑in
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    // 1. fetch live deals
    const res = await fetch('http://localhost:3000/api/raw-deals')
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }
    const deals = await res.json()

    // 2. upsert
    for (const d of deals) {
      await prisma.deal.upsert({
        where: { id: d.id },
        create: {
          id:            d.id,
          brokerage:     d.brokerage,
          dealCaption:   d.dealCaption,
          revenue:       d.revenue,
          ebitda:        d.ebitda,
          title:         d.title   ?? '',
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
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
