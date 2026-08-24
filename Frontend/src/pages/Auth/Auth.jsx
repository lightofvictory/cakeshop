import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.scss';

export const SignIn = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  if (user) return <Navigate to="/profile" replace />;
  const submit = (event) => { event.preventDefault(); signIn({ email }); navigate('/profile'); };
  return <AuthLayout title="Welcome back" subtitle="Sign in to view your profile and orders."><form onSubmit={submit}><label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" /></label><label>Password<input type="password" required minLength="6" autoComplete="current-password" /></label><button type="submit">Sign in</button></form><p>New to Mr. Pastry? <Link to="/signup">Create an account</Link></p></AuthLayout>;
};

export const SignUp = () => {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  if (user) return <Navigate to="/profile" replace />;
  const submit = (event) => { event.preventDefault(); signUp(formData); navigate('/profile'); };
  return <AuthLayout title="Create an account" subtitle="Save your details for a sweeter checkout."><form onSubmit={submit}><label>Full name<input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required autoComplete="name" /></label><label>Email address<input value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} type="email" required autoComplete="email" /></label><label>Password<input type="password" required minLength="6" autoComplete="new-password" /></label><button type="submit">Create account</button></form><p>Already have an account? <Link to="/signin">Sign in</Link></p></AuthLayout>;
};

const AuthLayout = ({ children, subtitle, title }) => <main className="auth-page"><section><p className="auth-kicker">Mr. Pastry account</p><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</section></main>;
