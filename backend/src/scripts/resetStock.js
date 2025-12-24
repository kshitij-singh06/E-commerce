const prisma = require('../utils/prisma');

async function main() {
  await prisma.product.updateMany({
    data: { stock: 20 }  // give everything stock 20
  });

  console.log("Stock reset for all products.");
}

main()
  .finally(() => prisma.$disconnect());
