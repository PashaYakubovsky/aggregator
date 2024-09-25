import { genSalt, hash as cHash } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  try {
    const salt = await genSalt(saltRounds);
    const hash = await cHash(password, salt);
    console.log('Hashed password:', hash);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}
