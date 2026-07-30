import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import adminRouter from "./routes/admin.routes.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 8001

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174"
]

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// Mount all admin routes under /api/admin
app.use("/api/admin", adminRouter)

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Admin Backend Server is running", status: "OK" })
})

app.listen(port, () => {
    connectDb()
    console.log(`Admin Backend Server is running on port ${port}`)
})
