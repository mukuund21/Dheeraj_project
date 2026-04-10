# Manufacturing Quotation System

A full-stack web application that allows customers to upload DXF part drawings, configure material and fabrication options, receive an instant price breakdown, and place orders. Administrators can manage order statuses and live pricing configuration.

---

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

---

## Setup

1. **Clone or download the project**

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp ../.env.example .env
   ```

   Open `.env` and fill in all values (see Environment Variables below).

4. **Run the database migration**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed pricing configuration**

   ```bash
   node prisma/seed.js
   ```

6. **Start the backend server**

   ```bash
   npm run dev
   ```

   The server starts on `http://localhost:3000` (or the `PORT` in your `.env`).

7. **Serve the frontend**

   Open `frontend/pages/index.html` in a browser, or serve the `frontend/` folder with any static file server, for example:

   ```bash
   npx serve frontend
   ```

---

## Adding the First Admin User

After registering a normal account through the web UI:

1. Open Prisma Studio:

   ```bash
   cd backend
   npx prisma studio
   ```

2. Open the **User** table, find your account, and change `role` from `customer` to `admin`.

3. Save and log back in — the Admin panel will now be accessible.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default: 3000) |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens |
| `DATABASE_URL` | SQLite file path, e.g. `file:./dev.db` |
| `EMAIL_HOST` | SMTP host for sending confirmation emails (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | SMTP port (typically 587 for TLS) |
| `EMAIL_USER` | Email address used to send mail |
| `EMAIL_PASS` | Password or app password for the email account |
| `ADMIN_EMAIL` | Admin notification email address |
| `UPLOAD_DIR` | Directory where DXF uploads are stored (e.g. `./uploads`) |
| `MAX_FILE_SIZE_MB` | Maximum upload file size in megabytes (default: 10) |

---

## DXF Integration (Important)

The current `dxfService.js` returns **mock geometry** so the quoting flow can be demonstrated end-to-end without a real DXF parser.

To integrate real DXF parsing:

1. Install the parser package:

   ```bash
   cd backend
   npm install dxf-parser
   ```

2. Open `backend/src/services/dxfService.js`.

3. Follow the comment at the top of the file — replace the mock return value with actual parsing logic using the `dxf-parser` library to extract perimeter, bounding box dimensions, and entity count from the uploaded file.

---

## Project Structure

```
.
├── backend/
│   ├── index.js                  # Entry point — Express app setup
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (SQLite)
│   │   └── seed.js               # Seeds pricing configuration
│   └── src/
│       ├── controllers/          # Request handlers
│       │   ├── authController.js
│       │   ├── uploadController.js
│       │   ├── quoteController.js
│       │   ├── orderController.js
│       │   └── adminController.js
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT verification
│       │   ├── adminMiddleware.js # Role check
│       │   ├── errorMiddleware.js # Global error handler
│       │   └── uploadMiddleware.js# Multer DXF upload
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── uploadRoutes.js
│       │   ├── quoteRoutes.js
│       │   ├── orderRoutes.js
│       │   └── adminRoutes.js
│       ├── services/
│       │   ├── dxfService.js     # DXF parsing (mock)
│       │   ├── pricingService.js # Quote calculation
│       │   ├── feasibilityService.js
│       │   ├── orderService.js   # DB operations
│       │   └── emailService.js   # Nodemailer
│       └── utils/
│           ├── generateOrderId.js
│           ├── responseHelper.js
│           └── pendingUploadsStore.js
│
├── frontend/
│   ├── css/
│   │   └── style.css             # Shared stylesheet
│   ├── js/
│   │   ├── api.js                # All fetch calls
│   │   ├── auth.js               # Login & register
│   │   ├── upload.js             # DXF upload flow
│   │   ├── configure.js          # Part configuration
│   │   ├── quote.js              # Price breakdown
│   │   ├── order.js              # Order confirm & dashboard
│   │   ├── tracking.js           # Order status timeline
│   │   └── admin.js              # Admin orders & pricing
│   └── pages/
│       ├── index.html            # Redirect to login
│       ├── login.html
│       ├── register.html
│       ├── upload.html           # Step 1
│       ├── configure.html        # Step 2
│       ├── quote.html            # Step 3
│       ├── order-confirm.html    # Step 4
│       ├── order-tracking.html
│       ├── dashboard.html
│       ├── admin.html
│       └── admin-pricing.html
│
└── .env.example
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| POST | `/api/upload` | User | Upload a DXF file |
| POST | `/api/quote` | User | Calculate a price quote |
| POST | `/api/order` | User | Place an order |
| GET | `/api/order/my` | User | List current user's orders |
| GET | `/api/order/:id` | User | Get order by ID (own or admin) |
| GET | `/api/admin/orders` | Admin | List all orders with filters |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/config` | Admin | Get pricing configuration |
| PUT | `/api/admin/config` | Admin | Update a pricing config value |
