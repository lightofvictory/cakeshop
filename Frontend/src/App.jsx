import Navbar from './Components/Navbar/Navbar';
import './App.scss';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Menu from './pages/Menu/Menu';
import Contact from './pages/contact/contact';
import Footer from './pages/footer/Footer';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import OrderPreferenceModal from './Components/OrderPreferenceModal/OrderPreferenceModal';
import AuthModal from './Components/AuthModal/AuthModal';
import Profile from './pages/Auth/Profile';
import { SignIn, SignUp } from './pages/Auth/Auth';
import { OrdersProvider } from './context/OrdersContext';
import Orders from './pages/Orders/Orders';
import MobileBottomNav from './Components/MobileBottomNav/MobileBottomNav';

/* Strict Route Guard: Verified Logged-in Users Only (Except Dine-In Guests) */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const { orderPreference } = useCart();
  const isDineIn = orderPreference?.mode === 'dinein';

  if (!user && !isDineIn) {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <OrderPreferenceModal />
      <AuthModal />
      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/categories" element={<Menu />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Account Routes - Verified Logged-In Users Only */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <OrdersProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </OrdersProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
