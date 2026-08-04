-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFER', 'MERCADOPAGO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "mpPaymentId" TEXT,
ADD COLUMN     "mpPreferenceId" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN     "paymentSurchargeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
