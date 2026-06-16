-- CreateTable
CREATE TABLE "user_questions" (
    "question_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "guest_email" TEXT,
    "question" TEXT NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "answer" TEXT,
    "answered_by" INTEGER,
    "answered_at" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateIndex
CREATE INDEX "user_questions_user_id_idx" ON "user_questions"("user_id");

-- CreateIndex
CREATE INDEX "user_questions_guest_email_idx" ON "user_questions"("guest_email");

-- CreateIndex
CREATE INDEX "user_questions_status_idx" ON "user_questions"("status");

-- CreateIndex
CREATE INDEX "user_questions_category_idx" ON "user_questions"("category");

-- CreateIndex
CREATE INDEX "user_questions_created_at_idx" ON "user_questions"("created_at");

-- AddForeignKey
ALTER TABLE "user_questions" ADD CONSTRAINT "user_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_questions" ADD CONSTRAINT "user_questions_answered_by_fkey" FOREIGN KEY ("answered_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
