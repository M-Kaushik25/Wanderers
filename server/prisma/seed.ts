import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo tour company and packages...');

  // Create or find operator user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@wanderers.com' },
    update: {},
    create: {
      email: 'operator@wanderers.com',
      password: hashedPassword,
      name: 'Apex Travel Co.',
      role: 'OPERATOR',
    },
  });

  // Create company profile
  const company = await prisma.company.upsert({
    where: { userId: operatorUser.id },
    update: {},
    create: {
      userId: operatorUser.id,
      name: 'Apex Expeditions & Travels',
      description: 'Premier luxury & adventure tour operator verified by Wanderers.',
      gstNumber: '29ABCDE1234F1Z5',
      isVerified: true,
    },
  });

  // Seed packages
  const samplePackages = [
    {
      companyId: company.id,
      title: 'Swiss Alps Hiking & Alpine Resort Stay',
      destination: 'Interlaken, Switzerland',
      durationDays: 7,
      price: 2499,
      description: 'Explore pristine alpine trails, majestic glaciers, and luxury chalet stays in the heart of Switzerland.',
      itinerary: 'Day 1: Arrival in Zurich & Transfer to Interlaken\nDay 2-4: Guided trail hikes & Jungfraujoch railway\nDay 5-6: Lake Thun cruise & Relaxation\nDay 7: Departure',
      coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    },
    {
      companyId: company.id,
      title: 'Bali Cultural Discovery & Tropical Beaches',
      destination: 'Ubud & Seminyak, Indonesia',
      durationDays: 5,
      price: 1199,
      description: 'Immerse yourself in Balinese temples, lush rice terraces, white sand beach clubs, and serene spa retreats.',
      itinerary: 'Day 1: Arrival & Hotel Check-in in Ubud\nDay 2: Temple Tour & Tegalalang Rice Terraces\nDay 3: Mount Batur Sunrise Trek\nDay 4: Seminyak Beach & Sunset Dinner\nDay 5: Departure',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    },
    {
      companyId: company.id,
      title: 'Kyoto Autumn Temple & Garden Tour',
      destination: 'Kyoto, Japan',
      durationDays: 6,
      price: 1850,
      description: 'Witness mesmerising fall colors across ancient zen gardens, traditional tea houses, and historic shrines.',
      itinerary: 'Day 1: Arrival in Osaka & Shinkansen to Kyoto\nDay 2: Fushimi Inari & Arashiyama Bamboo Grove\nDay 3: Kinkaku-ji & Gion Geisha District\nDay 4: Traditional Tea Ceremony & Kaiseki Dinner\nDay 5: Nara Day Trip\nDay 6: Departure',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const pkg of samplePackages) {
    await prisma.package.create({
      data: pkg,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
