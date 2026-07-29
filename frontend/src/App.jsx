import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header';
import { Footer } from './components/Footer';
import { ProductPage } from './pages/ProductPage';
import { Home, NotFound } from './components/Home';
import { ProductDetail } from './components/ProductDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminRoute from './routes/AdminRoutes';
import PrivateRoute from './routes/PrivateRoute';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import ProductCreatePage from './pages/ProductCreatePage';
import OrderPaymentPage from './pages/OrderPaymentPage';
import StripeSuccessPage from './pages/StripeSuccessPage';
import StripeCancelPage from './pages/StripeCancelPage';
import PaypalSuccessPage from './pages/PaypalSuccessPage';
import PaypalCancelPage from './pages/PaypalCancelPage';
import VnpaySuccessPage from './pages/VnpaySuccessPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<ProductPage />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/payment" element={<OrderPaymentPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/products/new" element={<ProductCreatePage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
          <Route path="/payment/stripe/success" element={<StripeSuccessPage />} />
          <Route path="/payment/stripe/cancel" element={<StripeCancelPage />} />
          <Route path="/payment/paypal/success" element={<PaypalSuccessPage />} />
          <Route path="/payment/paypal/cancel" element={<PaypalCancelPage />} />
          <Route path="/payment/vnpay/success" element={<VnpaySuccessPage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Footer name="Anh Khoa" />
    </>
  )
}

export default App
