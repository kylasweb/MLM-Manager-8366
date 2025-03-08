import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../config/constants';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Investment', 'Pool', 'Wallet', 'Transaction'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // User endpoints
    getProfile: builder.query({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/user/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Investment endpoints
    getInvestments: builder.query({
      query: () => '/investments',
      providesTags: ['Investment'],
    }),
    createInvestment: builder.mutation({
      query: (data) => ({
        url: '/investments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Investment', 'Wallet'],
    }),

    // Pool endpoints
    getPools: builder.query({
      query: () => '/pools',
      providesTags: ['Pool'],
    }),
    joinPool: builder.mutation({
      query: (poolId) => ({
        url: `/pools/${poolId}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Pool', 'Investment'],
    }),

    // Wallet endpoints
    getWalletBalance: builder.query({
      query: () => '/wallet/balance',
      providesTags: ['Wallet'],
    }),
    getTransactions: builder.query({
      query: (params) => ({
        url: '/wallet/transactions',
        params,
      }),
      providesTags: ['Transaction'],
    }),
    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wallet', 'Transaction'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetInvestmentsQuery,
  useCreateInvestmentMutation,
  useGetPoolsQuery,
  useJoinPoolMutation,
  useGetWalletBalanceQuery,
  useGetTransactionsQuery,
  useRequestWithdrawalMutation,
} = api; 