import { useState, useEffect } from "react";
import { getOrders, getOrderById, updateOrderStatus, cancelOrder, refundOrder } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlineEye, HiOutlineX } from "react-icons/hi";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    ready: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
    "out of delivery": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    "picked up": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    "on the way": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    refunded: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [viewModal, setViewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const limit = 20;

    useEffect(() => {
        fetchOrders();
    }, [page, status]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await getOrders({ page, limit, search, sort: "-createdAt", status });
            setOrders(data.orders);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally { setLoading(false); }
    };

    const handleView = async (id) => {
        try {
            const { data } = await getOrderById(id);
            setSelectedOrder(data);
            setViewModal(true);
        } catch (error) {
            toast.error("Failed to load order details");
        }
    };

    const handleStatusChange = async (orderId, shopOrderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, shopOrderId, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            setViewModal(false);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this entire order?")) return;
        try {
            await cancelOrder(id);
            toast.success("Order cancelled");
            fetchOrders();
        } catch (error) { toast.error("Failed"); }
    };

    const handleRefund = async (id) => {
        if (!window.confirm("Refund this order?")) return;
        try {
            await refundOrder(id);
            toast.success("Order refunded");
            fetchOrders();
        } catch (error) { toast.error("Failed"); }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
                    <p className="text-sm text-gray-500">{total} total orders</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="out of delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                </select>
                <button onClick={fetchOrders} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg">Search</button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Customer</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Amount</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Payment</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Date</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? <tr><td colSpan={7}><LoadingSkeleton type="table" count={5} /></td></tr>
                            : orders.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">No orders found</td></tr>
                            : orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-mono text-gray-900 dark:text-white">#{order._id?.slice(-8)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{order.user?.fullName || "Unknown"}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hidden sm:table-cell">₹{order.totalAmount?.toFixed(2)}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.payment ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {order.payment ? "Paid" : "Unpaid"} ({order.paymentMethod})
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.shopOrders?.[0]?.status] || "bg-gray-100"}`}>
                                            {order.shopOrders?.[0]?.status || "pending"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleView(order._id)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600"><HiOutlineEye className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
                </div>
            )}

            {viewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setViewModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order #{selectedOrder._id?.slice(-8)}</h3>
                            <button onClick={() => setViewModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Customer</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.user?.fullName}</p>
                                <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="text-sm font-bold text-orange-600">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{selectedOrder.paymentMethod} | {selectedOrder.payment ? "Paid" : "Unpaid"}</p>
                            </div>
                        </div>

                        {selectedOrder.shopOrders?.map((so, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900 dark:text-white">{so.shop?.name || "Restaurant"}</p>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[so.status]}`}>{so.status}</span>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                    {so.shopOrderItems?.map((item, i) => (
                                        <p key={i}>{item.name} × {item.quantity} — ₹{(item.price * item.quantity).toFixed(2)}</p>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Subtotal: ₹{so.subtotal?.toFixed(2)}</p>
                                {so.assignedDeliveryBoy && (
                                    <p className="text-xs text-blue-600 mt-1">Delivery Boy: {so.assignedDeliveryBoy?.fullName}</p>
                                )}
                                <div className="flex gap-2 mt-2">
                                    {so.status !== "delivered" && so.status !== "cancelled" && so.status !== "refunded" && (
                                        <>
                                            <select onChange={(e) => handleStatusChange(selectedOrder._id, so._id, e.target.value)} defaultValue=""
                                                className="text-xs px-2 py-1 border rounded bg-white dark:bg-gray-800">
                                                <option value="" disabled>Change Status</option>
                                                <option value="accepted">Accept</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="ready">Ready</option>
                                                <option value="out of delivery">Out for Delivery</option>
                                                <option value="picked up">Picked Up</option>
                                                <option value="on the way">On The Way</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                            <button onClick={() => handleCancel(selectedOrder._id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Cancel</button>
                                            <button onClick={() => handleRefund(selectedOrder._id)} className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded hover:bg-rose-200">Refund</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="mt-3">
                            <p className="text-xs text-gray-500">Delivery Address</p>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedOrder.deliveryAddress?.text || "—"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;

