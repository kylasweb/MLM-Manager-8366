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
  tagTypes: ['User', 'Investment', 'Pool', 'Wallet', 'Transaction', 'Network', 'Referral', 'AdminReferral'],
  endpoints: (builder) => ({
    // Admin Referral Management
    getAdminReferralStats: builder.query({
      query: () => '/admin/referrals/stats',
      providesTags: ['AdminReferral'],
    }),
    updateReferralSettings: builder.mutation({
      query: (data) => ({
        url: '/admin/referrals/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AdminReferral'],
    }),
    assignSponsor: builder.mutation({
      query: ({ userId, sponsorId }) => ({
        url: '/admin/referrals/assign-sponsor',
        method: 'POST',
        body: { userId, sponsorId },
      }),
      invalidatesTags: ['AdminReferral', 'Network'],
    }),
    generateSponsorId: builder.mutation({
      query: (userId) => ({
        url: '/admin/referrals/generate-sponsor-id',
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['AdminReferral', 'User'],
    }),
    updateBusinessVolume: builder.mutation({
      query: ({ userId, type, amount }) => ({
        url: '/admin/referrals/business-volume',
        method: 'POST',
        body: { userId, type, amount },
      }),
      invalidatesTags: ['AdminReferral', 'Network'],
    }),
    getBusinessVolumeHistory: builder.query({
      query: (userId) => `/admin/referrals/business-volume/${userId}`,
      providesTags: ['AdminReferral'],
    }),

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
        body: {
          ...userData,
          sponsorId: userData.sponsorId || null, // Make sponsor ID optional during registration
        },
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

    // Referral endpoints
    getReferralStats: builder.query({
      query: () => '/referrals/stats',
      providesTags: ['Referral'],
    }),
    getReferralHistory: builder.query({
      query: (params) => ({
        url: '/referrals/history',
        params,
      }),
      providesTags: ['Referral'],
    }),
    getReferralLink: builder.query({
      query: () => '/referrals/link',
      providesTags: ['Referral'],
    }),
    createReferral: builder.mutation({
      query: (data) => ({
        url: '/referrals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Referral', 'Network', 'Wallet'],
    }),
    validateReferralCode: builder.query({
      query: (code) => `/referrals/validate/${code}`,
    }),
    getReferralCommissions: builder.query({
      query: () => '/referrals/commissions',
      providesTags: ['Referral'],
    }),

    // Network endpoints
    getNetwork: builder.query({
      query: () => '/network/tree',
      providesTags: ['Network'],
    }),
    getNetworkMatrix: builder.query({
      query: () => '/network/matrix',
      providesTags: ['Network'],
    }),
    getNetworkStats: builder.query({
      query: () => '/network/stats',
      providesTags: ['Network'],
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
      invalidatesTags: ['Investment', 'Wallet', 'Network'],
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
      invalidatesTags: ['Pool', 'Investment', 'Network'],
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
  useGetAdminReferralStatsQuery,
  useUpdateReferralSettingsMutation,
  useAssignSponsorMutation,
  useGenerateSponsorIdMutation,
  useUpdateBusinessVolumeMutation,
  useGetBusinessVolumeHistoryQuery,
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetReferralStatsQuery,
  useGetReferralHistoryQuery,
  useGetReferralLinkQuery,
  useCreateReferralMutation,
  useValidateReferralCodeQuery,
  useGetReferralCommissionsQuery,
  useGetNetworkQuery,
  useGetNetworkMatrixQuery,
  useGetNetworkStatsQuery,
  useGetInvestmentsQuery,
  useCreateInvestmentMutation,
  useGetPoolsQuery,
  useJoinPoolMutation,
  useGetWalletBalanceQuery,
  useGetTransactionsQuery,
  useRequestWithdrawalMutation,
} = api; 