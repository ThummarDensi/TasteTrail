import { useState, useEffect } from "react";
import { getReviews, deleteReview, hideReview, showReview, approveReview, rejectReview } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineStar, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheck, HiOutlineX } from "react-icons/hi";

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const limit = 20;

    useEffect(() => { fetchReviews(); }, [page, filter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await getReviews({ page, limit, filter, sort: "-createdAt" });
            setReviews(data.reviews);
            setTotal(data.total);
        } catch (error) { toast.error("Failed to fetch reviews"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try { await deleteReview(id); toast.success("Deleted"); fetchReviews(); }
        catch (error) { toast.error("Failed"); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h1><p className="text-sm text-gray-500">{total} reviews</p></div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                    <option value="">All</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="hidden">Hidden</option>
                    <option value="visible">Visible</option>
                </select>
            </div>

            <div className="space-y-4">
                {loading ? <LoadingSkeleton count={5} />
                : reviews.length === 0 ? <div className="text-center py-12 text-gray-400">No reviews found</div>
                : reviews.map((r) => (
                    <div key={r._id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-medium">
                                    {r.user?.fullName?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.user?.fullName}</p>
                                        <div className="flex items-center text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <HiOutlineStar key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-current" : ""}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {r.item?.name && `on ${r.item.name}`}
                                        {r.shop?.name && ` on ${r.shop.name}`}
                                    </p>
                                    {r.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{r.comment}</p>}
                                    <div className="flex items-center gap-2 mt-2">
                                        {!r.isApproved && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pending</span>}
                                        {r.isHidden && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Hidden</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {!r.isApproved && (
                                    <button onClick={() => { approveReview(r._id).then(() => { toast.success("Approved"); fetchReviews(); }).catch(() => toast.error("Failed")); }}
                                        className="p-1.5 hover:bg-green-50 rounded text-green-600"><HiOutlineCheck className="w-4 h-4" /></button>
                                )}
                                {r.isHidden ? (
                                    <button onClick={() => { showReview(r._id).then(() => { toast.success("Shown"); fetchReviews(); }).catch(() => toast.error("Failed")); }}
                                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><HiOutlineEye className="w-4 h-4" /></button>
                                ) : (
                                    <button onClick={() => { hideReview(r._id).then(() => { toast.success("Hidden"); fetchReviews(); }).catch(() => toast.error("Failed")); }}
                                        className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><HiOutlineEyeOff className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => handleDelete(r._id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {Math.ceil(total / limit) > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
                    <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default Reviews;

