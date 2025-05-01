import Database from "@replit/database";
const db = new Database();

export { db };

export async function read(key) {
  const result = await db.get(key);
  return (result && result.value) || [];
}