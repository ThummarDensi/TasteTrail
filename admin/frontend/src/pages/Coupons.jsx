import { useState, useEffect } from "react";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ code: "", discountPercentage: "", maxDiscount: "", minOrderAmount: "", expiryDate: "", usageLimit: "100" });
    const limit = 20;

    useEffect(() => { fetchCoupons(); }, [page]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await getCoupons({ page, limit, sort: "-createdAt" });
            setCoupons(data.coupons);
            setTotal(data.total);
        } catch (error) { toast.error("Failed to fetch coupons"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateCoupon(editId, formData);
                toast.success("Coupon updated");
            } else {
                await createCoupon(formData);
                toast.success("Coupon created");
            }
            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error) { toast.error(error.response?.data?.message || "Failed"); }
    };

    const handleToggle = async (id) => {
        try { await toggleCouponStatus(id); toast.success("Toggled"); fetchCoupons(); }
        catch (error) { toast.error("Failed"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try { await deleteCoupon(id); toast.success("Deleted"); fetchCoupons(); }
        catch (error) { toast.error("Failed"); }
    };

    const resetForm = () => {
        setFormData({ code: "", discountPercentage: "", maxDiscount: "", minOrderAmount: "", expiryDate: "", usageLimit: "100" });
        setEditId(null);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1><p className="text-sm text-gray-500">{total} coupons</p></div>
                <button onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg">
                    <HiOutlinePlus className="w-4 h-4" /> Add Coupon
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Discount</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Min Order</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Expiry</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? <tr><td colSpan={6}><LoadingSkeleton type="table" count={5} /></td></tr>
                            : coupons.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">No coupons</td></tr>
                            : coupons.map((c) => (
                                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-4 py-3"><span className="text-sm font-mono font-bold text-orange-600">{c.code}</span></td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{c.discountPercentage}% (Max ₹{c.maxDiscount})</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">₹{c.minOrderAmount}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{new Date(c.expiryDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {c.isActive ? "Active" : "Disabled"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => { setEditId(c._id); setFormData({ code: c.code, discountPercentage: c.discountPercentage, maxDiscount: c.maxDiscount, minOrderAmount: c.minOrderAmount, expiryDate: c.expiryDate?.split("T")[0], usageLimit: c.usageLimit }); setShowModal(true); }}
                                                className="p-1.5 hover:bg-green-50 rounded text-green-600"><HiOutlinePencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleToggle(c._id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                                                <span className="text-xs font-medium">{c.isActive ? "Disable" : "Enable"}</span>
                                            </button>
                                            <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
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

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editId ? "Edit Coupon" : "Add Coupon"}</h3>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Coupon Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" placeholder="Discount %" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" required max={100} min={0} />
                                <input type="number" placeholder="Max Discount" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" placeholder="Min Order" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" required />
                            </div>
                            <input type="number" placeholder="Usage Limit" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg">
                                {editId ? "Update" : "Create"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;

