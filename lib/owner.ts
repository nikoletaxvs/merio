/**
 * Merio currently has a single owner per deployment. Every owner-scoped query
 * uses this constant, so supporting multiple owners means replacing it with
 * the signed-in user's id in one place.
 */
export const OWNER_ID = 1;
