import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { toggleSidebar } from "../redux/adminSlice";
import {
    HiOutlineChartBar, HiOutlineUsers, HiOutlineShoppingBag,
    HiOutlineTruck, HiOutlineCube, HiOutlineMenu,
    HiOutlineViewGrid, HiOutlineClipboardList, HiOutlineCreditCard,
    HiOutlineTag, HiOutlineStar, HiOutlinePhotograph,
    HiOutlineBell, HiOutlineDocumentReport, HiOutlineChartPie,
    HiOutlineCog, HiOutlineLogout, HiOutlineX, HiOutlineChevronDown,
    HiOutlineHome, HiOutlineUserGroup, HiOutlineUser
} from "react-icons/hi";
import { useState } from "react";
import { clearAdminData } from "../redux/adminSlice";
import { adminLogout } from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: HiOutlineChartBar },
    { path: "/admin/users", label: "Users", icon: HiOutlineUsers },
    { path: "/admin/shop-owners", label: "Shop Owners", icon: HiOutlineUserGroup },
    { path: "/admin/delivery-boys", label: "Delivery Boys", icon: HiOutlineTruck },
    { path: "/admin/restaurants", label: "Restaurants", icon: HiOutlineHome },
    { path: "/admin/foods", label: "Foods", icon: HiOutlineCube },
    { path: "/admin/categories", label: "Categories", icon: HiOutlineViewGrid },
    { path: "/admin/orders", label: "Orders", icon: HiOutlineClipboardList },
    { path: "/admin/payments", label: "Payments", icon: HiOutlineCreditCard },
    { path: "/admin/coupons", label: "Coupons", icon: HiOutlineTag },
    { path: "/admin/reviews", label: "Reviews", icon: HiOutlineStar },
    { path: "/admin/banners", label: "Banners", icon: HiOutlinePhotograph },
    { path: "/admin/notifications", label: "Notifications", icon: HiOutlineBell },
    { path: "/admin/reports", label: "Reports", icon: HiOutlineDocumentReport },
    { path: "/admin/analytics", label: "Analytics", icon: HiOutlineChartPie },
    { path: "/admin/settings", label: "Settings", icon: HiOutlineCog },
];

const Sidebar = () => {
    const { sidebarOpen } = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await adminLogout();
            dispatch(clearAdminData());
            toast.success("Logged out successfully");
            navigate("/admin/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const sidebarContent = (
        <div className={`h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${sidebarOpen ? 'w-[260px]' : 'w-[70px]'} overflow-hidden`}>
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                {sidebarOpen ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">KF</span>
                            </div>
                            <span className="font-bold text-lg text-gray-800 dark:text-white">TasteTrail Admin</span>
                        </div>
                        <button onClick={() => dispatch(toggleSidebar())} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                            <HiOutlineX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">KF</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 px-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200"
                >
                    <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
            >
                <HiOutlineMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
                    <div className="relative h-full shadow-xl animate-slide-in">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;

