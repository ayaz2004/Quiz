-- CreateTable
CREATE TABLE "tracked_courses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_type_id" VARCHAR(100) NOT NULL,
    "course_type_name" VARCHAR(255) NOT NULL,
    "course_name_id" VARCHAR(100) NOT NULL,
    "course_name" VARCHAR(500) NOT NULL,
    "phd_discipline_id" VARCHAR(100) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracked_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_result_snapshots" (
    "id" SERIAL NOT NULL,
    "course_type_id" VARCHAR(100) NOT NULL,
    "course_name_id" VARCHAR(100) NOT NULL,
    "phd_discipline_id" VARCHAR(100) NOT NULL DEFAULT '',
    "course_type_name" VARCHAR(255),
    "course_name" VARCHAR(500),
    "fingerprint" VARCHAR(64) NOT NULL,
    "results_json" JSONB NOT NULL,
    "last_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_changed_at" TIMESTAMP(3),

    CONSTRAINT "course_result_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_type_id" VARCHAR(100) NOT NULL,
    "course_name_id" VARCHAR(100) NOT NULL,
    "phd_discipline_id" VARCHAR(100) NOT NULL DEFAULT '',
    "course_type_name" VARCHAR(255) NOT NULL,
    "course_name" VARCHAR(500) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "result_link" TEXT,
    "fingerprint" VARCHAR(64) NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "result_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tracked_course_lookup_idx" ON "tracked_courses"("course_type_id", "course_name_id", "phd_discipline_id");

-- CreateIndex
CREATE INDEX "tracked_course_user_idx" ON "tracked_courses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracked_course_user_key" ON "tracked_courses"("user_id", "course_type_id", "course_name_id", "phd_discipline_id");

-- CreateIndex
CREATE INDEX "crs_snapshot_course_idx" ON "course_result_snapshots"("course_type_id", "course_name_id", "phd_discipline_id");

-- CreateIndex
CREATE UNIQUE INDEX "crs_snapshot_course_key" ON "course_result_snapshots"("course_type_id", "course_name_id", "phd_discipline_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "result_notifications_user_id_created_at_idx" ON "result_notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "result_notifications_user_id_read_at_idx" ON "result_notifications"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "tracked_courses" ADD CONSTRAINT "tracked_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_notifications" ADD CONSTRAINT "result_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
