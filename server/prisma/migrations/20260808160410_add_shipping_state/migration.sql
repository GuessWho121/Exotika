-- DropIndex
DROP INDEX "products_description_trgm_idx";

-- DropIndex
DROP INDEX "products_title_trgm_idx";

-- AlterTable
ALTER TABLE "custom_orders" ADD COLUMN     "customer_state" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_state" TEXT NOT NULL DEFAULT 'Unknown';
