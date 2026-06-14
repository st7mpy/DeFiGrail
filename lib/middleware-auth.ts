// Pure check for HTTP Basic admin auth — unit-tested independently of middleware.
export function isAuthorized(authHeader: string | null, password: string | undefined): boolean {
  if (!password) return false; // never allow access when no password is configured
  if (!authHeader) return false;
  const expected = "Basic " + Buffer.from("admin:" + password).toString("base64");
  return authHeader === expected;
}
