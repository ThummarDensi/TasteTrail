import { useState, useEffect } from "react";
import { getDeliveryBoys, approveDeliveryBoy, suspendDeliveryBoy, activateDeliveryBoy, deleteDeliveryBoy } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlineCheck, HiOutlineTrash, HiOutlineBan, HiOutlineEye, HiOutlineX } from "react-icons/hi";

const DeliveryBoys = () => {
    const [boys, setBoys] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const limit = 20;

    useEffect(() => {
        fetchBoys();
    }, [page, filter]);

    const fetchBoys = async () => {
        setLoading(true);
        try {
            const { data } = await getDeliveryBoys({ page, limit, search, sort: "-createdAt", filter });
            setBoys(data.deliveryBoys);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch delivery boys");
        } finally {
            setLoading(false);
        }
    };

    const doAction = async (action, id, msg) => {
        try {
            await action(id);
            toast.success(msg);
            fetchBoys();
        } catch (error) {
            toast.error("Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this delivery boy?")) return;
        doAction(deleteDeliveryBoy, id, "Deleted");
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Boys</h1>
                    <p className="text-sm text-gray-500">{total} total delivery boys</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                    <option value="">All</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button onClick={fetchBoys} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">Search</button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Mobile</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Online</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={6}><LoadingSkeleton type="table" count={5} /></td></tr>
                            ) : boys.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No delivery boys found</td></tr>
                            ) : (
                                boys.map((boy) => (
                                    <tr key={boy._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                    {boy.fullName?.charAt(0)?.toUpperCase() || "D"}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{boy.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{boy.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{boy.mobile}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                !boy.isActive ? "bg-red-100 text-red-700 dark:bg-red-900/30" :
                                                "bg-green-100 text-green-700 dark:bg-green-900/30"
                                            }`}>{boy.isActive ? "Active" : "Suspended"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                                boy.isOnline ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${boy.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                                                {boy.isOnline ? "Online" : "Offline"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {boy.isActive ? (
                                                    <button onClick={() => doAction(suspendDeliveryBoy, boy._id, "Suspended")} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600">
                                                        <HiOutlineBan className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => doAction(activateDeliveryBoy, boy._id, "Activated")} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600">
                                                        <HiOutlineCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(boy._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
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
        </div>
    );
};

export default DeliveryBoys;

