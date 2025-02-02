/**
 * Define type for the stored data structure
 */
export type StoredData<T = unknown> = {
  key: string;
  value: T;
  created_at: string;
  updated_at: string;
};

/**
 * Type for the POST request payload
 */
export type StoreRequest<T> = {
  key: string;
  value: T;
};

/**
 * Type for the successful response
 */
export type SuccessResponse<T> = {
  success: true;
  data: StoredData<T>;
};

/**
 * Type for error response
 */
export type ErrorResponse = {
  success: false;
  error: string;
};
