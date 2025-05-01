import {
  PrismaClient,
  UserRole,
  DealType,
  SIMStatus,
  Sentiment,
  POC,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      role: UserRole.ADMIN,
    },
  });

  // Create regular user
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      name: "Regular User",
      role: UserRole.USER,
    },
  });

  // Create some sample deals
  const deal1 = await prisma.deal.create({
    data: {
      brokerage: "ABC Brokerage",
      firstName: "John",
      lastName: "Smith",
      email: "john@abcbrokerage.com",
      linkedinUrl: "https://linkedin.com/in/johnsmith",
      workPhone: "555-0123",
      dealCaption: "Manufacturing Company Sale",
      revenue: 5000000,
      ebitda: 1000000,
      title: "Profitable Manufacturing Business",
      grossRevenue: 5500000,
      askingPrice: 7500000,
      ebitdaMargin: 0.2,
      industry: "Manufacturing",
      dealType: DealType.MANUAL,
      sourceWebsite: "www.abcbrokerage.com",
      companyLocation: "Chicago, IL",
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      brokerage: "XYZ Business Sales",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@xyzbusiness.com",
      linkedinUrl: "https://linkedin.com/in/janedoe",
      workPhone: "555-0456",
      dealCaption: "Software Company Acquisition",
      revenue: 3000000,
      ebitda: 900000,
      title: "Growing SaaS Business",
      grossRevenue: 3200000,
      askingPrice: 6000000,
      ebitdaMargin: 0.3,
      industry: "Technology",
      dealType: DealType.AI_INFERRED,
      sourceWebsite: "www.xyzbusiness.com",
      companyLocation: "Austin, TX",
    },
  });

  // Create PoC entries
  await prisma.pOC.create({
    data: {
      name: "Test",
      workPhone: "(574) 256-8810",
      email: "putmanaugustine@gmail.com",
      websites: [],
      dealId: deal1.id,
    },
  });

  // Create SIM entries
  await prisma.sIM.create({
    data: {
      title: "Initial Assessment",
      caption: "Manufacturing Company Analysis",
      status: SIMStatus.COMPLETED,
      fileName: "assessment.pdf",
      fileType: "application/pdf",
      fileUrl: "https://storage.example.com/assessment.pdf",
      dealId: deal1.id,
    },
  });

  // Create AI Screening entries
  await prisma.aiScreening.create({
    data: {
      dealId: deal2.id,
      title: "AI Analysis Report",
      explanation: "Strong growth potential in SaaS market",
      sentiment: Sentiment.POSITIVE,
    },
  });

  // Create sample questionnaire
  await prisma.questionnaire.create({
    data: {
      fileUrl: "https://storage.example.com/questionnaire.pdf",
      title: "Standard Due Diligence",
      purpose: "Initial Deal Assessment",
      author: "Deal Team",
      version: "1.0",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
