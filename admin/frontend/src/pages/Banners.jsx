import { useState, useEffect } from "react";
import { getBanners, createBanner, updateBanner, deleteBanner, toggleBannerStatus } from "../api";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from "react-icons/hi";

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ title: "", subtitle: "", type: "home", link: "", order: "0" });
    const [image, setImage] = useState(null);

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const { data } = await getBanners();
            setBanners(data);
        } catch (error) { toast.error("Failed to fetch banners"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        if (image) fd.append("image", image);
        try {
            if (editId) {
                const { data } = await updateBanner(editId, fd);
                if (data) toast.success("Banner updated");
            } else {
                const { data } = await createBanner(fd);
                if (data) toast.success("Banner created");
            }
            setShowModal(false);
            resetForm();
            fetchBanners();
        } catch (error) { toast.error(error.response?.data?.message || "Failed"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;
        try { await deleteBanner(id); toast.success("Deleted"); fetchBanners(); }
        catch (error) { toast.error("Failed"); }
    };

    const handleToggle = async (id) => {
        try { await toggleBannerStatus(id); toast.success("Toggled"); fetchBanners(); }
        catch (error) { toast.error("Failed"); }
    };

    const resetForm = () => {
        setFormData({ title: "", subtitle: "", type: "home", link: "", order: "0" });
        setImage(null);
        setEditId(null);
    };

    const typeColors = { home: "bg-blue-100 text-blue-700", offer: "bg-green-100 text-green-700", festival: "bg-purple-100 text-purple-700", promotional: "bg-orange-100 text-orange-700" };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banners</h1><p className="text-sm text-gray-500">{banners.length} banners</p></div>
                <button onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg">
                    <HiOutlinePlus className="w-4 h-4" /> Add Banner
                </button>
            </div>

            {loading ? <LoadingSkeleton count={4} /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {banners.map((banner) => (
                        <div key={banner._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-36 bg-gray-100 dark:bg-gray-800">
                                {banner.image && <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{banner.title}</h3>
                                        <p className="text-xs text-gray-500">{banner.subtitle}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[banner.type] || "bg-gray-100"}`}>{banner.type}</span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${banner.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {banner.isActive ? "Active" : "Inactive"}
                                    </span>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditId(banner._id); setFormData({ title: banner.title, subtitle: banner.subtitle || "", type: banner.type, link: banner.link || "", order: banner.order?.toString() || "0" }); setShowModal(true); }}
                                            className="p-1.5 hover:bg-green-50 rounded text-green-600"><HiOutlinePencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleToggle(banner._id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600 text-xs">{banner.isActive ? "Off" : "On"}</button>
                                        <button onClick={() => handleDelete(banner._id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><HiOutlineTrash className="w-4 h-4" /></button>
                                    </div>
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
                            <h3 className="text-lg font-semibold">{editId ? "Edit Banner" : "Add Banner"}</h3>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                            <input type="text" placeholder="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm">
                                <option value="home">Home</option><option value="offer">Offer</option><option value="festival">Festival</option><option value="promotional">Promotional</option>
                            </select>
                            <input type="text" placeholder="Link URL (optional)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="number" placeholder="Order" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            {!editId && (
                                <input type="file" onChange={(e) => setImage(e.target.files[0])}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700" required />
                            )}
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

export default Banners;

