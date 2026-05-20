import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ravendock.co" },
    update: {},
    create: {
      email: "admin@ravendock.co",
      name: "Matt Tinnel",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Create a sample client
  const client = await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: {},
    create: {
      id: "seed-client-1",
      name: "Acme Restaurant Group",
      contact: "Sarah Johnson",
      email: "sarah@acmerestaurants.com",
      phone: "503-555-0100",
      address: "100 SW 5th Ave, Portland OR 97204",
    },
  });

  // Create a sample site
  const site = await prisma.site.upsert({
    where: { id: "seed-site-1" },
    update: {},
    create: {
      id: "seed-site-1",
      clientId: client.id,
      name: "Downtown Location",
      address: "100 SW 5th Ave",
      city: "Portland",
      state: "OR",
      zip: "97204",
    },
  });

  console.log("✅ Seeded:");
  console.log(`   Admin: admin@fireextenguisher.com / admin1234`);
  console.log(`   Client: ${client.name}`);
  console.log(`   Site: ${site.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
