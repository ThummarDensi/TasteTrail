import { useState, useEffect } from "react";
import { getRevenueAnalytics, getOrdersAnalytics, getRestaurantAnalytics, getFoodAnalytics, getUserGrowthAnalytics, getDeliveryPerformance, getPeakOrderingTimes, getPaymentAnalytics } from "../api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#f97316", "#ef4444", "#8b5cf6", "#22c55e", "#3b82f6", "#eab308", "#ec4899", "#14b8a6"];

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [restaurantData, setRestaurantData] = useState([]);
    const [foodData, setFoodData] = useState(null);
    const [userGrowth, setUserGrowth] = useState([]);
    const [deliveryPerf, setDeliveryPerf] = useState(null);
    const [peakTimes, setPeakTimes] = useState([]);
    const [paymentData, setPaymentData] = useState([]);

    useEffect(() => {
        fetchAllAnalytics();
    }, []);

    const fetchAllAnalytics = async () => {
        try {
            const [rev, ord, rest, food, growth, perf, peak, pay] = await Promise.all([
                getRevenueAnalytics(), getOrdersAnalytics(), getRestaurantAnalytics(),
                getFoodAnalytics(), getUserGrowthAnalytics(), getDeliveryPerformance(),
                getPeakOrderingTimes(), getPaymentAnalytics()
            ]);
            setRevenueData(rev.data || []);
            setOrdersData(ord.data || []);
            setRestaurantData(rest.data || []);
            setFoodData(food.data || null);
            setUserGrowth(growth.data || []);
            setDeliveryPerf(perf.data || null);
            setPeakTimes(peak.data || []);
            setPaymentData(pay.data || []);
        } catch (error) {
            console.error("Analytics fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSkeleton count={6} type="chart" />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-sm text-gray-500">Comprehensive platform analytics and insights</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Analytics */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Analytics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders Analytics */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Orders Analytics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={ordersData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
                            <Line type="monotone" dataKey="cod" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                            <Line type="monotone" dataKey="online" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Restaurant Analytics */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Restaurants</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={restaurantData.slice(0, 10)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#6b7280" width={100} />
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Bar dataKey="totalOrders" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Food Category Distribution */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Food Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={foodData?.categoryDistribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                                {foodData?.categoryDistribution?.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* User Growth */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                            <Line type="monotone" dataKey="owners" stroke="#22c55e" strokeWidth={2} name="Owners" />
                            <Line type="monotone" dataKey="deliveryBoys" stroke="#8b5cf6" strokeWidth={2} name="Delivery Boys" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Peak Ordering Times */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Peak Ordering Times</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={peakTimes}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis dataKey="_id" tick={{ fontSize: 12 }} stroke="#6b7280" domain={[0, 23]} label={{ value: "Hour of Day", position: "bottom" }} />
                            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payment Analytics */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Analytics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={paymentData} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                                {paymentData?.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Delivery Performance */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                            <p className="text-xs text-blue-600">Avg Delivery Time</p>
                            <p className="text-2xl font-bold text-blue-700">{deliveryPerf?.averageDeliveryMinutes || 0} min</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                            <p className="text-xs text-green-600">Total Delivered</p>
                            <p className="text-2xl font-bold text-green-700">{deliveryPerf?.totalDelivered || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

