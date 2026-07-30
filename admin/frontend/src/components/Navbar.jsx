import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../redux/themeSlice";
import { HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineSearch, HiOutlineMenu } from "react-icons/hi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toggleSidebar } from "../redux/adminSlice";

const Navbar = () => {
    const { darkMode } = useSelector(state => state.theme);
    const { adminData } = useSelector(state => state.admin);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <HiOutlineMenu className="w-5 h-5 text-gray-500" />
                </button>
                <div className="relative hidden sm:block">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                    onClick={() => dispatch(toggleDarkMode())}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {darkMode ? (
                        <HiOutlineSun className="w-5 h-5 text-yellow-500" />
                    ) : (
                        <HiOutlineMoon className="w-5 h-5 text-gray-500" />
                    )}
                </button>

                {/* Notifications */}
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors">
                    <HiOutlineBell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {adminData?.fullName?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                            {adminData?.fullName || "Admin"}
                        </span>
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fade-in">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{adminData?.fullName}</p>
                                <p className="text-xs text-gray-500">{adminData?.email}</p>
                            </div>
                            <button
                                onClick={() => { navigate("/admin/settings"); setShowProfile(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Profile Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;

