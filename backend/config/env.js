import { configDotenv } from 'dotenv';

configDotenv({ path: '.env' });

if (process.env.NODE_ENV !== 'production') {
	configDotenv({ path: '.env.local', override: true });
}