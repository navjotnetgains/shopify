-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GalleryUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "eventId" TEXT,
    "itemId" TEXT,
    "itemType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryUpload_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GalleryUpload" ("createdAt", "customerId", "email", "eventId", "id", "itemId", "itemType", "name", "status") SELECT "createdAt", "customerId", "email", "eventId", "id", "itemId", "itemType", "name", "status" FROM "GalleryUpload";
DROP TABLE "GalleryUpload";
ALTER TABLE "new_GalleryUpload" RENAME TO "GalleryUpload";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
