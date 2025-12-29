// Re-export all API functions
export * from './client';
export { register } from './auth';
export type { RegisterData } from './auth';
export {
  getCurrentUser,
  updateProfile,
  getUserStats,
  getUserProfile,
} from './users';
export type {
  User,
  UserStats,
  UserPublic,
  UpdateProfileData,
} from './users';
export * from './games';
export * from './friends';
export * from './shop';
export * from './leaderboard';
