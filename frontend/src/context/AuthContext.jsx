import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getMyProfile, loginUser, registerUser, updateMyProfile } from "../services/authService";
import { uploadAvatar as uploadAvatarService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getMyProfile();
      setUser(profile);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const register = useCallback(async (payload) => {
    const createdUser = await registerUser(payload);
    return createdUser;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const updated = await uploadAvatarService(file);
    setUser(updated);
    return updated;
  }, []);

  const login = useCallback(async (payload) => {
    const data = await loginUser(payload);
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    return data;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updatedUser = await updateMyProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      uploadAvatar,
      updateProfile,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, uploadAvatar, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
