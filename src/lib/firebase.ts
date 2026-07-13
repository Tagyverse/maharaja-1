import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { brand } from '../config/brand';

const app = initializeApp(brand.firebase);

export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
