import { configDotenv } from 'dotenv';
import { PrismaClient } from '@prisma/client';

configDotenv({ path: '.env' });

if (process.env.NODE_ENV !== 'production') {
  configDotenv({ path: '.env.local', override: true });
}

const sourceDatabaseUrl = process.env.SOURCE_DATABASE_URL;
const targetDatabaseUrl = process.env.DATABASE_URL;

if (!sourceDatabaseUrl) {
  throw new Error('SOURCE_DATABASE_URL is required to copy data from the cloud database.');
}

if (!targetDatabaseUrl) {
  throw new Error('DATABASE_URL is required to copy data into the server database.');
}

const sourceClient = new PrismaClient({
  datasources: {
    db: {
      url: sourceDatabaseUrl,
    },
  },
});

const targetClient = new PrismaClient({
  datasources: {
    db: {
      url: targetDatabaseUrl,
    },
  },
});

async function resetTargetData() {
  const existingCounts = await Promise.all([
    targetClient.user.count(),
    targetClient.quiz.count(),
    targetClient.question.count(),
    targetClient.quizAttempt.count(),
    targetClient.purchase.count(),
    targetClient.suggestion.count(),
  ]);

  const hasExistingData = existingCounts.some((count) => count > 0);

  if (!hasExistingData) {
    return;
  }

  if (process.env.FORCE !== 'true') {
    throw new Error(
      'Target database already contains data. Set FORCE=true if you want to overwrite it.'
    );
  }

  await targetClient.suggestion.deleteMany();
  await targetClient.purchase.deleteMany();
  await targetClient.quizAttempt.deleteMany();
  await targetClient.question.deleteMany();
  await targetClient.quiz.deleteMany();
  await targetClient.user.deleteMany();
}

async function copyModel(sourceQuery, targetCreateMany) {
  const rows = await sourceQuery();

  if (rows.length === 0) {
    return 0;
  }

  await targetCreateMany(rows);
  return rows.length;
}

async function resetIdentity(tableName, columnName) {
  await targetClient.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('${tableName}', '${columnName}'), COALESCE((SELECT MAX(${columnName}) FROM ${tableName}), 1), true);`
  );
}

async function main() {
  try {
    await sourceClient.$connect();
    await targetClient.$connect();

    await resetTargetData();

    const userCount = await copyModel(
      () => sourceClient.user.findMany(),
      (rows) => targetClient.user.createMany({ data: rows })
    );

    const quizCount = await copyModel(
      () => sourceClient.quiz.findMany(),
      (rows) => targetClient.quiz.createMany({ data: rows })
    );

    const questionCount = await copyModel(
      () => sourceClient.question.findMany(),
      (rows) => targetClient.question.createMany({ data: rows })
    );

    const quizAttemptCount = await copyModel(
      () => sourceClient.quizAttempt.findMany(),
      (rows) => targetClient.quizAttempt.createMany({ data: rows })
    );

    const purchaseCount = await copyModel(
      () => sourceClient.purchase.findMany(),
      (rows) => targetClient.purchase.createMany({ data: rows })
    );

    const suggestionCount = await copyModel(
      () => sourceClient.suggestion.findMany(),
      (rows) => targetClient.suggestion.createMany({ data: rows })
    );

    await resetIdentity('"User"', 'id');
    await resetIdentity('"Quiz"', 'id');
    await resetIdentity('"Question"', 'id');
    await resetIdentity('"quiz_attempts"', 'attempt_id');
    await resetIdentity('"purchases"', 'purchase_id');
    await resetIdentity('"suggestions"', 'suggestion_id');

    console.log('Data copy complete:', {
      users: userCount,
      quizzes: quizCount,
      questions: questionCount,
      quizAttempts: quizAttemptCount,
      purchases: purchaseCount,
      suggestions: suggestionCount,
    });
  } finally {
    await Promise.allSettled([sourceClient.$disconnect(), targetClient.$disconnect()]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});