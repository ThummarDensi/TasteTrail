import Review from "../models/review.model.js";

export const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = "-createdAt", filter = "", search = "" } = req.query;
        const query = {};

        if (filter === "pending") query.isApproved = false;
        else if (filter === "approved") query.isApproved = true;
        else if (filter === "hidden") query.isHidden = true;
        else if (filter === "visible") query.isHidden = false;

        if (search) {
            query.$or = [
                { comment: { $regex: search, $options: "i" } }
            ];
        }

        const total = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .sort(sort)
            .populate("user", "fullName email")
            .populate("item", "name image")
            .populate("shop", "name")
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        return res.status(200).json({
            reviews,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return res.status(500).json({ message: `Get reviews error: ${error.message}` });
    }
};

export const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId)
            .populate("user", "fullName email")
            .populate("item", "name image price")
            .populate("shop", "name")
            .lean();
        if (!review) return res.status(404).json({ message: "Review not found" });
        return res.status(200).json(review);
    } catch (error) {
        return res.status(500).json({ message: `Get review error: ${error.message}` });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Delete review error: ${error.message}` });
    }
};

export const hideReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.reviewId,
            { isHidden: true },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        return res.status(200).json({ message: "Review hidden", review });
    } catch (error) {
        return res.status(500).json({ message: `Hide review error: ${error.message}` });
    }
};

export const showReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.reviewId,
            { isHidden: false },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        return res.status(200).json({ message: "Review visible", review });
    } catch (error) {
        return res.status(500).json({ message: `Show review error: ${error.message}` });
    }
};

export const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.reviewId,
            { isApproved: true },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        return res.status(200).json({ message: "Review approved", review });
    } catch (error) {
        return res.status(500).json({ message: `Approve review error: ${error.message}` });
    }
};

export const rejectReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.reviewId,
            { isApproved: false },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: "Review not found" });
        return res.status(200).json({ message: "Review rejected", review });
    } catch (error) {
        return res.status(500).json({ message: `Reject review error: ${error.message}` });
    }
};

