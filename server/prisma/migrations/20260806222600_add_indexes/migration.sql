-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "custom_orders_user_id_created_at_idx" ON "custom_orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "custom_orders_status_created_at_idx" ON "custom_orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "custom_order_references_custom_order_id_idx" ON "custom_order_references"("custom_order_id");

-- CreateIndex
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");
