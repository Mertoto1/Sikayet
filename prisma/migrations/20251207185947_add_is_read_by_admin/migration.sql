-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SupportTicket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "companyId" INTEGER NOT NULL,
    "adminId" INTEGER,
    "isReadByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SupportTicket" ("adminId", "companyId", "content", "createdAt", "id", "priority", "status", "title", "updatedAt") SELECT "adminId", "companyId", "content", "createdAt", "id", "priority", "status", "title", "updatedAt" FROM "SupportTicket";
DROP TABLE "SupportTicket";
ALTER TABLE "new_SupportTicket" RENAME TO "SupportTicket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
