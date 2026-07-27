import { getToken } from './token';
import { getUserInfo } from './userInfo';

export function useAuth() {
  const token = getToken();
  const user = getUserInfo();

  return {
    isAuthenticated: Boolean(token),
    role: user?.role || 'customer',
    user,
  };
}
