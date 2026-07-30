import { useState, useEffect } from "react";
import { getShopOwners, approveShopOwner, rejectShopOwner, suspendShopOwner, activateShopOwner, deleteShopOwner, getShopOwnerById } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlineCheck, HiOutlineX, HiOutlineTrash, HiOutlineEye, HiOutlineBan } from "react-icons/hi";

const ShopOwners = () => {
    const [owners, setOwners] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const [viewModal, setViewModal] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const limit = 20;

    useEffect(() => {
        fetchOwners();
    }, [page, filter]);

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const { data } = await getShopOwners({ page, limit, search, sort: "-createdAt", filter });
            setOwners(data.owners);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch shop owners");
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (id) => {
        try {
            const { data } = await getShopOwnerById(id);
            setSelectedOwner(data);
            setViewModal(true);
        } catch (error) {
            toast.error("Failed to load details");
        }
    };

    const doAction = async (action, id, msg) => {
        try {
            await action(id);
            toast.success(msg);
            fetchOwners();
        } catch (error) {
            toast.error(`Failed: ${error.response?.data?.message || "Error"}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this shop owner and their shops?")) return;
        doAction(deleteShopOwner, id, "Shop owner deleted");
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Owners</h1>
                    <p className="text-sm text-gray-500">{total} total owners</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search owners..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
                <button onClick={fetchOwners} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">Search</button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Mobile</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Shop</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={6}><LoadingSkeleton type="table" count={5} /></td></tr>
                            ) : owners.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No shop owners found</td></tr>
                            ) : (
                                owners.map((owner) => (
                                    <tr key={owner._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                    {owner.fullName?.charAt(0)?.toUpperCase() || "O"}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{owner.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{owner.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{owner.mobile}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{owner.shop?.name || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                !owner.isActive ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                owner.isApproved === false ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            }`}>
                                                {!owner.isActive ? "Suspended" : owner.isApproved === false ? "Pending" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleView(owner._id)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600">
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </button>
                                                {!owner.isApproved && (
                                                    <button onClick={() => doAction(approveShopOwner, owner._id, "Approved")} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600">
                                                        <HiOutlineCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {owner.isActive ? (
                                                    <button onClick={() => doAction(suspendShopOwner, owner._id, "Suspended")} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600">
                                                        <HiOutlineBan className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => doAction(activateShopOwner, owner._id, "Activated")} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600">
                                                        <HiOutlineCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(owner._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600">
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

            {/* View Modal */}
            {viewModal && selectedOwner && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Owner Details</h3>
                            <button onClick={() => setViewModal(false)} className="text-gray-400 hover:text-gray-600"><HiOutlineX className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm"><span className="font-medium text-gray-500">Name:</span> <span className="text-gray-900 dark:text-white">{selectedOwner.owner?.fullName}</span></p>
                            <p className="text-sm"><span className="font-medium text-gray-500">Email:</span> {selectedOwner.owner?.email}</p>
                            <p className="text-sm"><span className="font-medium text-gray-500">Mobile:</span> {selectedOwner.owner?.mobile}</p>
                            {selectedOwner.shop && (
                                <>
                                    <hr className="border-gray-200 dark:border-gray-700" />
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Shop Details</p>
                                    <p className="text-sm"><span className="font-medium text-gray-500">Name:</span> {selectedOwner.shop.name}</p>
                                    <p className="text-sm"><span className="font-medium text-gray-500">City:</span> {selectedOwner.shop.city}</p>
                                    <p className="text-sm"><span className="font-medium text-gray-500">Items:</span> {selectedOwner.shop.items?.length || 0}</p>
                                    <p className="text-sm"><span className="font-medium text-gray-500">Total Orders:</span> {selectedOwner.totalOrders}</p>
                                    <p className="text-sm"><span className="font-medium text-gray-500">Revenue:</span> ₹{selectedOwner.totalRevenue?.toLocaleString()}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopOwners;

