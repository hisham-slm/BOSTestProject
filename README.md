# Full Stack E-commerce web application

## Frontend

### Routes
- Index
- Signup
- Login
- Products
- Admin Login
- Admin Carts

### Tech Stack
- Astro

### Environment Variables
Add these to your `.env` file:
```
PUBLIC_API = "http://localhost:3000"
DOMAIN = "http://localhost:4321"
```

## Backend

### Routes
- `POST /signup`
- `POST /login`
- `GET /websocket` (to get cart data)

#### Admin Routes
- `POST /admin/gen_password`
- `POST /admin/login`
- `GET /admin/cart_items`

#### Customer Routes
- `GET /customer/products`
- `POST /customer/add_to_cart`

### Middleware
- `authenticateAdmin`: to authenticate the admin with cookies
- `authenticateUser`: to authenticate user
- `socketAdminAuth`: to authenticate admin for the websocket protocol

### Models
- Admin
- User
- Product

### Environment Variables
Add these to your `.env` file:
```
REFRESH_TOKEN = "complete_secure_refresh_token"
ACCESS_TOKEN = "complete_secure_access_token"
ADMIN_ACCESS_TOKEN = "complete_secure_admin_access_token"
ADMIN_REFRESH_TOKEN = "complete_secure_admin_refresh_token"
NODE_ENV = "development"
```

### Tech Stack
- JavaScript
- MongoDB
- Express.js: framework for backend
- bcrypt: for generating and salting the hash passwords
- cors: for CORS
- cookie-parser: for parsing the cookies
- dotenv: for environment variables
- jsonwebtoken: for creating JSON Web Tokens
- mongoose: for connecting to the MongoDB database
- socket.io: for websocket protocol
