import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
    baseURL: "/api/admin",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        if (error.response?.status === 401) {
            // Redirect to login
            window.location.href = "/admin/login";
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const adminLogin = (data) => API.post("/auth/login", data);
export const adminLogout = () => API.get("/auth/logout");
export const getAdminProfile = () => API.get("/auth/profile");
export const updateAdminProfile = (data) => API.put("/auth/profile", data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const adminChangePassword = (data) => API.put("/auth/change-password", data);
export const adminSendOtp = (data) => API.post("/auth/send-otp", data);
export const adminVerifyOtp = (data) => API.post("/auth/verify-otp", data);
export const adminResetPassword = (data) => API.post("/auth/reset-password", data);

// Dashboard APIs
export const getDashboardStats = () => API.get("/dashboard/stats");
export const getRevenueGraph = (period) => API.get(`/dashboard/revenue-graph?period=${period || "monthly"}`);
export const getOrderGraph = () => API.get("/dashboard/order-graph");
export const getUserGrowthChart = () => API.get("/dashboard/user-growth");
export const getRestaurantGrowthChart = () => API.get("/dashboard/restaurant-growth");
export const getTopSellingFoods = () => API.get("/dashboard/top-foods");
export const getTopRestaurants = () => API.get("/dashboard/top-restaurants");
export const getTopCustomers = () => API.get("/dashboard/top-customers");
export const getBestDeliveryBoys = () => API.get("/dashboard/best-delivery-boys");
export const getRecentOrders = () => API.get("/dashboard/recent-orders");
export const getRecentUsers = () => API.get("/dashboard/recent-users");
export const getRecentRestaurants = () => API.get("/dashboard/recent-restaurants");

// User APIs
export const getUsers = (params) => API.get("/users", { params });
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const blockUser = (id) => API.put(`/users/${id}/block`);
export const unblockUser = (id) => API.put(`/users/${id}/unblock`);
export const getUserOrders = (id) => API.get(`/users/${id}/orders`);

// Shop Owner APIs
export const getShopOwners = (params) => API.get("/shop-owners", { params });
export const getShopOwnerById = (id) => API.get(`/shop-owners/${id}`);
export const updateShopOwner = (id, data) => API.put(`/shop-owners/${id}`, data);
export const approveShopOwner = (id) => API.put(`/shop-owners/${id}/approve`);
export const rejectShopOwner = (id) => API.put(`/shop-owners/${id}/reject`);
export const suspendShopOwner = (id) => API.put(`/shop-owners/${id}/suspend`);
export const activateShopOwner = (id) => API.put(`/shop-owners/${id}/activate`);
export const deleteShopOwner = (id) => API.delete(`/shop-owners/${id}`);

// Delivery Boy APIs
export const getDeliveryBoys = (params) => API.get("/delivery-boys", { params });
export const getDeliveryBoyById = (id) => API.get(`/delivery-boys/${id}`);
export const updateDeliveryBoy = (id, data) => API.put(`/delivery-boys/${id}`, data);
export const approveDeliveryBoy = (id) => API.put(`/delivery-boys/${id}/approve`);
export const rejectDeliveryBoy = (id) => API.put(`/delivery-boys/${id}/reject`);
export const suspendDeliveryBoy = (id) => API.put(`/delivery-boys/${id}/suspend`);
export const activateDeliveryBoy = (id) => API.put(`/delivery-boys/${id}/activate`);
export const deleteDeliveryBoy = (id) => API.delete(`/delivery-boys/${id}`);
export const assignDeliveryBoyToOrder = (data) => API.post("/delivery-boys/assign-order", data);
export const removeDeliveryBoyFromOrder = (data) => API.post("/delivery-boys/remove-order", data);

// Restaurant APIs
export const getRestaurants = (params) => API.get("/restaurants", { params });
export const getRestaurantById = (id) => API.get(`/restaurants/${id}`);
export const createRestaurant = (data) => API.post("/restaurants", data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const updateRestaurant = (id, data) => API.put(`/restaurants/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const deleteRestaurant = (id) => API.delete(`/restaurants/${id}`);
export const approveRestaurant = (id) => API.put(`/restaurants/${id}/approve`);
export const rejectRestaurant = (id) => API.put(`/restaurants/${id}/reject`);

// Food APIs
export const getFoods = (params) => API.get("/foods", { params });
export const getFoodById = (id) => API.get(`/foods/${id}`);
export const createFood = (data) => API.post("/foods", data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const updateFood = (id, data) => API.put(`/foods/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const deleteFood = (id) => API.delete(`/foods/${id}`);
export const toggleFoodAvailability = (id) => API.put(`/foods/${id}/toggle-availability`);
export const markPopular = (id) => API.put(`/foods/${id}/mark-popular`);
export const markRecommended = (id) => API.put(`/foods/${id}/mark-recommended`);

// Category APIs
export const getCategories = () => API.get("/categories");
export const createCategory = (data) => API.post("/categories", data);
export const updateCategory = (data) => API.put("/categories", data);
export const deleteCategory = (name) => API.delete(`/categories/${name}`);

// Order APIs
export const getOrders = (params) => API.get("/orders", { params });
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (orderId, shopOrderId, data) => API.put(`/orders/${orderId}/${shopOrderId}/status`, data);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const refundOrder = (id) => API.put(`/orders/${id}/refund`);

// Payment APIs
export const getPayments = (params) => API.get("/payments", { params });
export const getPaymentById = (id) => API.get(`/payments/${id}`);
export const getPaymentSummary = () => API.get("/payments/summary");

// Coupon APIs
export const getCoupons = (params) => API.get("/coupons", { params });
export const getCouponById = (id) => API.get(`/coupons/${id}`);
export const createCoupon = (data) => API.post("/coupons", data);
export const updateCoupon = (id, data) => API.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => API.delete(`/coupons/${id}`);
export const toggleCouponStatus = (id) => API.put(`/coupons/${id}/toggle-status`);

// Review APIs
export const getReviews = (params) => API.get("/reviews", { params });
export const getReviewById = (id) => API.get(`/reviews/${id}`);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
export const hideReview = (id) => API.put(`/reviews/${id}/hide`);
export const showReview = (id) => API.put(`/reviews/${id}/show`);
export const approveReview = (id) => API.put(`/reviews/${id}/approve`);
export const rejectReview = (id) => API.put(`/reviews/${id}/reject`);

// Banner APIs
export const getBanners = (params) => API.get("/banners", { params });
export const getBannerById = (id) => API.get(`/banners/${id}`);
export const createBanner = (data) => API.post("/banners", data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const updateBanner = (id, data) => API.put(`/banners/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const deleteBanner = (id) => API.delete(`/banners/${id}`);
export const toggleBannerStatus = (id) => API.put(`/banners/${id}/toggle-status`);

// Notification APIs
export const getNotifications = (params) => API.get("/notifications", { params });
export const getNotificationById = (id) => API.get(`/notifications/${id}`);
export const sendNotification = (data) => API.post("/notifications/send", data);
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// Report APIs
export const getSalesReport = (params) => API.get("/reports/sales", { params });
export const getUserReport = (params) => API.get("/reports/users", { params });
export const getRestaurantReport = () => API.get("/reports/restaurants");
export const getDeliveryReport = () => API.get("/reports/delivery");
export const getPaymentReport = () => API.get("/reports/payments");

// Analytics APIs
export const getRevenueAnalytics = () => API.get("/analytics/revenue");
export const getOrdersAnalytics = () => API.get("/analytics/orders");
export const getRestaurantAnalytics = () => API.get("/analytics/restaurants");
export const getFoodAnalytics = () => API.get("/analytics/foods");
export const getUserGrowthAnalytics = () => API.get("/analytics/user-growth");
export const getDeliveryPerformance = () => API.get("/analytics/delivery-performance");
export const getPeakOrderingTimes = () => API.get("/analytics/peak-times");
export const getPaymentAnalytics = () => API.get("/analytics/payments");

// Settings APIs
export const getSettings = () => API.get("/settings");
export const updateSettings = (data) => API.put("/settings", data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const updateAdminProfileSettings = (data) => API.put("/settings/profile", data, {
    headers: { "Content-Type": "multipart/form-data" }
});
export const updateAdminPasswordSettings = (data) => API.put("/settings/password", data);

export default API;

