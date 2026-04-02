// server/src/utils/getReference.ts

export function getReference(): string {
  // Generates a unique reference string, e.g., using the current timestamp
  return `${Date.now()}`;
}
