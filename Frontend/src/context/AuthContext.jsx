/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mr-pastry-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('mr-pastry-user', JSON.stringify(user));
    else localStorage.removeItem('mr-pastry-user');
  }, [user]);

  const signUp = ({ name, email }) => setUser({ name, email });
  const signIn = ({ email }) => setUser((currentUser) => currentUser?.email === email ? currentUser : { name: email.split('@')[0], email });
  const signOut = () => setUser(null);
  const value = useMemo(() => ({ user, signIn, signOut, signUp }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used within AuthProvider');
  return auth;
};
