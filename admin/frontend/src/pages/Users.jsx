import { useState, useEffect } from "react";
import { getUsers, getUserById, updateUser, deleteUser, blockUser, unblockUser, getUserOrders } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineBan, HiOutlineCheck, HiOutlineEye, HiOutlineX } from "react-icons/hi";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const [sort, setSort] = useState("-createdAt");
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const limit = 20;

    useEffect(() => {
        fetchUsers();
    }, [page, filter, sort]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await getUsers({ page, limit, search, sort, filter });
            setUsers(data.users);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleViewUser = async (user) => {
        try {
            const { data } = await getUserById(user._id);
            setSelectedUser(data);
            setViewModal(true);
        } catch (error) {
            toast.error("Failed to fetch user details");
        }
    };

    const handleBlock = async (id) => {
        try {
            await blockUser(id);
            toast.success("User blocked");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to block user");
        }
    };

    const handleUnblock = async (id) => {
        try {
            await unblockUser(id);
            toast.success("User unblocked");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to unblock user");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUser(id);
            toast.success("User deleted");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
                    <p className="text-sm text-gray-500">{total} total users</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                </form>
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="">All Users</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="-createdAt">Newest</option>
                    <option value="createdAt">Oldest</option>
                    <option value="fullName">Name A-Z</option>
                    <option value="-fullName">Name Z-A</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Mobile</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={6}><LoadingSkeleton type="table" count={5} /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                    {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{user.email}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{user.mobile}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                user.isBlocked ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            }`}>
                                                {user.isBlocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {user.isBlocked ? (
                                                    <button onClick={() => handleUnblock(user._id)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600" title="Unblock">
                                                        <HiOutlineCheck className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleBlock(user._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600" title="Block">
                                                        <HiOutlineBan className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(user._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600" title="Delete">
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800">
                        Previous
                    </button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800">
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Users;

