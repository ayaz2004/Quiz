 -- CreateTable
CREATE TABLE "quiz_cutoffs" (
    "cutoff_id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "general" DOUBLE PRECISION,
    "muslim" DOUBLE PRECISION,
    "muslim_obc_st" DOUBLE PRECISION,
    "muslim_women" DOUBLE PRECISION,
    "jk" DOUBLE PRECISION,
    "km" DOUBLE PRECISION,
    "pwd" DOUBLE PRECISION,
    "pwd_locomoter" DOUBLE PRECISION,
    "pwd_blind_vision" DOUBLE PRECISION,
    "pwd_hearing" DOUBLE PRECISION,
    "jamia_internal" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_cutoffs_pkey" PRIMARY KEY ("cutoff_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_cutoffs_quiz_id_year_key" ON "quiz_cutoffs"("quiz_id", "year");

-- CreateIndex
CREATE INDEX "quiz_cutoffs_quiz_id_idx" ON "quiz_cutoffs"("quiz_id");

-- CreateIndex
CREATE INDEX "quiz_cutoffs_year_idx" ON "quiz_cutoffs"("year");

-- AddForeignKey
ALTER TABLE "quiz_cutoffs" ADD CONSTRAINT "quiz_cutoffs_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("quiz_id") ON DELETE CASCADE ON UPDATE CASCADE;
