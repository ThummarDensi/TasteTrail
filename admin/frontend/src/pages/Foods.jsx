import { useState, useEffect } from "react";
import { getFoods, createFood, updateFood, deleteFood, toggleFoodAvailability, markPopular, markRecommended } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineStar, HiOutlineBadgeCheck } from "react-icons/hi";

const Foods = () => {
    const [foods, setFoods] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const [category, setCategory] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: "", category: "Others", foodType: "veg", price: "", description: "", shop: "" });
    const [image, setImage] = useState(null);
    const limit = 20;

    useEffect(() => {
        fetchFoods();
    }, [page, filter, category]);

    const fetchFoods = async () => {
        setLoading(true);
        try {
            const { data } = await getFoods({ page, limit, search, sort: "-createdAt", filter, category });
            setFoods(data.foods);
            setTotal(data.total);
        } catch (error) {
            toast.error("Failed to fetch foods");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        if (image) fd.append("image", image);
        try {
            if (editId) {
                await updateFood(editId, fd);
                toast.success("Food updated");
            } else {
                await createFood(fd);
                toast.success("Food created");
            }
            setShowModal(false);
            setEditId(null);
            setFormData({ name: "", category: "Others", foodType: "veg", price: "", description: "", shop: "" });
            setImage(null);
            fetchFoods();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this food item?")) return;
        try { await deleteFood(id); toast.success("Deleted"); fetchFoods(); }
        catch (error) { toast.error("Failed"); }
    };

    const handleToggle = async (id) => {
        try { await toggleFoodAvailability(id); toast.success("Toggled"); fetchFoods(); }
        catch (error) { toast.error("Failed"); }
    };

    const handlePopular = async (id) => {
        try { await markPopular(id); toast.success("Marked as popular"); fetchFoods(); }
        catch (error) { toast.error("Failed"); }
    };

    const handleRecommended = async (id) => {
        try { await markRecommended(id); toast.success("Marked as recommended"); fetchFoods(); }
        catch (error) { toast.error("Failed"); }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Foods</h1>
                    <p className="text-sm text-gray-500">{total} total foods</p>
                </div>
                <button onClick={() => { setEditId(null); setFormData({ name: "", category: "Others", foodType: "veg", price: "", description: "", shop: "" }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600">
                    <HiOutlinePlus className="w-4 h-4" /> Add Food
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                    <option value="">All</option>
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                </select>
                <button onClick={fetchFoods} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg">Search</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? <div className="col-span-full"><LoadingSkeleton count={8} /></div>
                : foods.length === 0 ? <div className="col-span-full text-center py-12 text-gray-400">No foods found</div>
                : foods.map((food) => (
                    <div key={food._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-36 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 relative">
                            {food.image && <img src={food.image} alt={food.name} className="w-full h-full object-cover" />}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${food.foodType === "veg" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {food.foodType}
                                </span>
                            </div>
                            {food.isAvailable === false && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded-lg text-sm">Unavailable</span>
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{food.name}</h3>
                                    <p className="text-xs text-gray-500">{food.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-orange-600">₹{food.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                {food.isPopular && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Popular</span>}
                                {food.isRecommended && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Recommended</span>}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditId(food._id); setFormData({ name: food.name, category: food.category, foodType: food.foodType, price: food.price, description: food.description || "", shop: food.shop?._id || "" }); setShowModal(true); }}
                                        className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-green-600"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDelete(food._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleToggle(food._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600">
                                        {food.isAvailable ? <HiOutlineX className="w-3.5 h-3.5" /> : <HiOutlineCheck className="w-3.5 h-3.5" />}
                                    </button>
                                    {!food.isPopular && <button onClick={() => handlePopular(food._id)} className="p-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded text-yellow-600"><HiOutlineStar className="w-3.5 h-3.5" /></button>}
                                    {!food.isRecommended && <button onClick={() => handleRecommended(food._id)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600"><HiOutlineBadgeCheck className="w-3.5 h-3.5" /></button>}
                                </div>
                            </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Food" : "Add Food"}</h3>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Food Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <div className="grid grid-cols-2 gap-3">
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                                    <option>Snacks</option><option>Main Course</option><option>Desserts</option><option>Pizza</option>
                                    <option>Burgers</option><option>Sandwiches</option><option>South Indian</option><option>North Indian</option>
                                    <option>Chinese</option><option>Fast Food</option><option>Others</option>
                                </select>
                                <select value={formData.foodType} onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                                    className="px-3 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                                    <option value="veg">Veg</option><option value="non veg">Non-Veg</option>
                                </select>
                            </div>
                            <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <input type="text" placeholder="Shop ID (required for new)" value={formData.shop} onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="file" onChange={(e) => setImage(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700" />
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600">
                                {editId ? "Update Food" : "Create Food"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Foods;

