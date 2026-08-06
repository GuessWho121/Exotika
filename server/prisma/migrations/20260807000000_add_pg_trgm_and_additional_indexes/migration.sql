-- CreateIndex
CREATE INDEX "products_category_created_at_idx" ON "products"("category", "created_at" DESC);

-- CreateExtension pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "products_title_trgm_idx" ON "products" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "products_description_trgm_idx" ON "products" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "orders_customer_email_idx" ON "orders"(lower("customer_email"));

-- CreateIndex
CREATE INDEX "custom_orders_customer_email_idx" ON "custom_orders"(lower("customer_email"));
