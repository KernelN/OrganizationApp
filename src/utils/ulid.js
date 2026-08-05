import { ulid as generateUlid } from 'ulid';

/**
 * Generate a timestamp-sortable, 26-character URL-safe unique identifier.
 * @returns {string} ULID string
 */
export function ulid() {
  return generateUlid();
}
