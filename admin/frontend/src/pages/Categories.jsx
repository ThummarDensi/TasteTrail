import { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editOldName, setEditOldName] = useState(null);
    const [name, setName] = useState("");

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await getCategories();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to fetch categories");
        } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return toast.error("Category name is required");
        try {
            if (editOldName) {
                await updateCategory({ oldName: editOldName, newName: name });
                toast.success("Category updated");
            } else {
                await createCategory({ name });
                toast.success("Category created");
            }
            setShowModal(false);
            setName("");
            setEditOldName(null);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (catName) => {
        if (!window.confirm(`Delete "${catName}"? Items will be moved to "Others".`)) return;
        try {
            await deleteCategory(catName);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) { toast.error("Failed"); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-sm text-gray-500">{categories.length} total categories</p>
                </div>
                <button onClick={() => { setEditOldName(null); setName(""); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600">
                    <HiOutlinePlus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {loading ? <LoadingSkeleton count={6} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.name} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                                    <p className="text-xs text-gray-500">{cat.count} items</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditOldName(cat.name); setName(cat.name); setShowModal(true); }}
                                        className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded text-green-600"><HiOutlinePencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(cat.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editOldName ? "Edit Category" : "Add Category"}</h3>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Category Name" value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg">
                                {editOldName ? "Update" : "Create"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;

