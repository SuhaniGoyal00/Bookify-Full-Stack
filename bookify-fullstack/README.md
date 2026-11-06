# Bookify — Full-Stack Bookstore

Bookify keeps the **original uploaded frontend files unchanged**. The HTML, CSS and existing JavaScript are in `public/`. Express serves those pages and injects the separate `bookify-integration.js` bridge at response time. The original files are therefore not edited to add backend behavior.

## Technology stack
- Frontend: original HTML, CSS, JavaScript (unchanged)
- Backend: Node.js, Express.js, REST API
- Database: MongoDB with Mongoose
- Authentication: bcrypt password hashing + JWT

## Features
- Sign up, login, hashed passwords and JWT-protected profile/order history endpoint
- Book catalogue API, search and category filtering
- Persistent guest/user cart stored in MongoDB
- `FIRST10` coupon (10% demo discount)
- Checkout and order records stored in MongoDB
- Customer reviews, book requests and newsletter subscriptions stored in MongoDB
- Original frontend layout/styles are preserved; integration code is a separate file

## Requirements
Install Node.js 18+ and MongoDB Community Server, or create a MongoDB Atlas database.

## Run locally
1. Extract this folder and open it in VS Code.
2. Open a terminal in the `bookify-fullstack` folder.
3. Install packages:
   ```bash
   npm install
   ```
4. Create `.env` by copying `.env.example`. Set your MongoDB connection string and a long random JWT secret.
5. Make sure MongoDB is running locally (or use your Atlas URI).
6. Add the initial catalogue:
   ```bash
   npm run seed
   ```
7. Start the app:
   ```bash
   npm start
   ```
8. Open **http://localhost:5000** (do not open the HTML files directly with file://).

## Demo checkout safety
The payment page in the supplied frontend is a visual checkout form. This project records an order using a **demo checkout**; it does not process real card payments. Card number and CVV are not sent to the server or stored. For real payments, integrate a payment provider's hosted/secure checkout and never store raw card data.

## Main API routes
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API health |
| GET | `/api/books` | List/search books (`?search=` / `?category=`) |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Current signed-in user |
| GET/POST | `/api/cart`, `/api/cart/items` | Read/add cart items |
| PATCH/DELETE | `/api/cart/items/:itemId` | Change/remove cart item |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/orders` | Place order from cart |
| GET | `/api/orders/my` | Signed-in user's orders |
| GET/POST | `/api/reviews` | Read/create reviews |
| POST | `/api/requests` | Submit a book request |
| POST | `/api/newsletter` | Subscribe email |

## Important notes
- The cart is associated with the signed-in account when logged in; otherwise it uses a browser guest ID. Guest carts are browser-specific.
- This is a learning/resume project. Before public deployment, add production-grade validation, CSRF protection where applicable, email verification/password reset, admin authorization, logging, backups, and a real payment provider.
- `public/` contains your original uploaded files. Do not edit them if you want to preserve the exact frontend. Backend connection logic lives in the root `bookify-integration.js` and is injected by `server.js` when serving HTML.
