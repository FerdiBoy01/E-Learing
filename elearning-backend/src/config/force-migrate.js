const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Memulai injeksi skema Revenue Sharing ke PostgreSQL...");

    // 1. Suntik kolom baru ke tabel transactions
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "platform_fee" INTEGER DEFAULT 0;`,
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "net_revenue" INTEGER DEFAULT 0;`,
    );
    console.log(
      "✅ Kolom platform_fee & net_revenue sukses ditambahkan ke tabel transactions!",
    );

    // 2. Ciptakan tabel withdrawals (Penarikan Dana)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "withdrawals" (
        "id" TEXT NOT NULL,
        "lecturer_id" TEXT NOT NULL,
        "amount" INTEGER NOT NULL,
        "bank_name" TEXT NOT NULL,
        "account_number" TEXT NOT NULL,
        "account_name" TEXT NOT NULL,
        "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "withdrawals_lecturer_id_fkey" FOREIGN KEY ("lecturer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log("✅ Tabel withdrawals sukses diciptakan!");

    console.log(
      "🎉 INJEKSI SELESAI! Database lu udah selevel Tokopedia/Udemy bos!",
    );
  } catch (error) {
    console.error("❌ Waduh gagal bos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
