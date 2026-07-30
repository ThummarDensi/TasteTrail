import { useState, useEffect } from "react";
import { getSettings, updateSettings, updateAdminProfileSettings, updateAdminPasswordSettings, getAdminProfile } from "../api";
import { useSelector, useDispatch } from "react-redux";
import { setAdminData } from "../redux/adminSlice";
import { toast } from "react-toastify";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { HiOutlineSave, HiOutlineKey } from "react-icons/hi";

const Settings = () => {
    const { adminData } = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");
    const [settings, setSettings] = useState(null);
    const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [websiteForm, setWebsiteForm] = useState({
        websiteName: "", currency: "INR", currencySymbol: "₹",
        deliveryCharge: "40", gstPercentage: "5",
        contactEmail: "", contactPhone: "", address: "",
        facebook: "", instagram: "", twitter: "", youtube: "",
        aboutUs: "", termsAndConditions: "", privacyPolicy: ""
    });
    const [profileImage, setProfileImage] = useState(null);
    const [logo, setLogo] = useState(null);
    const [favicon, setFavicon] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, profileRes] = await Promise.all([getSettings(), getAdminProfile()]);
            setSettings(settingsRes.data);
            const s = settingsRes.data;
            if (s) {
                setWebsiteForm({
                    websiteName: s.websiteName || "",
                    currency: s.currency || "INR",
                    currencySymbol: s.currencySymbol || "₹",
                    deliveryCharge: s.deliveryCharge?.toString() || "40",
                    gstPercentage: s.gstPercentage?.toString() || "5",
                    contactEmail: s.contactEmail || "",
                    contactPhone: s.contactPhone || "",
                    address: s.address || "",
                    facebook: s.socialMedia?.facebook || "",
                    instagram: s.socialMedia?.instagram || "",
                    twitter: s.socialMedia?.twitter || "",
                    youtube: s.socialMedia?.youtube || "",
                    aboutUs: s.aboutUs || "",
                    termsAndConditions: s.termsAndConditions || "",
                    privacyPolicy: s.privacyPolicy || ""
                });
            }
            if (profileRes.data) {
                setProfileForm({ fullName: profileRes.data.fullName || "", email: profileRes.data.email || "" });
            }
        } catch (error) {
            toast.error("Failed to load settings");
        } finally { setLoading(false); }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("fullName", profileForm.fullName);
        fd.append("email", profileForm.email);
        if (profileImage) fd.append("profileImage", profileImage);
        try {
            const { data } = await updateAdminProfileSettings(fd);
            dispatch(setAdminData({ ...adminData, ...data }));
            toast.success("Profile updated");
        } catch (error) { toast.error("Failed to update profile"); }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        try {
            await updateAdminPasswordSettings({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Password changed");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) { toast.error(error.response?.data?.message || "Failed"); }
    };

    const handleWebsiteSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        Object.entries(websiteForm).forEach(([k, v]) => fd.append(k, v));
        if (logo) fd.append("logo", logo);
        if (favicon) fd.append("favicon", favicon);
        try {
            const { data } = await updateSettings(fd);
            setSettings(data);
            toast.success("Website settings updated");
        } catch (error) { toast.error("Failed to update settings"); }
    };

    if (loading) return <LoadingSkeleton count={6} />;

    const tabs = [
        { id: "profile", label: "Admin Profile" },
        { id: "password", label: "Change Password" },
        { id: "website", label: "Website Settings" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-sm text-gray-500">Manage admin and website settings</p></div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500"
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Admin Profile */}
            {activeTab === "profile" && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl">
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                {profileForm.fullName?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{profileForm.fullName}</p>
                                <p className="text-sm text-gray-500">{profileForm.email}</p>
                            </div>
                        </div>
                        <input type="text" placeholder="Full Name" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                        <input type="email" placeholder="Email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                        <input type="file" onChange={(e) => setProfileImage(e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700" />
                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600">
                            <HiOutlineSave className="w-4 h-4" /> Save Changes
                        </button>
                    </form>
                </div>
            )}

            {/* Change Password */}
            {activeTab === "password" && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                        <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                        <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" required />
                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600">
                            <HiOutlineKey className="w-4 h-4" /> Update Password
                        </button>
                    </form>
                </div>
            )}

            {/* Website Settings */}
            {activeTab === "website" && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl">
                    <form onSubmit={handleWebsiteSubmit} className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">General</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Website Name" value={websiteForm.websiteName} onChange={(e) => setWebsiteForm({ ...websiteForm, websiteName: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                            <input type="text" placeholder="Currency Symbol" value={websiteForm.currencySymbol} onChange={(e) => setWebsiteForm({ ...websiteForm, currencySymbol: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Currency" value={websiteForm.currency} onChange={(e) => setWebsiteForm({ ...websiteForm, currency: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="number" placeholder="Delivery Charge" value={websiteForm.deliveryCharge} onChange={(e) => setWebsiteForm({ ...websiteForm, deliveryCharge: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                        </div>
                        <input type="number" placeholder="GST Percentage" value={websiteForm.gstPercentage} onChange={(e) => setWebsiteForm({ ...websiteForm, gstPercentage: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />

                        <h3 className="font-semibold text-gray-900 dark:text-white pt-4">Contact</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="email" placeholder="Contact Email" value={websiteForm.contactEmail} onChange={(e) => setWebsiteForm({ ...websiteForm, contactEmail: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="text" placeholder="Contact Phone" value={websiteForm.contactPhone} onChange={(e) => setWebsiteForm({ ...websiteForm, contactPhone: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                        </div>
                        <input type="text" placeholder="Address" value={websiteForm.address} onChange={(e) => setWebsiteForm({ ...websiteForm, address: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />

                        <h3 className="font-semibold text-gray-900 dark:text-white pt-4">Social Media</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Facebook URL" value={websiteForm.facebook} onChange={(e) => setWebsiteForm({ ...websiteForm, facebook: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="text" placeholder="Instagram URL" value={websiteForm.instagram} onChange={(e) => setWebsiteForm({ ...websiteForm, instagram: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="text" placeholder="Twitter URL" value={websiteForm.twitter} onChange={(e) => setWebsiteForm({ ...websiteForm, twitter: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                            <input type="text" placeholder="YouTube URL" value={websiteForm.youtube} onChange={(e) => setWebsiteForm({ ...websiteForm, youtube: e.target.value })}
                                className="px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm" />
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white pt-4">Uploads</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Logo</p>
                                <input type="file" onChange={(e) => setLogo(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-orange-50 file:text-orange-700" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Favicon</p>
                                <input type="file" onChange={(e) => setFavicon(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-orange-50 file:text-orange-700" />
                            </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white pt-4">Legal</h3>
                        <textarea placeholder="About Us" value={websiteForm.aboutUs} onChange={(e) => setWebsiteForm({ ...websiteForm, aboutUs: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm h-20" />
                        <textarea placeholder="Terms & Conditions" value={websiteForm.termsAndConditions} onChange={(e) => setWebsiteForm({ ...websiteForm, termsAndConditions: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm h-20" />
                        <textarea placeholder="Privacy Policy" value={websiteForm.privacyPolicy} onChange={(e) => setWebsiteForm({ ...websiteForm, privacyPolicy: e.target.value })}
                            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-sm h-20" />

                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600">
                            <HiOutlineSave className="w-4 h-4" /> Save Website Settings
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;

