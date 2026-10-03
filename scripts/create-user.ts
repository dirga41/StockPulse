// Tambah atau ganti password pengguna:
//   npm run user:create -- <username> <password> "<Nama Lengkap>"
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const [username, password, name] = process.argv.slice(2);
  if (!username || !password) {
    console.error('Pemakaian: npm run user:create -- <username> <password> "<Nama>"');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password minimal 6 karakter");
    process.exit(1);
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { username: username.toLowerCase() },
    update: { passwordHash, ...(name ? { name } : {}) },
    create: { username: username.toLowerCase(), passwordHash, name: name || username },
  });
  console.log(`Pengguna "${user.username}" siap dipakai.`);
}

main().finally(() => prisma.$disconnect());
