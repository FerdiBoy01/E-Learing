/*
  Warnings:

  - You are about to drop the column `status` on the `courses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[access_code]` on the table `courses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CourseVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('REGULAR', 'PROJECT_BASED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'CREATOR';
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "status",
ADD COLUMN     "access_code" TEXT,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "CourseType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "visibility" "CourseVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "is_free_preview" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "image_url" TEXT,
ALTER COLUMN "submission_type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_url" TEXT,
    "gateway_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_student_id_idx" ON "transactions"("student_id");

-- CreateIndex
CREATE INDEX "transactions_course_id_idx" ON "transactions"("course_id");

-- CreateIndex
CREATE INDEX "enrollments_student_id_idx" ON "enrollments"("student_id");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_course_id_key" ON "enrollments"("student_id", "course_id");

-- CreateIndex
CREATE INDEX "chapters_course_id_idx" ON "chapters"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_access_code_key" ON "courses"("access_code");

-- CreateIndex
CREATE INDEX "courses_lecturer_id_idx" ON "courses"("lecturer_id");

-- CreateIndex
CREATE INDEX "courses_visibility_is_published_idx" ON "courses"("visibility", "is_published");

-- CreateIndex
CREATE INDEX "materials_chapter_id_idx" ON "materials"("chapter_id");

-- CreateIndex
CREATE INDEX "student_progress_student_id_idx" ON "student_progress"("student_id");

-- CreateIndex
CREATE INDEX "student_progress_material_id_idx" ON "student_progress"("material_id");

-- CreateIndex
CREATE INDEX "submissions_student_id_idx" ON "submissions"("student_id");

-- CreateIndex
CREATE INDEX "submissions_material_id_idx" ON "submissions"("material_id");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
