import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// `db` is null when DATABASE_URL is absent (e.g. local dev without env) so
// callers can degrade gracefully instead of crashing at import time.
const url = process.env.DATABASE_URL;
export const db = url ? drizzle(neon(url), { schema }) : null;
export const dbReady = !!url;
export { schema };
