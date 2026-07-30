const LoadingSkeleton = ({ count = 6, type = "card" }) => {
    if (type === "table") {
        return (
            <div className="animate-pulse">
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        </div>
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "chart") {
        return (
            <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;

