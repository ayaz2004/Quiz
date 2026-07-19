-- CreateTable
CREATE TABLE "housing_groups" (
    "group_id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "university" VARCHAR(20) NOT NULL DEFAULT 'JMI',
    "preferred_area" VARCHAR(100),
    "target_size" INTEGER NOT NULL,
    "budget_per_person" DOUBLE PRECISION,
    "move_in_date" TIMESTAMP(3),
    "gender_preference" VARCHAR(20) NOT NULL,
    "contact_phone" VARCHAR(20),
    "whatsapp_number" VARCHAR(20),
    "whatsapp_group_link" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'recruiting',
    "invite_code" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "housing_groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "housing_group_members" (
    "member_id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "housing_group_members_pkey" PRIMARY KEY ("member_id")
);

-- CreateTable
CREATE TABLE "housing_group_join_requests" (
    "request_id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "housing_group_join_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "housing_groups_invite_code_key" ON "housing_groups"("invite_code");

-- CreateIndex
CREATE INDEX "housing_groups_status_idx" ON "housing_groups"("status");

-- CreateIndex
CREATE INDEX "housing_groups_university_idx" ON "housing_groups"("university");

-- CreateIndex
CREATE INDEX "housing_groups_created_at_idx" ON "housing_groups"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "housing_group_members_group_id_user_id_key" ON "housing_group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "housing_group_members_user_id_idx" ON "housing_group_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "housing_group_join_requests_group_id_user_id_key" ON "housing_group_join_requests"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "housing_group_join_requests_group_id_idx" ON "housing_group_join_requests"("group_id");

-- CreateIndex
CREATE INDEX "housing_group_join_requests_status_idx" ON "housing_group_join_requests"("status");

-- AddForeignKey
ALTER TABLE "housing_groups" ADD CONSTRAINT "housing_groups_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housing_group_members" ADD CONSTRAINT "housing_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "housing_groups"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housing_group_members" ADD CONSTRAINT "housing_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housing_group_join_requests" ADD CONSTRAINT "housing_group_join_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "housing_groups"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housing_group_join_requests" ADD CONSTRAINT "housing_group_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
