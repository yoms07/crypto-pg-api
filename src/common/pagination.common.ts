import { z } from 'zod';

export interface PaginationMetadata {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
}

export const paginationSchema = z.object({
  page: z
    .string()
    .or(z.number())
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Page must be a positive integer',
    })
    .default(1),
  limit: z
    .string()
    .or(z.number())
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Limit must be a positive integer',
    })
    .default(1),
});
export type PaginationQuery = z.infer<typeof paginationSchema>;

export const toPaginationMetadata = (
  query: PaginationQuery,
): PaginationMetadata => {
  const { page, limit } = query;
  return {
    itemCount: 0,
    itemsPerPage: limit,
    currentPage: page,
  };
};
