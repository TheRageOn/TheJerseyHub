# **Part 1: Backend API Architecture & Route Planning** 

Building on your existing authentication (/api/auth/register, /api/auth/login), here is the complete API map categorized by resource files. 

## **1. User & Profile Routes (/api/users)** 

- GET /api/users/profile (Protected - Customer/Admin): Fetch logged-in user's profile details. 

- PUT /api/users/profile (Protected - Customer/Admin): Update user profile details (name, phone). 

- PUT /api/users/change-password (Protected - Customer/Admin): Update current password securely. 

- GET /api/users (Protected - Admin): Get all registered users (supports pagination/filtering). 

- PATCH /api/users/:id/block (Protected - Admin): Toggle user block/unblock status (isBlocked). 

- DELETE /api/users/:id (Protected - Admin): Delete a user account. 

## **2. Product Routes (/api/products)** 

- GET /api/products (Public): Get all products with filtering options (category, teamName, price range, search query). 

- GET /api/products/:id (Public): Get single product details by ID. 

- POST /api/products (Protected - Admin): Add a new jersey product (with sizes, stock, and images). 

- PUT /api/products/:id (Protected - Admin): Update jersey details, pricing, or stock. 

- DELETE /api/products/:id (Protected - Admin): Delete a jersey product. 

## **3. Cart Routes (/api/cart)** 

- GET /api/cart (Protected - Customer): View user's current shopping cart items and quantities. 

- POST /api/cart (Protected - Customer): Add an item or update quantity of a jersey size in the cart. 

- DELETE /api/cart/:productId/:size (Protected - Customer): Remove a specific item size from the cart. 

- DELETE /api/cart (Protected - Customer): Clear the entire shopping cart. 

## **4. Order Routes (/api/orders)** 

- POST /api/orders (Protected - Customer): Checkout cart items, create a new order (Cash on Delivery), and deduct inventory stock. 

- GET /api/orders/my-orders (Protected - Customer): View order history for the logged-in customer. 

- GET /api/orders (Protected - Admin): View all platform orders (supports status filtering). 

- PUT /api/orders/:id/status (Protected - Admin): Update order status (pending, processing, shipped, delivered, cancelled). 

- DELETE /api/orders/:id (Protected - Admin): Delete an order record. 

## **5. Analytics Routes (/api/analytics)** 

- GET /api/analytics/sales (Protected - Admin): Retrieve aggregated sales stats broken down weekly, monthly, and yearly. 

## **Part 2: Backend Folder & File Blueprint** 

## **Based on your folder snapshot, here is the exact file distribution you should create inside backend/:** 

- **config/** 

   - db.js: Mongoose database connection setup. 

- **controllers/** 

   - user.controller.js: Profile management, user listing, block/unblock logic. 

   - product.controller.js: CRUD logic for jerseys and search/filter handlers. 

   - cart.controller.js: Fetch cart, add/update items, clear cart logic. 

   - order.controller.js: Order placement, stock reduction, status updates. 

   - analytics.controller.js: Aggregate calculations for weekly/monthly/yearly sales. 

- **middlewares/** 

   - auth.middleware.js: Verify JWT tokens and check admin roles (isAdmin). 

   - validateAuth.js: Request body validation rules. 

- **model/** 

   - Cart.js, Order.js, Product.js, User.js _(Already created)_ 

## • **routes/** 

   - user.routes.js, product.routes.js, cart.routes.js, order.routes.js, analytics.routes.js 

- **services/** 

   - auth.service.js, product.service.js, order.service.js: Reusable business logic layers for database transactions. 

- **Utils/** 

   - generateToken.js, apiError.js, catchAsync.js: Helper functions for error handling and JWT tokens. 

- **app.js:** Express app initialization, global middlewares (cors, express.json), and route mounting. 

- **server.js:** HTTP server listener importing configuration from app.js. 

# **Part 3: Next.js Frontend Architecture & Pages** 

## **1. Folder Structure** 

frontend/ 

├── src/ 

- │   ├── app/ 

- │   │   ├── (auth)/ 

- │   │   │   ├── login/page.jsx 

- │   │   │   └── register/page.jsx 

- │   │   ├── (customer)/ 

- │   │   │   ├── page.jsx (Home) 

- │   │   │   ├── shop/page.jsx (Product catalog & filters) 

- │   │   │   ├── product/[id]/page.jsx (Product details) 

- │   │   │   ├── cart/page.jsx (Cart management) 

- │   │   │   ├── checkout/page.jsx (Shipping & COD order placement) 

- │   │   │   ├── profile/page.jsx (Profile & password update) 

- │   │   │   └── orders/page.jsx (Customer order history) 

- │   │   ├── admin/ 

- │   │   │   ├── dashboard/page.jsx (Sales statistics & metrics) 

- │   │   │   ├── products/page.jsx (Manage jerseys CRUD) 

- │   │   │   ├── users/page.jsx (Manage users & block statuses) 

- │   │   │   └── orders/page.jsx (Manage all user orders) 

- │   │   ├── layout.jsx 

- │   │   └── providers.jsx 

- │   ├── components/ 

- │   │   ├── common/ (Navbar, Footer, Sidebar, Modals) 

- │   │   ├── cards/ (ProductCard, OrderCard) 

- │   │   └── ui/ (Buttons, Inputs, Badges) 

- │   ├── context/ (AuthContext, CartContext) 

- │   └── services/ (Axios API wrappers) 

## **2. 1. Navbars & Navigation Strategy** 

## • **Customer Navbar:** 

- Features the brand logo ("TheJerseyHub"). 

- Contains navigational links to Home and Shop. 

- Includes a live search bar for quick jersey lookups. 

- Includes a Cart icon equipped with a real-time badge counter displaying the total items added. 

- Includes a User Dropdown menu containing links for Profile, My Orders, and Logout (or Login if unauthenticated). 

## • **Admin Sidebar/Navbar:** 

- An isolated, secure layout structure designed exclusively for administrative management. 

- Features persistent navigation links directing the admin to the Dashboard, Products Management, Users Management, and Orders Management. 

- Includes an explicit Logout action to securely terminate the admin session. 

## **2. Customer Pages & Section Breakdown** 

- **Home Page (/)** 

   - _Hero Section:_ High-impact visual banner showcasing the latest club and country jersey arrivals, paired with a prominent "Shop Now" call-toaction button. 

   - _Featured Products Section:_ Responsive grid layout highlighting handpicked or featured jerseys currently trending on the platform. 

   - _Category Showcase Section:_ Interactive quick-access cards allowing users to instantly filter or navigate directly to Club, Nation, or Special edition categories. 

## • **Shop / Catalog Page (/shop)** 

   - _Filter Sidebar Section:_ Comprehensive filtering tools allowing users to narrow products down by category, specific team names, a dynamic price range slider, and size availability. 

   - _Product Grid Section:_ Dynamic layout rendering the filtered list of jerseys with responsive pagination or infinite scrolling. 

- **Product Details Page (/product/[id])** 

   - _Gallery Section:_ Image display featuring thumbnail previews alongside a main high-resolution image viewer. 

   - _Details & Action Section:_ Displays the jersey name, regular price, discounted price, stock availability indicators per size via an interactive size selector, a quantity picker, and an "Add to Cart" action button. 

- **Cart Page (/cart)** 

   - _Cart Items List Section:_ Table or list view detailing selected jersey images, chosen sizes, item quantities, and individual price calculations. 

   - _Summary Section:_ Calculates total suborders, provides a "Clear Cart" action button, and features a "Proceed to Checkout" button to initiate the Cash on Delivery order process. 

## **3. Admin Pages & Section Breakdown** 

- **Admin Dashboard (/admin/dashboard)** 

   - _Metrics Overview Cards Section:_ High-level statistical cards displaying key performance indicators, including Total Revenue, Total Orders, and Total Active Customers. 

   - _Sales Analytics Section:_ Graphical visual data representations and charts tracking revenue performance across weekly, monthly, and yearly timeframes. 

- **Admin Products Management Page (/admin/products)** 

   - _Product Inventory Table:_ A structured tabular view displaying all registered jerseys, including thumbnail images, names, categories, team names, base prices, and stock counts per size. 

   - _Product Actions Panel:_ Interface controls allowing the administrator to trigger modals or redirect to forms for adding a new jersey, updating existing details/pricing, or deleting a product from the database. 

## • **Admin Users Management Page (/admin/users)** 

   - _Customer Accounts List:_ Tabular overview showing registered customer details, including names, emails, phone numbers, and account statuses. 

   - _Account Control Panel:_ Action buttons enabling the administrator to toggle user block/unblock permissions (isBlocked) or remove unauthorized accounts. 

- **Admin Orders Management Page (/admin/orders)** 

- _All Orders Feed:_ Comprehensive list of all customer orders placed across the platform, including user references, shipping details, items purchased, and total payment amounts. 

- _Order Fulfillment Panel:_ Interactive dropdowns/controls allowing the admin to dynamically update order fulfillment statuses (pending, processing, shipped, delivered, cancelled) or delete invalid order records. 

# **Part 4: Backend Execution Sprints** 

- **Sprint 1: Core Product & User Management APIs** 

   - Build product CRUD endpoints (/api/products) with image storage paths and size/stock rules. 

   - Build user administration endpoints (/api/users) including profile updates and user blocking functionality. 

- **Sprint 2: Shopping Cart & Checkout Logic** 

   - Implement cart management APIs (/api/cart). 

   - Implement order creation and management endpoints (/api/orders) tied with Cash on Delivery and inventory stock decrement validation. 

### `o` 

- **Sprint 3: Sales Analytics & Final Polish** 

   - Implement sales aggregation queries (/api/analytics/sales) to group data by weekly, monthly, and yearly metrics. 

   - Perform end-to-end integration testing of all routes using Postman. 

# **<u>Project description:</u>** 

**TheJerseyHub** is a full-stack e-commerce web application built with a Next.js frontend and an Express.js backend using MongoDB (Mongoose). It functions as an online store specializing in football jerseys across three categories: Club, Nation, and Special editions. The platform features dual-role access: **Users** can browse products, filter by team/category/size, manage a shopping cart, place Cash on Delivery (COD) orders, and update their profiles; **Administrators** have complete control over product inventory (CRUD), user management (view/block), order lifecycle management, and visual access to weekly, monthly, and yearly sales analytics. 

# **<u>Detail breakdown of backend file/folder:</u>** 

## **1. config/ Directory** 

- **db.js** : 

   - **What to do** : Establish a reliable bridge between your Node.js application and your MongoDB database. 

- **How to do it** : Utilize the Mongoose connection utility method by passing your MongoDB URI string stored in your environment variables. Implement event handling or try-catch blocks to capture connection errors, log a success indicator when connected, and gracefully terminate the process if the connection fails at startup. 

## **2. Utils/ Directory** 

## • **generateToken.js** : 

- **What to do** : Create a helper function that generates a cryptographically signed JSON Web Token (JWT) containing a user's unique identifier and role. 

- **How to do it** : Use the standard JWT signing library, passing the user ID and role as payload data, a secret key from environment variables, and an expiration time configuration (such as 7 days) to ensure active sessions persist appropriately. 

## • **apiError.js** : 

- **What to do** : Build a custom error class extending the native JavaScript Error object to support custom HTTP status codes and operational error states. 

- **How to do it** : Create a class constructor that accepts a status code and message. Automatically assign a status type flag (differentiating between client-side fail responses versus server-side error responses based on the HTTP code range) to streamline error responses sent down to the frontend. 

## • **catchAsync.js** : 

- **What to do** : Implement a higher-order wrapper function to eliminate repetitive try-catch blocks across all asynchronous controller functions. 

- **How to do it** : Design a function that takes an asynchronous route handler as its argument, executes it, and automatically catches any rejected promises, passing them forward into Express's global errorhandling middleware stack via the next function. 

## **3. middlewares/ Directory** 

## • **auth.middleware.js** : 

- **What to do** : Protect sensitive routes by verifying user identity and restricting access based on user roles (Customer vs. Admin). 

- **How to do it** : 

      - _Authentication (protect)_ : Extract the token from the incoming request's Authorization header (Bearer token format), verify its signature using your JWT secret, query the database to confirm the user account still exists and is not blocked, and attach the user document to the request object (req.user). 

      - _Authorization (adminOnly)_ : Inspect req.user.role to ensure it equals "admin" before allowing access to administrative actions; otherwise, reject the request with a forbidden status error. 

- **validate.middleware.js** : 

   - **What to do** : Validate incoming request bodies against strict rule sets before they hit your controllers. 

   - **How to do it** : Accept a validation schema as an argument, check the request body against it, and if validation errors occur, aggregate the error messages and pass an operational client error to the error handler. 

## **4. services/ Directory (Business Logic Layer)** 

- **auth.service.js** : 

   - **What to do** : Handle the core database operations required for user registration and authentication. 

   - **How to do it** : Write modular functions to check for duplicate emails during registration, generate secure cryptographic password hashes using salt rounds, compare input passwords against stored hashes during login, and return clean user objects. 

- **product.service.js** : 

   - **What to do** : Handle complex query filtering logic for the product catalog. 

   - **How to do it** : Construct dynamic Mongoose query objects based on incoming query parameters (such as searching by name, matching categories, filtering team names, matching size inventory arrays, or defining price range boundaries). 

- **order.service.js** _(Optional separation)_ : 

   - **What to do** : Encapsulate transaction logic for order creation. 

   - **How to do it** : Manage multi-step database procedures like verifying cart items, decrementing size-specific product stocks, calculating total amounts, and clearing carts inside a cohesive procedural layer. 

## **5. controllers/ Directory** 

## • **user.controller.js** : 

- **What to do** : Process user-facing profile requests and administrative user-management actions. 

- **How to do it** : 

   - Retrieve or update the authenticated user's profile information (name, phone). 

   - Handle secure password updates by verifying the current password and saving the newly hashed version. 

   - Allow administrators to fetch a list of registered customers and toggle user account block statuses (isBlocked). 

## • **product.controller.js** : 

- **What to do** : Implement catalog management workflows for admins and public product viewing endpoints. 

- **How to do it** : Handle fetching filtered product lists, finding individual products by ID, creating new jerseys with nested size and stock attributes, updating product fields, and deleting products from the database. 

## • **cart.controller.js** : 

- **What to do** : Manage user shopping cart state operations. 

- **How to do it** : Fetch a user's active cart populated with product details, handle adding items or updating quantities for specific sizes (incrementing existing items or pushing new ones), remove individual item-size variations, and clear the entire cart array. 

## • **order.controller.js** : 

- **What to do** : Handle the full lifecycle of Cash on Delivery orders and status changes. 

- **How to do it** : Validate that carts are non-empty, loop through items to check and decrement stock levels safely, calculate final pricing based on regular or discount prices, store shipping address snapshots, create the order document, clear the user's cart, and allow admins to update order fulfillment statuses or delete records. 

## • **analytics.controller.js** : 

- **What to do** : Calculate and aggregate business revenue metrics over different timeframes. 

- **How to do it** : Use MongoDB aggregation pipelines ($match and $group) to filter non-cancelled orders created within the current week, month, and year boundaries, summing up total revenue amounts and order counts to return to the admin dashboard. 

## **6. routes/ Directory** 

- **user.routes.js** : Map endpoints for profile management, password updates, admin customer listings, and user blocking to their respective controller methods, securing them with authentication and role-checking middlewares. 

- **product.routes.js** : Define public endpoints for browsing/searching products and protected admin endpoints for creating, updating, and deleting jerseys. 

- **cart.routes.js** : Define protected customer-only endpoints to fetch, add to, remove items from, or clear the shopping cart. 

- **order.routes.js** : Map endpoints for placing cash-on-delivery orders, viewing personal order histories, and allowing admins to view all orders, modify statuses, or delete orders. 

- **analytics.routes.js** : Expose a protected admin-only endpoint to fetch aggregated weekly, monthly, and yearly sales statistics. 

## **7. Global Setup Files** 

- **app.js** : 

   - **What to do** : Initialize the Express application instance and wire up application-wide configurations. 

   - **How to do it** : Apply global middleware like CORS to allow frontend communication and JSON body parsers. Mount all modular route files under designated prefix paths (e.g., /api/users, /api/products). Add a catch-all route handler for undefined endpoints and implement the centralized global error-handling middleware at the very bottom. 

- **server.js** : 

   - **What to do** : Bootstrap the application process. 

   - **How to do it** : Load environment configuration files, trigger the database connection setup, import the configured Express app from app.js, and start the HTTP server listening on your specified port. 

