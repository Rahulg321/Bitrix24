import prismaDB from "@/lib/prisma.server";

async function main() {
  console.log("deleting all deals");

  try {
    await prismaDB.deal.deleteMany();
  } catch (error) {
    console.error(error);
  }

  console.log("deleted everything................");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaDB.$disconnect();
  });
