const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ENCODING_LEN = ENCODING.length;

/**
 * Pure Web-standard ULID generator safe for main thread and Web Workers.
 * Does NOT depend on Node.js 'crypto' module.
 * @param {number} seedTime - Epoch timestamp in ms
 * @returns {string} 26-character ULID
 */
export function generateULID(seedTime = Date.now()) {
  let timeStr = '';
  let time = seedTime;

  for (let i = 9; i >= 0; i--) {
    const mod = time % ENCODING_LEN;
    timeStr = ENCODING[mod] + timeStr;
    time = Math.floor(time / ENCODING_LEN);
  }

  const getRandomValues =
    typeof crypto !== 'undefined' && crypto.getRandomValues
      ? (arr) => crypto.getRandomValues(arr)
      : (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        };

  const randBytes = new Uint8Array(10);
  getRandomValues(randBytes);

  let randStr = '';
  for (let i = 0; i < 16; i++) {
    const randIdx = randBytes[i % 10] % ENCODING_LEN;
    randStr += ENCODING[randIdx];
  }

  return timeStr + randStr;
}

export function ulid() {
  return generateULID();
}
