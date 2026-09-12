import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma CLI sa pouziva len pri vyvoji na generovanie klienta a SQL migracii
// (npm run db:migration). Bezaca appka migruje sama - viz src/lib/migrate.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: `file:${path.join(process.cwd(), ".data", "prisma-cli.db")}`,
  },
});
