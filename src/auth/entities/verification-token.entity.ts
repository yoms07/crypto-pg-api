import { z } from 'zod';

export const verificationTokenSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  email: z.string().email(),
  token: z.string(),
  expiresAt: z.date(),
  isUsed: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export type VerificationToken = z.infer<typeof verificationTokenSchema>;

export interface VerificationTokenStore {
  create(token: Omit<VerificationToken, '_id'>): Promise<VerificationToken>;
  findById(id: string): Promise<VerificationToken | null>;
  findByToken(token: string): Promise<VerificationToken | null>;
  findByUserId(userId: string): Promise<VerificationToken[]>;
  update(
    id: string,
    token: Partial<VerificationToken>,
  ): Promise<VerificationToken | null>;
  markAsUsed(token: string): Promise<VerificationToken | null>;
  delete(id: string): Promise<boolean>;
  deleteByToken(token: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<boolean>;
  deleteExpired(): Promise<number>;
}
