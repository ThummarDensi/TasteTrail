import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAdminData, clearAdminData } from "./redux/adminSlice";
import { getAdminProfile } from "./api";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import ShopOwners from "./pages/ShopOwners";
import DeliveryBoys from "./pages/DeliveryBoys";
import Restaurants from "./pages/Restaurants";
import Foods from "./pages/Foods";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Coupons from "./pages/Coupons";
import Reviews from "./pages/Reviews";
import Banners from "./pages/Banners";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function App() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector(state => state.admin);
    const authCheckRef = useRef(false);

    useEffect(() => {
        // Skip auth check on login and forgot-password pages to prevent redirect loops
        if (location.pathname === "/admin/login" || location.pathname === "/admin/forgot-password") {
            return;
        }
        
        // Prevent duplicate calls in StrictMode
        if (authCheckRef.current) return;
        authCheckRef.current = true;

        const checkAuth = async () => {
            try {
                const { data } = await getAdminProfile();
                if (data) {
                    dispatch(setAdminData(data));
                }
            } catch (error) {
                dispatch(clearAdminData());
                if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
                    navigate("/admin/login");
                }
            }
        };
        checkAuth();
    }, [location.pathname]);

    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/admin/login" element={
                isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
            } />
            <Route path="/admin/forgot-password" element={
                isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <ForgotPassword />
            } />

            {/* Protected Routes with Layout */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="shop-owners" element={<ShopOwners />} />
                <Route path="delivery-boys" element={<DeliveryBoys />} />
                <Route path="restaurants" element={<Restaurants />} />
                <Route path="foods" element={<Foods />} />
                <Route path="categories" element={<Categories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="payments" element={<Payments />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="banners" element={<Banners />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
    );
}

export default App;
