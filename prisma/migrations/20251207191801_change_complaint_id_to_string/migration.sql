/*
  Warnings:

  - The primary key for the `Complaint` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Complaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_Complaint" ("commentCount", "companyId", "content", "createdAt", "id", "moderatorId", "publishedAt", "status", "title", "userId", "viewCount") SELECT "commentCount", "companyId", "content", "createdAt", "id", "moderatorId", "publishedAt", "status", "title", "userId", "viewCount" FROM "Complaint";
DROP TABLE "Complaint";
ALTER TABLE "new_Complaint" RENAME TO "Complaint";
CREATE TABLE "new_ComplaintImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "complaintId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    CONSTRAINT "ComplaintImage_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ComplaintImage" ("complaintId", "id", "url") SELECT "complaintId", "id", "url" FROM "ComplaintImage";
DROP TABLE "ComplaintImage";
ALTER TABLE "new_ComplaintImage" RENAME TO "ComplaintImage";
CREATE TABLE "new_ComplaintResponse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "complaintId" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplaintResponse_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ComplaintResponse_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ComplaintResponse" ("companyId", "complaintId", "createdAt", "id", "message") SELECT "companyId", "complaintId", "createdAt", "id", "message" FROM "ComplaintResponse";
DROP TABLE "ComplaintResponse";
ALTER TABLE "new_ComplaintResponse" RENAME TO "ComplaintResponse";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
