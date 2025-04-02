export function formatUUID(uuid: string): string {
  if (uuid.length !== 32) {
    throw new Error('Invalid UUID string. Expected 32 characters.');
  }

  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
}

export function generateUUID(): string {
  return formatUUID(crypto.randomUUID().replace(/-/g, ''));
}
