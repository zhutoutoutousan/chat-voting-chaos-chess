import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chaoschess.com' },
    update: {},
    create: {
      email: 'admin@chaoschess.com',
      username: 'admin',
      name: 'Administrator',
      isAdmin: true,
      isPremium: true,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', admin.username);

  // Create test users
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@test.com' },
      update: {},
      create: {
        email: 'alice@test.com',
        username: 'alice',
        name: 'Alice',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@test.com' },
      update: {},
      create: {
        email: 'bob@test.com',
        username: 'bob',
        name: 'Bob',
        isActive: true,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log('✅ Created test users:', testUsers.map((u: any) => u.username).join(', '));

  // Create initial ratings for users
  const users = [admin, ...testUsers];
  for (const user of users) {
    await Promise.all([
      prisma.rating.upsert({
        where: {
          userId_ratingType: {
            userId: user.id,
            ratingType: 'OVERALL',
          },
        },
        update: {},
        create: {
          userId: user.id,
          ratingType: 'OVERALL',
          rating: 1200,
        },
      }),
      prisma.rating.upsert({
        where: {
          userId_ratingType: {
            userId: user.id,
            ratingType: 'BLITZ',
          },
        },
        update: {},
        create: {
          userId: user.id,
          ratingType: 'BLITZ',
          rating: 1200,
        },
      }),
      prisma.rating.upsert({
        where: {
          userId_ratingType: {
            userId: user.id,
            ratingType: 'RAPID',
          },
        },
        update: {},
        create: {
          userId: user.id,
          ratingType: 'RAPID',
          rating: 1200,
        },
      }),
    ]);
  }

  console.log('✅ Created initial ratings for users');

  // Create sample puzzles
  const puzzles = [
    {
      fen: 'r1bqkb1r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
      solution: ['Qxf7'],
      difficulty: 'BEGINNER' as const,
      theme: 'CHECKMATE' as const,
    },
    {
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      solution: ['Bxf7+', 'Ke7', 'Nd5#'],
      difficulty: 'INTERMEDIATE' as const,
      theme: 'TACTICS' as const,
    },
  ];

  for (const puzzle of puzzles) {
    await prisma.puzzle.create({
      data: puzzle,
    });
  }

  console.log('✅ Created sample puzzles');

  // Create global chat rooms
  const globalRooms = [
    {
      name: 'General',
      description: 'Main community chat room',
      type: 'GLOBAL' as const,
      isPublic: true,
      ownerId: admin.id,
    },
    {
      name: 'New Players',
      description: 'Welcome room for beginners',
      type: 'GLOBAL' as const,
      isPublic: true,
      ownerId: admin.id,
    },
  ];

  for (const room of globalRooms) {
    await prisma.chatRoom.upsert({
      where: { id: room.name }, // Use a unique identifier
      update: {},
      create: room,
    }).catch(async () => {
      // If upsert fails, try create
      await prisma.chatRoom.create({ data: room });
    });
  }

  console.log('✅ Created global chat rooms');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
