import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Creamos un usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      habits: {
        create: [
          { title: 'Estudiar Nest.js' },
          { title: 'Tocar el piano' },
          { title: 'Hacer ejercicio' },
        ],
      },
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });