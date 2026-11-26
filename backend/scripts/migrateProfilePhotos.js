// Moves profile photos saved as base64 data URLs into Cloudinary and stores
// the resulting https URL instead. The website used to save photos this way.
//
// Usage (dry run is the default and writes nothing):
//   node --env-file=.env scripts/migrateProfilePhotos.js
//   node --env-file=.env scripts/migrateProfilePhotos.js --apply --yes
// --yes is required with --apply when the database host is not localhost.
import { pathToFileURL } from 'node:url';

const parseArgs = (argv) => {
  const args = {};
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value ?? true;
  }
  return args;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Example: node --env-file=.env scripts/migrateProfilePhotos.js');
    process.exit(1);
  }

  const host = new URL(url).hostname;
  const isLocal = ['127.0.0.1', 'localhost', '::1'].includes(host);
  console.log(`Database host: ${host}`);
  if (args.apply && !isLocal && !args.yes) {
    console.error('Refusing to write to a non-local database without --yes.');
    process.exit(1);
  }

  const { PrismaClient } = await import('@prisma/client');
  const { uploadAvatar } = await import('../utils/cloudinary.js');
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      where: { profilePhoto: { startsWith: 'data:' } },
      select: { id: true, email: true },
    });
    console.log(`${users.length} users have a data URL photo`);
    if (!args.apply) {
      console.log('Dry run: nothing was written. Add --apply to upload them.');
      return;
    }

    let moved = 0;
    for (const { id, email } of users) {
      const { profilePhoto } = await prisma.user.findUnique({ where: { id }, select: { profilePhoto: true } });
      try {
        const photoUrl = await uploadAvatar(profilePhoto, id);
        await prisma.user.update({ where: { id }, data: { profilePhoto: photoUrl } });
        moved++;
      } catch (error) {
        // Unreadable images are cleared so clients fall back to initials.
        console.warn(`User ${id} (${email}): ${error.message}; clearing photo`);
        await prisma.user.update({ where: { id }, data: { profilePhoto: null } });
      }
    }
    console.log(`Moved ${moved} of ${users.length} photos to Cloudinary.`);
  } finally {
    await prisma.$disconnect();
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
