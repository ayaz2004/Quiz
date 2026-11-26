-- AlterTable
ALTER TABLE "User" ADD COLUMN "plan" VARCHAR(20) NOT NULL DEFAULT 'free',
ADD COLUMN "plan_expires_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "feature_limits" (
    "key" VARCHAR(50) NOT NULL,
    "free_limit" INTEGER,
    "enforced" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_limits_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "monthly_costs" (
    "monthly_cost_id" SERIAL NOT NULL,
    "month" DATE NOT NULL,
    "item" VARCHAR(100) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_costs_pkey" PRIMARY KEY ("monthly_cost_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_costs_month_item_key" ON "monthly_costs"("month", "item");
