import { useState, useEffect } from "react";
import { getNotifications, sendNotification, deleteNotification } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX, HiOutlineMail, HiOutlineBell } from "react-icons/hi";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: "", message: "", type: "push", recipientType: "all_users", recipientIds: "" });
    const limit = 20;

    useEffect(() => { fetchNotifications(); }, [page]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await getNotifications({ page, limit });
            setNotifications(data.notifications);
            setTotal(data.total);
        } catch (error) { toast.error("Failed to fetch notifications"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.recipientType === "specific_users" || payload.recipientType === "specific_restaurants") {
                payload.recipientIds = payload.recipientIds.split(",").map(id => id.trim());
            }
            await sendNotification(payload);
            toast.success("Notification sent");
            setShowModal(false);
            setFormData({ title: "", message: "", type: "push", recipientType: "all_users", recipientIds: "" });
            fetchNotifications();
        } catch (error) { toast.error(error.response?.data?.message || "Failed"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try { await deleteNotification(id); toast.success("Deleted"); fetchNotifications(); }
        catch (error) { toast.error("Failed"); }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1><p className="text-sm text-gray-500">{total} sent</p></div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg">
                    <HiOutlinePlus className="w-4 h-4" /> Send Notification
                </button>
            </div>

            <div className="space-y-4">
                {loading ? <LoadingSkeleton count={5} />
                : notifications.length === 0 ? <div className="text-center py-12 text-gray-400">No notifications sent</div>
                : notifications.map((n) => (
                    <div key={n._id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${n.type === "email" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"}`}>
                                    {n.type === "email" ? <HiOutlineMail className="w-5 h-5" /> : <HiOutlineBell className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">{n.recipientType.replace(/_/g, " ")}</span>
                                        <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Send Notification</h3>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <textarea placeholder="Message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none h-24" required />
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                                <option value="push">Push Notification</option>
                                <option value="email">Email</option>
                                <option value="sms">SMS</option>
                            </select>
                            <select value={formData.recipientType} onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                                <option value="all_users">All Users</option>
                                <option value="all_owners">All Shop Owners</option>
                                <option value="all_delivery_boys">All Delivery Boys</option>
                                <option value="specific_users">Specific Users</option>
                                <option value="specific_restaurants">Specific Restaurants</option>
                            </select>
                            {(formData.recipientType === "specific_users" || formData.recipientType === "specific_restaurants") && (
                                <input type="text" placeholder="Enter IDs comma-separated" value={formData.recipientIds} onChange={(e) => setFormData({ ...formData, recipientIds: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            )}
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg">
                                Send Notification
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;

