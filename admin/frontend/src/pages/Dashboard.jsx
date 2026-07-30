import { useState, useEffect } from "react";
import {
    getDashboardStats, getRecentOrders, getRecentUsers,
    getTopSellingFoods, getTopRestaurants, getTopCustomers, getBestDeliveryBoys
} from "../api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCube, HiOutlineClipboardCheck, HiOutlineTruck, HiOutlineCash, HiOutlineTrendingUp, HiOutlineStar, HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [topFoods, setTopFoods] = useState([]);
    const [topRestaurants, setTopRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, ordersRes, usersRes, foodsRes, restaurantsRes] = await Promise.all([
                getDashboardStats(),
                getRecentOrders(),
                getRecentUsers(),
                getTopSellingFoods(),
                getTopRestaurants()
            ]);
            setStats(statsRes.data);
            setRecentOrders(ordersRes.data);
            setRecentUsers(usersRes.data);
            setTopFoods(foodsRes.data);
            setTopRestaurants(restaurantsRes.data);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: "bg-blue-500", link: "/admin/users" },
        { label: "Restaurants", value: stats?.totalRestaurants || 0, icon: HiOutlineShoppingBag, color: "bg-green-500", link: "/admin/restaurants" },
        { label: "Total Foods", value: stats?.totalFoods || 0, icon: HiOutlineCube, color: "bg-purple-500", link: "/admin/foods" },
        { label: "Total Orders", value: stats?.totalOrders || 0, icon: HiOutlineClipboardCheck, color: "bg-orange-500", link: "/admin/orders" },
        { label: "Delivered", value: stats?.deliveredOrders || 0, icon: HiOutlineTruck, color: "bg-teal-500", link: "/admin/orders" },
        { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: HiOutlineCash, color: "bg-amber-500", link: "/admin/analytics" },
        { label: "Today's Orders", value: stats?.todayOrders || 0, icon: HiOutlineTrendingUp, color: "bg-rose-500", link: "/admin/orders" },
        { label: "Pending", value: stats?.pendingOrders || 0, icon: HiOutlineExclamationCircle, color: "bg-yellow-500", link: "/admin/orders" },
    ];

    if (loading) return <LoadingSkeleton count={8} />;

    const getStatusBadge = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
            ready: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
            "out of delivery": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
            delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of your food delivery platform</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <Link key={i} to={card.link}
                        className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${card.color} bg-opacity-10`}>
                                <card.icon className={`w-5 h-5 ${card.color.replace("bg-", "text-")}`} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.color.replace("bg-", "bg-").replace("500", "100")} ${card.color.replace("bg-", "text-").replace("500", "700")}`}>
                                {card.label.split(' ')[0]}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
                        <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                    </Link>
                ))}
            </div>

            {/* Revenue & Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-xs text-gray-500">Today</p>
                            <p className="text-lg font-bold text-green-600">₹{(stats?.todayRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-xs text-gray-500">Weekly</p>
                            <p className="text-lg font-bold text-blue-600">₹{(stats?.weeklyRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <p className="text-xs text-gray-500">Monthly</p>
                            <p className="text-lg font-bold text-purple-600">₹{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                            <span className="font-semibold text-yellow-600">{stats?.pendingOrders || 0}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Preparing</span>
                            <span className="font-semibold text-purple-600">{stats?.preparingOrders || 0}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Out for Delivery</span>
                            <span className="font-semibold text-orange-600">{stats?.outForDeliveryOrders || 0}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
                            <span className="font-semibold text-green-600">{stats?.deliveredOrders || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600">View All</Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentOrders.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {order.user?.fullName || "Unknown"}
                                    </p>
                                    <p className="text-xs text-gray-500">₹{order.totalAmount?.toFixed(2)}</p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(order.shopOrders?.[0]?.status)}`}>
                                    {order.shopOrders?.[0]?.status || "pending"}
                                </span>
                            </div>
                        ))}
                        {recentOrders.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No recent orders</p>
                        )}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Users</h3>
                        <Link to="/admin/users" className="text-sm text-orange-500 hover:text-orange-600">View All</Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentUsers.slice(0, 5).map((user) => (
                            <div key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                    {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    user.role === "user" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                    user.role === "owner" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No recent users</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Foods */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Top Selling Foods</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {topFoods.slice(0, 5).map((food, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{food.name}</p>
                                    <p className="text-xs text-gray-500">{food.totalSold} sold</p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">₹{food.totalRevenue?.toFixed(0)}</span>
                            </div>
                        ))}
                        {topFoods.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No data available</p>
                        )}
                    </div>
                </div>

                {/* Top Restaurants */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Top Restaurants</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {topRestaurants.slice(0, 5).map((rest, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{rest._id?.name || "Restaurant"}</p>
                                    <p className="text-xs text-gray-500">{rest.totalOrders} orders</p>
                                </div>
                                <span className="text-sm font-semibold text-green-600">₹{(rest.totalRevenue || 0).toFixed(0)}</span>
                            </div>
                        ))}
                        {topRestaurants.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

