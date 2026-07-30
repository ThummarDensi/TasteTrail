import { useState, useEffect } from "react";
import { getPayments, getPaymentSummary, getPaymentById } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlineEye, HiOutlineX } from "react-icons/hi";

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("");
    const [viewModal, setViewModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const limit = 20;

    useEffect(() => {
        fetchPayments();
        fetchSummary();
    }, [page, status]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await getPayments({ page, limit, status, sort: "-createdAt" });
            setPayments(data.payments);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch payments");
        } finally { setLoading(false); }
    };

    const fetchSummary = async () => {
        try {
            const { data } = await getPaymentSummary();
            setSummary(data);
        } catch (error) { }
    };

    const handleView = async (id) => {
        try {
            const { data } = await getPaymentById(id);
            setSelectedPayment(data);
            setViewModal(true);
        } catch (error) {
            toast.error("Failed to load payment details");
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
                    <p className="text-sm text-gray-500">{total} transactions</p>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600">Successful</p>
                        <p className="text-xl font-bold text-green-700">{summary.successful}</p>
                        <p className="text-xs text-green-600">₹{(summary.successfulAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600">Failed</p>
                        <p className="text-xl font-bold text-red-700">{summary.failed}</p>
                        <p className="text-xs text-red-600">₹{(summary.failedAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-600">Pending</p>
                        <p className="text-xl font-bold text-yellow-700">{summary.pending}</p>
                        <p className="text-xs text-yellow-600">₹{(summary.pendingAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
                        <p className="text-xs text-rose-600">Refunded</p>
                        <p className="text-xl font-bold text-rose-700">{summary.totalRefunded}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                    <option value="">All</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Method</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Date</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? <tr><td colSpan={6}><LoadingSkeleton type="table" count={5} /></td></tr>
                            : payments.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments found</td></tr>
                            : payments.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{p.user?.fullName || "Unknown"}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{p.paymentMethod}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">₹{p.totalAmount?.toFixed(2)}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.payment ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {p.payment ? "Success" : "Failed"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleView(p._id)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><HiOutlineEye className="w-4 h-4" /></button>
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
        </div>
    );
};

export default Payments;

