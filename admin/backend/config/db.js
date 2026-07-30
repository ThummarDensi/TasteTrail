import mongoose from "mongoose"

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Admin DB Connected Successfully")
    } catch (error) {
        console.log("Admin DB Connection Error:", error.message)
    }
}

export default connectDb

