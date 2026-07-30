import { useState, useEffect } from "react";
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, approveRestaurant, rejectRestaurant, getRestaurantById } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineEye } from "react-icons/hi";

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: "", city: "", state: "", address: "" });
    const [image, setImage] = useState(null);
    const limit = 20;

    useEffect(() => {
        fetchRestaurants();
    }, [page]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const { data } = await getRestaurants({ page, limit, search, sort: "-createdAt" });
            setRestaurants(data.restaurants);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch restaurants");
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (id) => {
        try {
            const { data } = await getRestaurantById(id);
            setSelectedRestaurant(data);
            setViewModal(true);
        } catch (error) {
            toast.error("Failed to load details");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("name", formData.name);
        fd.append("city", formData.city);
        fd.append("state", formData.state);
        fd.append("address", formData.address);
        if (image) fd.append("image", image);

        try {
            if (editId) {
                await updateRestaurant(editId, fd);
                toast.success("Restaurant updated");
            } else {
                await createRestaurant(fd);
                toast.success("Restaurant created");
            }
            setShowModal(false);
            resetForm();
            fetchRestaurants();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this restaurant and all its foods?")) return;
        try {
            await deleteRestaurant(id);
            toast.success("Deleted");
            fetchRestaurants();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const resetForm = () => {
        setFormData({ name: "", city: "", state: "", address: "" });
        setImage(null);
        setEditId(null);
    };

    const openEdit = (rest) => {
        setFormData({ name: rest.name, city: rest.city, state: rest.state, address: rest.address });
        setEditId(rest._id);
        setShowModal(true);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurants</h1>
                    <p className="text-sm text-gray-500">{total} total restaurants</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors">
                    <HiOutlinePlus className="w-4 h-4" /> Add Restaurant
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="relative max-w-md">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search restaurants..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full"><LoadingSkeleton count={6} /></div>
                ) : restaurants.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">No restaurants found</div>
                ) : (
                    restaurants.map((rest) => (
                        <div key={rest._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-32 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900/30 dark:to-red-900/30 relative">
                                {rest.image && (
                                    <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{rest.name}</h3>
                                        <p className="text-xs text-gray-500">{rest.city}, {rest.state}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                    <span>{rest.items?.length || 0} items</span>
                                    <span>{rest.totalOrders || 0} orders</span>
                                    <span className="font-semibold text-green-600">₹{(rest.totalRevenue || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-1">
                                        <button onClick={() => handleView(rest._id)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600"><HiOutlineEye className="w-4 h-4" /></button>
                                        <button onClick={() => openEdit(rest)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-green-600"><HiOutlinePencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(rest._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Restaurant" : "Add Restaurant"}</h3>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Restaurant Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                                <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            </div>
                            <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <input type="file" onChange={(e) => setImage(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors">
                                {editId ? "Update Restaurant" : "Create Restaurant"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewModal && selectedRestaurant && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Restaurant Details</h3>
                            <button onClick={() => setViewModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm"><span className="font-medium text-gray-500">Name:</span> {selectedRestaurant.restaurant?.name}</p>
                            <p className="text-sm"><span className="font-medium text-gray-500">City:</span> {selectedRestaurant.restaurant?.city}</p>
                            <p className="text-sm"><span className="font-medium text-gray-500">Address:</span> {selectedRestaurant.restaurant?.address}</p>
                            <p className="text-sm"><span className="font-medium text-gray-500">Owner:</span> {selectedRestaurant.restaurant?.owner?.fullName || "—"}</p>
                            <hr className="border-gray-200 dark:border-gray-700" />
                            <p className="text-sm"><span className="font-medium text-gray-500">Total Orders:</span> {selectedRestaurant.totalOrders}</p>
                            <p className="text-sm"><span className="font-medium text-gray-500">Total Revenue:</span> ₹{selectedRestaurant.totalRevenue?.toLocaleString()}</p>
                            <p className="text-sm"><span className="font-medium text-gray-500">Items:</span> {selectedRestaurant.restaurant?.items?.length || 0}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Restaurants;

