import { ulid } from 'ulid';

/**
 * Generates a timestamp-sortable 26-character ULID.
 * @returns {string} ULID primary key string.
 */
export function generateULID() {
  return ulid();
}
