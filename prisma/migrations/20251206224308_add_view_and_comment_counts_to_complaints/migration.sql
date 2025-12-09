-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Complaint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_MODERATION',
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "moderatorId" INTEGER,
    "publishedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Complaint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Complaint_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Complaint" ("companyId", "content", "createdAt", "id", "moderatorId", "publishedAt", "status", "title", "userId") SELECT "companyId", "content", "createdAt", "id", "moderatorId", "publishedAt", "status", "title", "userId" FROM "Complaint";
DROP TABLE "Complaint";
ALTER TABLE "new_Complaint" RENAME TO "Complaint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
