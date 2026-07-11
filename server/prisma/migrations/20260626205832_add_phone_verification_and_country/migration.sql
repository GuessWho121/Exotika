-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_country" TEXT NOT NULL DEFAULT 'India';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Home',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
