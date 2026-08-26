import Navbar from './Components/Navbar/Navbar';
import './App.scss';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Menu from './pages/Menu/Menu';
import Contact from './pages/contact/contact';
import Footer from './pages/footer/Fotter';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import OrderPreferenceModal from './Components/OrderPreferenceModal/OrderPreferenceModal';
import Profile from './pages/Auth/Profile';
import { SignIn, SignUp } from './pages/Auth/Auth';
import { OrdersProvider } from './context/OrdersContext';
import ExtraSpecial from './pages/ExtraSpecial/ExtraSpecial';
import Orders from './pages/Orders/Orders';

const App = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <OrdersProvider>
          <CartProvider>
            <Navbar />
            <OrderPreferenceModal />
            <div className="main-wrapper">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/extra-special" element={<ExtraSpecial />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
              </Routes>
            </div>
            <Footer />
          </CartProvider>
        </OrdersProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
