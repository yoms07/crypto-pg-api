import { Injectable } from '@nestjs/common';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

@Injectable()
export class ApiResponseBuilder {
  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return {
      status: 200,
      message,
      data,
    };
  }

  static successWithPagination<T>(
    data: T,
    pagination: PaginationMeta,
    message = 'Success',
  ): ApiResponse<T> {
    return {
      status: 200,
      message,
      data,
      pagination,
    };
  }

  static error(message: string, status = 400): ApiResponse<null> {
    return {
      status,
      message,
      data: null,
    };
  }
}
