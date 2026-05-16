# 🍽️ TasteTrail

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)](#)
[![Backend](https://img.shields.io/badge/Backend-Node%20%2B%20Express-green)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen)](#)
[![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-ff69b4)](#)

> A full-stack Food Ordering & Delivery Tracking app with realtime location updates, shop/item management, and secure authentication.

---

## 📌 Overview

TasteTrail lets users discover nearby shops, browse food items, place orders, and track delivery status in real time. Owners can create and manage shops and items. Delivery updates and delivery-boy location tracking are powered by **WebSockets (Socket.IO)**.

---

## ✨ Features

- 🔐 User authentication (Sign Up / Sign In)
- 🧩 OTP-based verification and password reset flow
- 🏪 Shop management (create/edit, get by city)
- 🍕 Item management (add/edit, search, rating)
- 🧾 Order placement and order history
- 💳 Payment verification (backend endpoint included)
- 🛰️ Realtime delivery tracking using Socket.IO
- 📍 Delivery location updates and live status transitions

---

## 🧰 Tech Stack

### Frontend

- ⚛️ React
- ⚡ Vite
- 🧭 React Router
- 🪝 Redux Toolkit
- 🎨 Tailwind CSS
- 🗺️ Leaflet (maps)
- 🔌 Socket.IO client

### Backend

- 🟢 Node.js
- 🌐 Express
- 🔒 Authentication middleware (`isAuth`)
- 🧠 MongoDB + Mongoose
- 🧵 Socket.IO server
- 🖼️ Multer (uploads)
- ☁️ Cloudinary (image handling)
- ✉️ Nodemailer (email)
- 💳 Razorpay (payment dependency)

---

## 🗂️ Project Structure

```txt
TasteTrail/
├─ backend/
│  ├─ config/
│  │  └─ db.js
│  ├─ controllers/
│  │  ├─ auth.controllers.js
│  │  ├─ item.controllers.js
│  │  ├─ order.controllers.js
│  │  ├─ shop.controllers.js
│  │  └─ user.controllers.js
│  ├─ middlewares/
│  │  ├─ isAuth.js
│  │  └─ multer.js
│  ├─ models/
│  │  ├─ deliveryAssignment.model.js
│  │  ├─ item.model.js
│  │  ├─ order.model.js
│  │  ├─ shop.model.js
│  │  └─ user.model.js
│  ├─ routes/
│  │  ├─ auth.routes.js
│  │  ├─ item.routes.js
│  │  ├─ order.routes.js
│  │  ├─ shop.routes.js
│  │  └─ user.routes.js
│  ├─ utils/
│  │  ├─ cloudinary.js
│  │  ├─ mail.js
│  │  └─ token.js
│  ├─ socket.js
│  ├─ index.js
│  └─ package.json
│
├─ frontend/
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ redux/
│  │  ├─ assets/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ index.html
│  └─ package.json
│
├─ chatbot.html
└─ README.md
```

---

## 🧑‍🔧 Installation Steps (Step-by-step)

### ✅ 1) Prerequisites

- Node.js installed (LTS recommended)
- MongoDB available (local or MongoDB Atlas)

---

### 🧱 2) Backend Setup

1. Open terminal in the project root.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create and configure environment variables (create a `.env` file in `backend/`).
4. Start backend:
   ```bash
   npm run dev
   ```

Backend runs at:

- 🌐 `http://localhost:8000`

---

### 🎨 3) Frontend Setup

1. In a new terminal:
   ```bash
   cd frontend
   npm install
   ```
2. Start frontend:
   ```bash
   npm run dev
   ```

Frontend runs at:

- 🖥️ `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

Add the following (use real values):

```bash
# Server
PORT=8000

# Database
MONGODB_URL=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
MAIL_HOST=smtp.yourprovider.com
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASS=your_email_password

# Razorpay (payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

> Note: If you already have `.env` values, you can reuse them. Variable names can differ if your `.env` file already exists.

---

## ▶️ How to Run the Project

1. Start MongoDB (if running locally).
2. Start backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```
4. Open the frontend in your browser:
   - `http://localhost:5173`

---

## 🌐 API Endpoints

Base API URL:

- `http://localhost:8000/api`

> Many endpoints require authentication (`isAuth`).

### 🔐 Auth

| Method | Endpoint                 | Auth   |
| ------ | ------------------------ | ------ |
| POST   | `/auth/signup`         | No     |
| POST   | `/auth/signin`         | No     |
| GET    | `/auth/signout`        | ✅ Yes |
| POST   | `/auth/send-otp`       | No     |
| POST   | `/auth/verify-otp`     | No     |
| POST   | `/auth/reset-password` | No     |
| POST   | `/auth/google-auth`    | No     |

### 👤 User

| Method | Endpoint                  | Auth   |
| ------ | ------------------------- | ------ |
| GET    | `/user/current`         | ✅ Yes |
| POST   | `/user/update-location` | ✅ Yes |

### 🏪 Shop

| Method | Endpoint                    | Auth   |
| ------ | --------------------------- | ------ |
| POST   | `/shop/create-edit`       | ✅ Yes |
| GET    | `/shop/get-my`            | ✅ Yes |
| GET    | `/shop/get-by-city/:city` | ✅ Yes |

### 🍕 Item

| Method | Endpoint                      | Auth   |
| ------ | ----------------------------- | ------ |
| POST   | `/item/add-item`            | ✅ Yes |
| POST   | `/item/edit-item/:itemId`   | ✅ Yes |
| GET    | `/item/get-by-id/:itemId`   | ✅ Yes |
| GET    | `/item/delete/:itemId`      | ✅ Yes |
| GET    | `/item/get-by-city/:city`   | ✅ Yes |
| GET    | `/item/get-by-shop/:shopId` | ✅ Yes |
| GET    | `/item/search-items`        | ✅ Yes |
| POST   | `/item/rating`              | ✅ Yes |

### 🧾 Order

| Method | Endpoint                                  | Auth   |
| ------ | ----------------------------------------- | ------ |
| POST   | `/order/place-order`                    | ✅ Yes |
| POST   | `/order/verify-payment`                 | ✅ Yes |
| GET    | `/order/my-orders`                      | ✅ Yes |
| GET    | `/order/get-assignments`                | ✅ Yes |
| GET    | `/order/get-current-order`              | ✅ Yes |
| POST   | `/order/send-delivery-otp`              | ✅ Yes |
| POST   | `/order/verify-delivery-otp`            | ✅ Yes |
| POST   | `/order/update-status/:orderId/:shopId` | ✅ Yes |
| GET    | `/order/accept-order/:assignmentId`     | ✅ Yes |
| GET    | `/order/get-order-by-id/:orderId`       | ✅ Yes |
| GET    | `/order/get-today-deliveries`           | ✅ Yes |

---

## 🖼️ Screenshots

Add screenshots for a better GitHub experience.

Example:

- ![Home Screen](./docs/screenshots/home.png)
- ![Sign In](./docs/screenshots/signin.png)
- ![Checkout](./docs/screenshots/checkout.png)
- ![Order Tracking](./docs/screenshots/track-order.png)

> Tip: Create `docs/screenshots/` and commit image files there.

---

## 🛡️ Security Features

- 🔐 Passwords hashed with **bcryptjs**
- 🧾 Route protection using `isAuth`
- 🍪 Cookie-based middleware support (`cookie-parser`)
- 🧩 OTP verification for sensitive flows (sign up verification/reset)
- 🧠 JWT utilities in `backend/utils/token.js`
- 🛰️ Realtime updates rely on socket identity registration

---

## 🚀 Deployment Instructions

### 🌍 Deploy Frontend (Vercel / Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the build output using Vercel/Netlify.
3. Update your backend URL usage (recommended):
   - In your app, `frontend/src/App.jsx` currently uses `http://localhost:8000`.
   - For production, switch to an environment variable.

### 🌍 Deploy Backend (Render / Fly.io / Railway / Heroku)

1. Set environment variables:
   - `PORT`
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_*`
   - `MAIL_*`
   - `RAZORPAY_*`
2. Deploy with a Node.js build command that runs your server.

### 🛰️ Socket.IO CORS Notes

When deploying, ensure **CORS origins** match your deployed frontend domain in:

- `backend/index.js` (Socket.IO CORS)
- `backend/index.js` (Express CORS)

---

## 🔮 Future Improvements

- 🧪 Add automated tests (unit/integration)
- 📚 Add API documentation using Swagger/OpenAPI
- 🚦 Add rate limiting for auth endpoints
- 🔄 Implement refresh tokens (stronger session management)
- 👥 Improve role-based access control (Owner/Delivery/User)
- ⚙️ Replace hardcoded URLs with environment variables on the frontend
- ⚡ Performance improvements (caching & query optimization)

---

## 👨‍💻 Author

- Rashmi Ranjan Sahoo
- Densi Thumahar
--------------

## 📝 License

Licensed under the **ISC** License.
