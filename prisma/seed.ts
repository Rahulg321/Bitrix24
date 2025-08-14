import prismaDB from "../lib/prisma.server";

async function main() {
  console.log("Starting seeding");
  const deals = await prismaDB.deal.findMany();
  console.log("Deals fetched", deals.length);
  for (const deal of deals) {
    let ebitdaMargin = -1;
    if (deal.ebitda != null && deal.revenue != null && deal.revenue !== 0) {
      const margin = (deal.ebitda / deal.revenue) * 100;
      ebitdaMargin = Number(margin.toFixed(2));
    }
    console.log("Updating deal", deal.id, ebitdaMargin);

    await prismaDB.deal.update({
      where: { id: deal.id },
      data: { ebitdaMargin: ebitdaMargin },
    });
    console.log("successfully updated deal", deal.id);
  }
  console.log("Updated all ebitdaMargin values.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaDB.$disconnect();
  });
