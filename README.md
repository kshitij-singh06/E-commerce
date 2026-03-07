# E-Commerce Application

A full-stack e-commerce application built with React, Node.js, Express, Prisma, and PostgreSQL. Features role-based access control, product management with image uploads, shopping cart, and order processing.

**Live Demo:** [Frontend](https://e-commerce-woad-tau.vercel.app/) 

> **Demo Admin:** `admin@demo.com` / `Admin@123`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Material UI, React Router 7 |
| Backend | Node.js, Express 5, Prisma ORM |
| Database | PostgreSQL (Neon) |
| Auth | JWT + bcrypt |
| File Uploads | Multer |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

---

## Features

### Authentication & Authorization
- JWT-based login and registration
- Case-insensitive email handling
- Role-based access control — `ADMIN` and `CUSTOMER` roles
- Protected routes on both frontend and backend

### Product Management (Admin)
- Create, edit, and delete products
- Image upload with preview
- Stock tracking

### Shopping Experience (Customer)
- Browse and search products
- Product detail pages with quantity selection
- Add to cart with stock validation
- Cart management — update quantities, remove items
- Checkout with automatic stock decrement

### Order System
- Atomic order creation using database transactions
- Order history with itemized details
- Admin view of all orders across customers

### UI/UX
- Minimalist dark theme inspired by Linear and Vercel
- Inter font, zinc color palette, indigo accent
- Responsive sidebar layout with role-based navigation
- Toast notifications for user feedback

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app setup, CORS, routes
│   │   ├── server.js               # Server entry point
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Login, register
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   └── order.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── cart.routes.js
│   │   │   └── order.routes.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT verification
│   │   │   ├── role.middleware.js    # Admin-only guard
│   │   │   └── upload.middleware.js  # Multer config
│   │   └── utils/
│   │       └── prisma.js            # Prisma client instance
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Migration history
│   ├── uploads/                     # Product images
│   └── package.json
│
├── frontend/vite-project/
│   ├── src/
│   │   ├── App.jsx                  # Routes, auth state, theme
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── ProductList.jsx          # Product grid with search
│   │   ├── ProductPage.jsx          # Product detail
│   │   ├── AddProduct.jsx           # Admin: create product
│   │   ├── EditProduct.jsx          # Admin: edit product
│   │   ├── Cart.jsx                 # Shopping cart
│   │   ├── Orders.jsx               # Customer order history
│   │   ├── AdminOrders.jsx          # Admin: all orders
│   │   ├── index.css                # Global styles + dark theme
│   │   └── layout/
│   │       └── DashboardLayout.jsx  # Sidebar + top bar
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Endpoints

All protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Protected | Get current user info |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Protected | List all products (supports `?search=`) |
| GET | `/api/products/:id` | Protected | Get single product |
| POST | `/api/products` | Admin | Create product (multipart form) |
| PUT | `/api/products/:id` | Admin | Update product (multipart form) |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Cart
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/cart` | Protected | Get user's cart |
| POST | `/api/cart/:productId` | Protected | Add product to cart |
| PUT | `/api/cart/:id` | Protected | Update item quantity |
| DELETE | `/api/cart/:id` | Protected | Remove item from cart |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Protected | Place order (atomic transaction) |
| GET | `/api/orders` | Protected | Get user's order history |
| GET | `/api/orders/all` | Admin | Get all orders |

---

## Database Schema

```
User          Product        Cart           Order          OrderItem
─────         ───────        ────           ─────          ─────────
id            id             id             id             id
name          name           userId    →    userId    →    orderId   →
email         description    productId →    totalAmount    productId →
password      price          quantity       createdAt      quantity
role          stock                                        price
createdAt     createdAt
              imageUrl
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Then edit .env with your database credentials

npx prisma generate
npx prisma migrate dev
npm run dev                 # Starts on port 5000
```

### Frontend
```bash
cd frontend/vite-project
npm install
cp .env.example .env        # Edit VITE_API_URL if needed
npm run dev                 # Starts on port 5173
```

### Create Admin Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@demo.com","password":"Admin@123","role":"ADMIN"}'
```

---

## Running Tests

### Backend Tests (Jest)
```bash
cd backend
npm test
```

**Unit tests** (`tests/unit.test.js`):
- Password hashing — bcrypt hash/compare correctness
- JWT tokens — generation, verification, rejection of invalid secrets
- Role middleware — admin access granted, non-admin blocked with 403

**API tests** (`tests/api.test.js`):
- `POST /api/auth/register` — user creation, duplicate rejection, validation
- `POST /api/auth/login` — authentication, wrong credentials handling

### Frontend Tests (Vitest)
```bash
cd frontend/vite-project
npm test
```

**Component tests:**
- `Login.test.jsx` — form rendering, button state, navigation links
- `Signup.test.jsx` — form fields, submit button, login redirect link

**Integration test:**
- `api.test.js` — API URL configuration, auth header construction, token flow

---

## Deployment

| Service | Purpose | Config |
|---|---|---|
| **Neon** | PostgreSQL database | Free tier, Singapore region |
| **Render** | Backend API | Root dir: `backend`, Build: `npm install && npm run build`, Start: `npm start` |
| **Vercel** | Frontend | Root dir: `frontend/vite-project`, env: `VITE_API_URL=<render-url>` |

### Environment Variables

**Backend (Render):**
| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `NODE_ENV` | `production` |

**Frontend (Vercel):**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (no trailing slash) |

---

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiry
- Role-based middleware on protected routes
- Email normalization (case-insensitive)
- Input validation on all endpoints
- CORS enabled

---

## Author

**Kshitij Singh** — [@kshitij-singh06](https://github.com/kshitij-singh06)
