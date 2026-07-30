import express from "express";
import isAdmin from "../middlewares/isAdmin.js";
import { upload } from "../middlewares/multer.js";

// Auth
import {
    adminLogin, adminLogout, getAdminProfile, updateAdminProfile,
    adminChangePassword, adminSendOtp, adminVerifyOtp, adminResetPassword
} from "../controllers/admin.auth.controllers.js";

// Dashboard
import {
    getDashboardStats, getRevenueGraph, getOrderGraph,
    getUserGrowthChart, getRestaurantGrowthChart,
    getTopSellingFoods, getTopRestaurants, getTopCustomers,
    getBestDeliveryBoys, getRecentOrders, getRecentUsers, getRecentRestaurants
} from "../controllers/admin.dashboard.controllers.js";

// User Management
import {
    getAllUsers, getUserById, updateUser, deleteUser,
    blockUser, unblockUser, getUserOrders
} from "../controllers/admin.user.controllers.js";

// Shop Owner Management
import {
    getAllShopOwners, getShopOwnerById, approveShopOwner,
    rejectShopOwner, suspendShopOwner, activateShopOwner,
    deleteShopOwner, updateShopOwner
} from "../controllers/admin.shopOwner.controllers.js";

// Delivery Boy Management
import {
    getAllDeliveryBoys, getDeliveryBoyById, approveDeliveryBoy,
    rejectDeliveryBoy, suspendDeliveryBoy, activateDeliveryBoy,
    deleteDeliveryBoy, updateDeliveryBoy,
    assignDeliveryBoyToOrder, removeDeliveryBoyFromOrder
} from "../controllers/admin.deliveryBoy.controllers.js";

// Restaurant Management
import {
    getAllRestaurants, getRestaurantById, createRestaurant,
    updateRestaurant, deleteRestaurant, approveRestaurant, rejectRestaurant
} from "../controllers/admin.restaurant.controllers.js";

// Food Management
import {
    getAllFoods, getFoodById, createFood, updateFood, deleteFood,
    toggleFoodAvailability, markPopular, markRecommended
} from "../controllers/admin.food.controllers.js";

// Category Management
import {
    getAllCategories, createCategory, updateCategory, deleteCategory
} from "../controllers/admin.category.controllers.js";

// Order Management
import {
    getAllOrders, getOrderById, updateOrderStatusAdmin,
    cancelOrder, refundOrder
} from "../controllers/admin.order.controllers.js";

// Payment Management
import {
    getAllPayments, getPaymentById, getPaymentSummary
} from "../controllers/admin.payment.controllers.js";

// Coupon Management
import {
    getAllCoupons, getCouponById, createCoupon, updateCoupon,
    deleteCoupon, toggleCouponStatus
} from "../controllers/admin.coupon.controllers.js";

// Review Management
import {
    getAllReviews, getReviewById, deleteReview,
    hideReview, showReview, approveReview, rejectReview
} from "../controllers/admin.review.controllers.js";

// Banner Management
import {
    getAllBanners, getBannerById, createBanner, updateBanner,
    deleteBanner, toggleBannerStatus
} from "../controllers/admin.banner.controllers.js";

// Notification Management
import {
    getAllNotifications, getNotificationById,
    sendNotification, deleteNotification
} from "../controllers/admin.notification.controllers.js";

// Reports
import {
    getSalesReport, getUserReport, getRestaurantReport,
    getDeliveryReport, getPaymentReport
} from "../controllers/admin.report.controllers.js";

// Analytics
import {
    getRevenueAnalytics, getOrdersAnalytics, getRestaurantAnalytics,
    getFoodAnalytics, getUserGrowthAnalytics,
    getDeliveryPerformanceAnalytics, getPeakOrderingTimes, getPaymentAnalytics
} from "../controllers/admin.analytics.controllers.js";

// Settings
import {
    getSettings, updateSettings,
    updateAdminProfileSettings, updateAdminPassword
} from "../controllers/admin.settings.controllers.js";

// Seed
import { seedAdmin } from "../controllers/admin.seed.controllers.js";

const adminRouter = express.Router();

// ===== AUTH ROUTES (public) =====
adminRouter.post("/auth/login", adminLogin);
adminRouter.post("/auth/send-otp", adminSendOtp);
adminRouter.post("/auth/verify-otp", adminVerifyOtp);
adminRouter.post("/auth/reset-password", adminResetPassword);

// ===== AUTH ROUTES (protected) =====
adminRouter.get("/auth/logout", isAdmin, adminLogout);
adminRouter.get("/auth/profile", isAdmin, getAdminProfile);
adminRouter.put("/auth/profile", isAdmin, upload.single("profileImage"), updateAdminProfile);
adminRouter.put("/auth/change-password", isAdmin, adminChangePassword);

// ===== DASHBOARD ROUTES =====
adminRouter.get("/dashboard/stats", isAdmin, getDashboardStats);
adminRouter.get("/dashboard/revenue-graph", isAdmin, getRevenueGraph);
adminRouter.get("/dashboard/order-graph", isAdmin, getOrderGraph);
adminRouter.get("/dashboard/user-growth", isAdmin, getUserGrowthChart);
adminRouter.get("/dashboard/restaurant-growth", isAdmin, getRestaurantGrowthChart);
adminRouter.get("/dashboard/top-foods", isAdmin, getTopSellingFoods);
adminRouter.get("/dashboard/top-restaurants", isAdmin, getTopRestaurants);
adminRouter.get("/dashboard/top-customers", isAdmin, getTopCustomers);
adminRouter.get("/dashboard/best-delivery-boys", isAdmin, getBestDeliveryBoys);
adminRouter.get("/dashboard/recent-orders", isAdmin, getRecentOrders);
adminRouter.get("/dashboard/recent-users", isAdmin, getRecentUsers);
adminRouter.get("/dashboard/recent-restaurants", isAdmin, getRecentRestaurants);

// ===== USER ROUTES =====
adminRouter.get("/users", isAdmin, getAllUsers);
adminRouter.get("/users/:userId", isAdmin, getUserById);
adminRouter.put("/users/:userId", isAdmin, updateUser);
adminRouter.delete("/users/:userId", isAdmin, deleteUser);
adminRouter.put("/users/:userId/block", isAdmin, blockUser);
adminRouter.put("/users/:userId/unblock", isAdmin, unblockUser);
adminRouter.get("/users/:userId/orders", isAdmin, getUserOrders);

// ===== SHOP OWNER ROUTES =====
adminRouter.get("/shop-owners", isAdmin, getAllShopOwners);
adminRouter.get("/shop-owners/:ownerId", isAdmin, getShopOwnerById);
adminRouter.put("/shop-owners/:ownerId", isAdmin, updateShopOwner);
adminRouter.put("/shop-owners/:ownerId/approve", isAdmin, approveShopOwner);
adminRouter.put("/shop-owners/:ownerId/reject", isAdmin, rejectShopOwner);
adminRouter.put("/shop-owners/:ownerId/suspend", isAdmin, suspendShopOwner);
adminRouter.put("/shop-owners/:ownerId/activate", isAdmin, activateShopOwner);
adminRouter.delete("/shop-owners/:ownerId", isAdmin, deleteShopOwner);

// ===== DELIVERY BOY ROUTES =====
adminRouter.get("/delivery-boys", isAdmin, getAllDeliveryBoys);
adminRouter.get("/delivery-boys/:deliveryBoyId", isAdmin, getDeliveryBoyById);
adminRouter.put("/delivery-boys/:deliveryBoyId", isAdmin, updateDeliveryBoy);
adminRouter.put("/delivery-boys/:deliveryBoyId/approve", isAdmin, approveDeliveryBoy);
adminRouter.put("/delivery-boys/:deliveryBoyId/reject", isAdmin, rejectDeliveryBoy);
adminRouter.put("/delivery-boys/:deliveryBoyId/suspend", isAdmin, suspendDeliveryBoy);
adminRouter.put("/delivery-boys/:deliveryBoyId/activate", isAdmin, activateDeliveryBoy);
adminRouter.delete("/delivery-boys/:deliveryBoyId", isAdmin, deleteDeliveryBoy);
adminRouter.post("/delivery-boys/assign-order", isAdmin, assignDeliveryBoyToOrder);
adminRouter.post("/delivery-boys/remove-order", isAdmin, removeDeliveryBoyFromOrder);

// ===== RESTAURANT ROUTES =====
adminRouter.get("/restaurants", isAdmin, getAllRestaurants);
adminRouter.get("/restaurants/:restaurantId", isAdmin, getRestaurantById);
adminRouter.post("/restaurants", isAdmin, upload.single("image"), createRestaurant);
adminRouter.put("/restaurants/:restaurantId", isAdmin, upload.single("image"), updateRestaurant);
adminRouter.delete("/restaurants/:restaurantId", isAdmin, deleteRestaurant);
adminRouter.put("/restaurants/:restaurantId/approve", isAdmin, approveRestaurant);
adminRouter.put("/restaurants/:restaurantId/reject", isAdmin, rejectRestaurant);

// ===== FOOD ROUTES =====
adminRouter.get("/foods", isAdmin, getAllFoods);
adminRouter.get("/foods/:foodId", isAdmin, getFoodById);
adminRouter.post("/foods", isAdmin, upload.single("image"), createFood);
adminRouter.put("/foods/:foodId", isAdmin, upload.single("image"), updateFood);
adminRouter.delete("/foods/:foodId", isAdmin, deleteFood);
adminRouter.put("/foods/:foodId/toggle-availability", isAdmin, toggleFoodAvailability);
adminRouter.put("/foods/:foodId/mark-popular", isAdmin, markPopular);
adminRouter.put("/foods/:foodId/mark-recommended", isAdmin, markRecommended);

// ===== CATEGORY ROUTES =====
adminRouter.get("/categories", isAdmin, getAllCategories);
adminRouter.post("/categories", isAdmin, createCategory);
adminRouter.put("/categories", isAdmin, updateCategory);
adminRouter.delete("/categories/:name", isAdmin, deleteCategory);

// ===== ORDER ROUTES =====
adminRouter.get("/orders", isAdmin, getAllOrders);
adminRouter.get("/orders/:orderId", isAdmin, getOrderById);
adminRouter.put("/orders/:orderId/:shopOrderId/status", isAdmin, updateOrderStatusAdmin);
adminRouter.put("/orders/:orderId/cancel", isAdmin, cancelOrder);
adminRouter.put("/orders/:orderId/refund", isAdmin, refundOrder);

// ===== PAYMENT ROUTES =====
adminRouter.get("/payments", isAdmin, getAllPayments);
adminRouter.get("/payments/summary", isAdmin, getPaymentSummary);
adminRouter.get("/payments/:paymentId", isAdmin, getPaymentById);

// ===== COUPON ROUTES =====
adminRouter.get("/coupons", isAdmin, getAllCoupons);
adminRouter.get("/coupons/:couponId", isAdmin, getCouponById);
adminRouter.post("/coupons", isAdmin, createCoupon);
adminRouter.put("/coupons/:couponId", isAdmin, updateCoupon);
adminRouter.delete("/coupons/:couponId", isAdmin, deleteCoupon);
adminRouter.put("/coupons/:couponId/toggle-status", isAdmin, toggleCouponStatus);

// ===== REVIEW ROUTES =====
adminRouter.get("/reviews", isAdmin, getAllReviews);
adminRouter.get("/reviews/:reviewId", isAdmin, getReviewById);
adminRouter.delete("/reviews/:reviewId", isAdmin, deleteReview);
adminRouter.put("/reviews/:reviewId/hide", isAdmin, hideReview);
adminRouter.put("/reviews/:reviewId/show", isAdmin, showReview);
adminRouter.put("/reviews/:reviewId/approve", isAdmin, approveReview);
adminRouter.put("/reviews/:reviewId/reject", isAdmin, rejectReview);

// ===== BANNER ROUTES =====
adminRouter.get("/banners", isAdmin, getAllBanners);
adminRouter.get("/banners/:bannerId", isAdmin, getBannerById);
adminRouter.post("/banners", isAdmin, upload.single("image"), createBanner);
adminRouter.put("/banners/:bannerId", isAdmin, upload.single("image"), updateBanner);
adminRouter.delete("/banners/:bannerId", isAdmin, deleteBanner);
adminRouter.put("/banners/:bannerId/toggle-status", isAdmin, toggleBannerStatus);

// ===== NOTIFICATION ROUTES =====
adminRouter.get("/notifications", isAdmin, getAllNotifications);
adminRouter.get("/notifications/:notificationId", isAdmin, getNotificationById);
adminRouter.post("/notifications/send", isAdmin, sendNotification);
adminRouter.delete("/notifications/:notificationId", isAdmin, deleteNotification);

// ===== REPORT ROUTES =====
adminRouter.get("/reports/sales", isAdmin, getSalesReport);
adminRouter.get("/reports/users", isAdmin, getUserReport);
adminRouter.get("/reports/restaurants", isAdmin, getRestaurantReport);
adminRouter.get("/reports/delivery", isAdmin, getDeliveryReport);
adminRouter.get("/reports/payments", isAdmin, getPaymentReport);

// ===== ANALYTICS ROUTES =====
adminRouter.get("/analytics/revenue", isAdmin, getRevenueAnalytics);
adminRouter.get("/analytics/orders", isAdmin, getOrdersAnalytics);
adminRouter.get("/analytics/restaurants", isAdmin, getRestaurantAnalytics);
adminRouter.get("/analytics/foods", isAdmin, getFoodAnalytics);
adminRouter.get("/analytics/user-growth", isAdmin, getUserGrowthAnalytics);
adminRouter.get("/analytics/delivery-performance", isAdmin, getDeliveryPerformanceAnalytics);
adminRouter.get("/analytics/peak-times", isAdmin, getPeakOrderingTimes);
adminRouter.get("/analytics/payments", isAdmin, getPaymentAnalytics);

// ===== SETTINGS ROUTES =====
adminRouter.get("/settings", isAdmin, getSettings);
adminRouter.put("/settings", isAdmin, upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 }
]), updateSettings);
adminRouter.put("/settings/profile", isAdmin, upload.single("profileImage"), updateAdminProfileSettings);
adminRouter.put("/settings/password", isAdmin, updateAdminPassword);

// ===== SEED ROUTE (public - create default admin) =====
adminRouter.get("/seed", seedAdmin);

export default adminRouter;

