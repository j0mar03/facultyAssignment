import { useAppSelector } from './redux';

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
  };
};