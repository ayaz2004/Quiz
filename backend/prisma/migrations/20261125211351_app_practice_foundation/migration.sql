-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "difficulty" VARCHAR(10),
ADD COLUMN     "suggested_topic_id" INTEGER,
ADD COLUMN     "suggestion_confidence" DOUBLE PRECISION,
ADD COLUMN     "topic_id" INTEGER;

-- CreateTable
CREATE TABLE "topics" (
    "topic_id" SERIAL NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "question_responses" (
    "response_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_option" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "time_taken_ms" INTEGER NOT NULL DEFAULT 0,
    "source" VARCHAR(20) NOT NULL,
    "client_id" VARCHAR(80) NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "review_items" (
    "review_item_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "box" INTEGER NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "last_answered_at" TIMESTAMP(3) NOT NULL,
    "wrong_count" INTEGER NOT NULL,
    "graduated" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_items_pkey" PRIMARY KEY ("review_item_id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "bookmark_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("bookmark_id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "device_token_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "platform" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("device_token_id")
);

-- CreateTable
CREATE TABLE "daily_activities" (
    "daily_activity_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "questions_answered" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("daily_activity_id")
);

-- CreateTable
CREATE TABLE "study_profiles" (
    "study_profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "target_course_key" VARCHAR(120),
    "target_course_name" VARCHAR(255),
    "category" VARCHAR(30),
    "daily_goal" INTEGER NOT NULL DEFAULT 15,
    "exam_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_profiles_pkey" PRIMARY KEY ("study_profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topics_subject_name_key" ON "topics"("subject", "name");

-- CreateIndex
CREATE INDEX "question_responses_user_id_question_id_answered_at_idx" ON "question_responses"("user_id", "question_id", "answered_at");

-- CreateIndex
CREATE INDEX "question_responses_user_id_answered_at_idx" ON "question_responses"("user_id", "answered_at");

-- CreateIndex
CREATE UNIQUE INDEX "question_responses_user_id_client_id_key" ON "question_responses"("user_id", "client_id");

-- CreateIndex
CREATE INDEX "review_items_user_id_graduated_due_at_idx" ON "review_items"("user_id", "graduated", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_items_user_id_question_id_key" ON "review_items"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_question_id_key" ON "bookmarks"("user_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activities_user_id_date_key" ON "daily_activities"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "study_profiles_user_id_key" ON "study_profiles"("user_id");

-- CreateIndex
CREATE INDEX "Question_topic_id_idx" ON "Question"("topic_id");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("topic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_suggested_topic_id_fkey" FOREIGN KEY ("suggested_topic_id") REFERENCES "topics"("topic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_profiles" ADD CONSTRAINT "study_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
