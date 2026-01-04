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

  console.log('✅ Created test users:', testUsers.map(u => u.username).join(', '));

  // Create initial ratings for users
  const ratingTypes = ['OVERALL', 'BLITZ', 'RAPID', 'CLASSICAL'] as const;
  
  for (const user of [admin, ...testUsers]) {
    for (const ratingType of ratingTypes) {
      await prisma.rating.upsert({
        where: {
          userId_ratingType: {
            userId: user.id,
            ratingType,
          },
        },
        update: {},
        create: {
          userId: user.id,
          ratingType,
          rating: 1200,
        },
      });
    }
  }

  console.log('✅ Created initial ratings');

  // Create sample puzzles
  const puzzles = [
    {
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      solution: ['e4', 'Nf6', 'Nc3'],
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

  // Create global chat room
  await prisma.chatRoom.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      name: 'Global Chat',
      type: 'GLOBAL',
      isPublic: true,
    },
  });

  console.log('✅ Created global chat room');

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
