const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database...');

  // 1. Hash password standar untuk semua akun dummy
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 2. Buat Akun Dosen
  const dosen = await prisma.user.upsert({
    where: { email: 'dosen@kampus.ac.id' },
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      name: 'Bapak Dosen IT',
      email: 'dosen@kampus.ac.id',
      password_hash: hashedPassword,
      role: 'LECTURER',
      nim_nip: '198001012005011001',
    },
  });
  console.log(`Berhasil membuat akun Dosen: ${dosen.email}`);

  // 3. Buat Akun Mahasiswa
  const mahasiswa = await prisma.user.upsert({
    where: { email: 'ferdi@student.kampus.ac.id' },
    update: {}, 
    create: {
      name: 'Ferdi Pratama Setia',
      email: 'ferdi@student.kampus.ac.id',
      password_hash: hashedPassword,
      role: 'STUDENT',
      nim_nip: '23071027',
    },
  });
  console.log(`Berhasil membuat akun Mahasiswa: ${mahasiswa.email}`);

  console.log('Seeding selesai! 🚀');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });