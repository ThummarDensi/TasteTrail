import { useState } from "react";
import { getSalesReport, getUserReport, getRestaurantReport, getDeliveryReport, getPaymentReport } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineDocumentDownload } from "react-icons/hi";

const Reports = () => {
    const [activeTab, setActiveTab] = useState("sales");
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [period, setPeriod] = useState("daily");
    const [userPeriod, setUserPeriod] = useState("all");

    const fetchReport = async (type) => {
        setLoading(true);
        try {
            let data;
            if (type === "sales") {
                const res = await getSalesReport({ period });
                data = res.data;
            } else if (type === "users") {
                const res = await getUserReport({ period: userPeriod });
                data = res.data;
            } else if (type === "restaurants") {
                const res = await getRestaurantReport();
                data = res.data;
            } else if (type === "delivery") {
                const res = await getDeliveryReport();
                data = res.data;
            } else if (type === "payments") {
                const res = await getPaymentReport();
                data = res.data;
            }
            setReportData(data);
        } catch (error) {
            toast.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!reportData) return;
        let csv = "";
        if (activeTab === "sales" && reportData.orders) {
            csv = "Order ID,Customer,Amount,Payment,Date\n";
            reportData.orders.forEach(o => {
                csv += `${o._id},${o.user?.fullName},${o.totalAmount},${o.paymentMethod},${new Date(o.createdAt).toLocaleDateString()}\n`;
            });
        }
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeTab}_report.csv`;
        a.click();
        toast.success("Report exported");
    };

    const tabs = [
        { id: "sales", label: "Sales" },
        { id: "users", label: "Users" },
        { id: "restaurants", label: "Restaurants" },
        { id: "delivery", label: "Delivery" },
        { id: "payments", label: "Payments" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
                    <p className="text-sm text-gray-500">Generate and export reports</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setReportData(null); }}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                {activeTab === "sales" && (
                    <>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)}
                            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                            <option value="daily">Daily</option><option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
                        </select>
                    </>
                )}
                {activeTab === "users" && (
                    <select value={userPeriod} onChange={(e) => setUserPeriod(e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                        <option value="all">All Time</option><option value="today">Today</option>
                        <option value="week">This Week</option><option value="month">This Month</option>
                    </select>
                )}
                <button onClick={() => fetchReport(activeTab)}
                    className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
                    Generate Report
                </button>
                {reportData && (
                    <button onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        <HiOutlineDocumentDownload className="w-4 h-4" /> Export CSV
                    </button>
                )}
            </div>

            {/* Report Content */}
            {loading ? <LoadingSkeleton count={5} />
            : !reportData ? (
                <div className="text-center py-16 text-gray-400">Select a report type and click "Generate Report"</div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    {activeTab === "sales" && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Total Orders</p><p className="text-xl font-bold">{reportData.totalOrders}</p></div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Revenue</p><p className="text-xl font-bold text-green-600">₹{reportData.totalRevenue?.toLocaleString()}</p></div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Avg Order Value</p><p className="text-xl font-bold">₹{reportData.averageOrderValue}</p></div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">COD / Online</p><p className="text-xl font-bold">{reportData.codOrders} / {reportData.onlineOrders}</p></div>
                        </div>
                    )}
                    {activeTab === "users" && (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border max-w-xs"><p className="text-xs text-gray-500">Total Users</p><p className="text-xl font-bold">{reportData.totalUsers}</p></div>
                    )}
                    {activeTab === "restaurants" && (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border max-w-xs"><p className="text-xs text-gray-500">Total Restaurants</p><p className="text-xl font-bold">{reportData.totalRestaurants}</p></div>
                    )}
                    {activeTab === "delivery" && (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border max-w-xs"><p className="text-xs text-gray-500">Total Delivery Boys</p><p className="text-xl font-bold">{reportData.totalDeliveryBoys}</p></div>
                    )}
                    {activeTab === "payments" && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Transactions</p><p className="text-xl font-bold">{reportData.totalTransactions}</p></div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Successful</p><p className="text-xl font-bold text-green-600">{reportData.totalSuccessful}</p></div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Failed</p><p className="text-xl font-bold text-red-600">{reportData.totalFailed}</p></div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border"><p className="text-xs text-gray-500">Success Amount</p><p className="text-xl font-bold text-green-600">₹{reportData.successfulAmount?.toLocaleString()}</p></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;

