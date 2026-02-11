import {
  QueryKey,
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@shared/api";

export type ApiError = AxiosError<ApiErrorResponse>;

export interface UseApiQueryOptions<TData>
  extends Omit<
    UseQueryOptions<TData, ApiError, TData, QueryKey>,
    "queryKey" | "queryFn"
  > {
  key: QueryKey;
  fn: () => Promise<TData>;
}

export interface UseApiMutationOptions<TData, TVariables>
  extends Omit<
    UseMutationOptions<TData, ApiError, TVariables, unknown>,
    "mutationFn"
  > {
  fn: (variables: TVariables) => Promise<TData>;
}

export const useApiQuery = <TData,>({
  key,
  fn,
  ...options
}: UseApiQueryOptions<TData>) =>
  useQuery<TData, ApiError>({
    queryKey: key,
    queryFn: fn,
    retry: 1,
    staleTime: 1000 * 30,
    ...options,
  });

export const useApiMutation = <TData, TVariables = void>({
  fn,
  ...options
}: UseApiMutationOptions<TData, TVariables>) =>
  useMutation<TData, ApiError, TVariables>({
    mutationFn: fn,
    ...options,
  });

export const extractApiError = (error?: ApiError | null) => {
  if (!error) return "Something went wrong. Please try again.";
  return (
    error.response?.data?.error ??
    error.response?.data?.message ??
    error.message ??
    "Unable to complete the request."
  );
};