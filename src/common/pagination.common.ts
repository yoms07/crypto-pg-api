import { z } from 'zod';

export interface PaginationMetadata {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
}

export const paginationSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
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
