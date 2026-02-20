import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const sites: Prisma.SiteCreateInput[] = [
  {
    name: 'Well Pad Alpha',
    location: 'Alberta, Canada',
    emissionLimit: new Prisma.Decimal(5000),
    totalEmissionsToDate: new Prisma.Decimal(1250.75),
    metadata: { region: 'western-canada', operator: 'Highwood Energy' },
  },
  {
    name: 'Compressor Station Bravo',
    location: 'British Columbia, Canada',
    emissionLimit: new Prisma.Decimal(12000),
    totalEmissionsToDate: new Prisma.Decimal(11800.5),
    metadata: { region: 'western-canada', operator: 'Pacific Gas Corp' },
  },
  {
    name: 'Processing Facility Charlie',
    location: 'Saskatchewan, Canada',
    emissionLimit: new Prisma.Decimal(25000),
    totalEmissionsToDate: new Prisma.Decimal(8430.2),
    metadata: { region: 'prairies', operator: 'Prairie Energy Ltd' },
  },
  {
    name: 'Storage Terminal Delta',
    location: 'Texas, USA',
    emissionLimit: new Prisma.Decimal(8000),
    totalEmissionsToDate: new Prisma.Decimal(0),
    metadata: { region: 'permian-basin', operator: 'Lone Star Ops' },
  },
];

async function main() {
  console.log('Seeding database...');

  for (const site of sites) {
    const created = await prisma.site.create({ data: site });
    console.log(`  Created site: ${created.name} (${created.id})`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
