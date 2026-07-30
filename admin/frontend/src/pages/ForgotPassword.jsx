import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminSendOtp, adminVerifyOtp, adminResetPassword } from "../api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");
        setLoading(true);
        try {
            await adminSendOtp({ email });
            toast.success("OTP sent to your email");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error("Please enter OTP");
        setLoading(true);
        try {
            await adminVerifyOtp({ email, otp });
            toast.success("OTP verified");
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            return toast.error("Please fill in all fields");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setLoading(true);
        try {
            await adminResetPassword({ email, newPassword });
            toast.success("Password reset successfully");
            navigate("/admin/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/admin/login" className="inline-flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">KF</span>
                        </div>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                    {step === 1 && (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Forgot Password</h2>
                            <p className="text-sm text-gray-500 mb-6">Enter your email to receive OTP</p>
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="admin@example.com" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50">
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Verify OTP</h2>
                            <p className="text-sm text-gray-500 mb-6">Enter the OTP sent to {email}</p>
                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">OTP</label>
                                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none text-center text-2xl tracking-widest"
                                        placeholder="••••" maxLength={4} />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50">
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Reset Password</h2>
                            <p className="text-sm text-gray-500 mb-6">Enter your new password</p>
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="••••••••" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50">
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/admin/login" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

