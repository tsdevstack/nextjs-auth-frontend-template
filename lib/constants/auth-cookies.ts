/**
 * The address of a login whose email isn't confirmed yet, for the
 * /confirm-email page (set by the login route)
 */
export const PENDING_EMAIL_COOKIE = "pending-email";

/** How long the page keeps the address: one day, in seconds */
export const PENDING_EMAIL_MAX_AGE = 24 * 60 * 60;
