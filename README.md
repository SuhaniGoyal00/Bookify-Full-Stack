# 📚 Bookify – Full-Stack Online Bookstore

Bookify is a full-stack online bookstore that allows users to explore books, search by category, manage their shopping cart, and place orders through a simple and interactive interface.

## 📌 Project Overview

Bookify combines a frontend bookstore website with a backend built using Node.js, Express.js, and MongoDB. It provides user authentication, book management, cart functionality, and order processing.

## 🛠️ Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **API:** REST APIs

## ✨ Key Features

- User registration and login
- Secure password hashing and JWT authentication
- Book browsing, searching, and category filtering
- Shopping cart with quantity management
- Checkout and order management
- Coupon code support (`FIRST10`)
- Customer reviews and book requests
- Newsletter subscription
- Guest and registered-user cart support

## 🔄 Project Workflow

1. **User Interface:** Users explore books through the website.
2. **Authentication:** Users can register or log in securely.
3. **Book Management:** The frontend fetches book details through REST APIs.
4. **Cart Management:** Users can add, update, and remove books from their cart.
5. **Checkout:** Users enter their details and place an order.
6. **Database:** MongoDB stores user, book, cart, and order information.
7. **Response:** Express APIs process requests and return responses to the frontend.

## 📂 Project Structure

```text
bookify-fullstack/
│
├── public/                  # Frontend HTML, CSS and JS
├── server/
│   ├── models/              # MongoDB schemas
│   ├── middleware/          # Authentication middleware
│   └── routes/              # REST API routes
│
├── server.js                # Main backend server
├── bookify-integration.js   # Frontend-backend integration
├── seed.js                  # Initial book data
├── package.json
├── .env.example
└── README.md
```

## ⚙️ Installation & Setup

**1. Clone the repository**

```bash
git clone https://github.com/YOUR-USERNAME/Bookify-Full-Stack.git
cd Bookify-Full-Stack
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file using `.env.example` and configure:

- `MONGODB_URI`
- `JWT_SECRET`

**4. Add initial book data**

```bash
npm run seed
```

**5. Start the application**

```bash
npm start
```

Open `http://localhost:5000` in your browser.

## 🔐 Security

- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- Protected routes require valid authentication.
- Environment variables are used for sensitive configuration.

## 💳 Payment Note

The checkout is a demo implementation. It records orders but does not process real payments.

## 🚀 Future Enhancements

- Integrate a secure payment gateway.
- Add an admin dashboard for book management.
- Implement email verification and password recovery.
- Deploy the application online.

## 👩‍💻 Author

**Suhani Goyal**  
B.E. Computer Science Engineering
