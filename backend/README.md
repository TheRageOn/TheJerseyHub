# The Jersey Hub Backend Documentation

This backend folder is the server side of the The Jersey Hub project. It handles:

- user registration and login
- JWT authentication
- MongoDB database connection
- user data management
- API routing for the frontend

The backend is built using:

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

---

## 1. Project Purpose

This backend is responsible for all logic that happens behind the scenes in the application. It does not show UI to the user. Instead, it:

- receives requests from the frontend
- validates data
- connects to the database
- processes user actions
- sends responses back to the client

Example actions include:

- creating a new user account
- logging in a user
- checking if a user is authorized to access a protected route
- generating secure tokens for session handling

---

## 2. Main Folder Structure

```bash
backend/
├── app.js
├── server.js
├── package.json
├── .env
├── .env.example
├── config/
│   └── db.js
├── controllers/
│   └── auth.controller.js
├── middlewares/
│   └── auth.middleware.js
├── model/
│   └── User.js
├── routes/
│   ├── auth.routes.js
│   └── user.routes.js
├── services/
│   └── auth.service.js
├── Utils/
│   └── generateToken.js
└── README.md
```

---

## 3. File-by-File Explanation

### 3.1 app.js

Purpose:
This file creates the Express application and sets up general middleware.

Code breakdown:

```javascript
const express = require("express");

const authRoutes = require("./routes/auth.routes");
const morgan = require("morgan");
const app = express();
```

What this does:

- `express()` creates the app server
- `require("./routes/auth.routes")` imports all route definitions for authentication
- `morgan("dev")` logs HTTP requests in a simple format during development

```javascript
app.use(express.json());
app.use(morgan("dev"));
```

What this does:

- `express.json()` allows the app to read JSON data sent from the frontend
- `morgan("dev")` shows request information in the console such as HTTP method and route

```javascript
app.use("/api/auth", authRoutes);
```

What this does:

- all authentication-related routes are grouped under the `/api/auth` prefix
- example: `/api/auth/register`, `/api/auth/login`

```javascript
module.exports = app;
```

What this does:

- exports the app so that `server.js` can start the server

---

### 3.2 server.js

Purpose:
This file starts the backend server and connects the database.

Code breakdown:

```javascript
require("dotenv").config();
```

What this does:

- loads environment variables from the `.env` file
- allows the project to use values like `PORT`, `MONGO_URI`, and `JWT_SECRET`

```javascript
const app = require("./app");
const connectDB = require("./config/db");
```

What this does:

- imports the Express app and the database connection function

```javascript
connectDB();
```

What this does:

- starts the MongoDB connection immediately when the server runs

```javascript
const PORT = process.env.PORT || 5000;
```

What this does:

- sets the server port
- default is `5000` if no port is defined in the environment variables

```javascript
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

What this does:

- starts the Node.js server
- prints a message to confirm the app is running

---

### 3.3 config/db.js

Purpose:
This file connects the application to MongoDB.

Code breakdown:

```javascript
const mongoose = require("mongoose");
```

What this does:

- import the Mongoose library
- Mongoose is used to interact with MongoDB in an easier way

```javascript
const connectDB = async () => {
```

What this does:

- defines an async function to connect to the database
- this function runs when the server starts

```javascript
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully");
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
}
```

What this does:

- tries to connect with the MongoDB URL from the `.env` file
- if the connection succeeds, it logs a success message
- if it fails, it logs the error and stops the app

```javascript
module.exports = connectDB;
```

What this does:

- exports the database connection function for use in `server.js`

---

### 3.4 model/User.js

Purpose:
This file defines the database structure for a user.

The schema describes what fields a user document in MongoDB must have.

Code breakdown:

```javascript
const mongoose = require("mongoose");
```

What this does:

- imports mongoose so that we can create a schema model

```javascript
const userSchema = new mongoose.Schema(
```

What this does:

- starts defining the blueprint of the user collection

#### name field

```javascript
name: {
  type: String,
  required: true,
  trim: true,
},
```

Purpose:

- stores the user's name
- `required: true` means every user must have a name
- `trim: true` removes extra spaces

#### email field

```javascript
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
},
```

Purpose:

- stores the user's email
- `unique: true` ensures no two users share the same email
- `lowercase: true` makes email values consistent

#### password field

```javascript
password: {
  type: String,
  required: true,
  minlength: 6,
},
```

Purpose:

- stores the hashed password
- `minlength: 6` ensures password is not too short

#### phone field

```javascript
phone: {
  type: String,
  required: true,
  trim: true,
},
```

Purpose:

- stores the phone number
- is required for each user

#### role field

```javascript
role: {
  type: String,
  enum: ["customer", "admin"],
  default: "customer",
},
```

Purpose:

- defines the user type
- possible values are `customer` or `admin`
- default is `customer`

#### isBlocked field

```javascript
isBlocked: {
  type: Boolean,
  default: false,
},
```

Purpose:

- controls whether a user is blocked from access
- default is `false`, meaning they are active

```javascript
{
  timestamps: true,
},
```

Purpose:

- automatically adds `createdAt` and `updatedAt` fields to every user document

```javascript
module.exports = mongoose.model("User", userSchema);
```

What this does:

- creates a MongoDB model called `User`
- this model will be used in the login and registration logic

---

### 3.5 routes/auth.routes.js

Purpose:
This file defines all authentication endpoints.

Code breakdown:

```javascript
const express = require("express");
const router = express.Router();
```

What this does:

- creates an Express router
- this router is used to define endpoints for authentication

```javascript
const authController = require("../controllers/auth.controller");
```

What this does:

- imports the authentication controller
- the controller contains the logic that handles each request

#### Register route

```javascript
router.post("/register", authController.registerUser);
```

Purpose:

- creates a `POST /api/auth/register` endpoint
- frontend sends user details here
- this route calls `registerUser` in the controller

#### Login route

```javascript
router.post("/login", authController.loginUser);
```

Purpose:

- creates a `POST /api/auth/login` endpoint
- this route authenticates users and returns a token

#### Forgot password route

```javascript
router.post("/forget-   password", authController.forgetPassword);
```

Purpose:

- intended to handle password reset requests
- however this route is written with an invalid route path due to extra spaces in the URL
- it also references `forgetPassword`, which is not implemented in the controller

```javascript
module.exports = router;
```

What this does:

- exports the route object so app.js can mount it

---

### 3.6 routes/user.routes.js

Purpose:
This file is created to handle user-specific routes.

Current state:
This file is incomplete and only imports Express and a controller.

Code breakdown:

```javascript
const express = require("express");
const router = express.Router();
```

What this does:

- creates a new router instance for user-related endpoints

```javascript
const userController = require("../controllers/user.controller");
```

What this does:

- imports the user controller
- this file is meant to store routes such as profile access or other user actions

At the moment, no endpoints are defined here, so this file is not yet active in functionality.

---

### 3.7 controllers/auth.controller.js

Purpose:
This controller receives HTTP requests and passes them to the service layer.

It is the bridge between routes and business logic.

Code breakdown:

```javascript
const authService = require("../services/auth.service");
```

What this does:

- imports the auth service
- service contains the real logic for registration and login

#### Register controller

```javascript
exports.registerUser = async (req, res) => {
```

Purpose:

- handles the registration API request

```javascript
const user = await authService.registerUser(req.body);
```

What this does:

- calls the service function with the data sent from the frontend

```javascript
res.status(201).json({
  success: true,
  message: "User registered successfully",
  data: user,
});
```

Purpose:

- sends a successful response with HTTP status `201` (created)
- returns the new user data

```javascript
} catch (error) {
  res.status(400).json({
    success: false,
    message: error.message,
  });
}
```

Purpose:

- catches any errors during registration
- sends a 400 Bad Request response with the error text

#### Login controller

```javascript
exports.loginUser = async (req, res) => {
```

Purpose:

- handles the login request

```javascript
const result = await authService.loginUser(req.body);
```

What this does:

- calls the login service with the email and password from the request

```javascript
res.status(200).json({
  success: true,
  message: "Login successful",
  data: result,
});
```

Purpose:

- sends a successful response after login
- includes the JWT token and user info

```javascript
} catch (error) {
  res.status(401).json({
    success: false,
    message: error.message,
  });
}
```

Purpose:

- if login fails, sends a 401 Unauthorized response

---

### 3.8 services/auth.service.js

Purpose:
This file contains the actual business logic of authentication.

It checks user credentials, hashes passwords, and generates JWT tokens.

Code breakdown:

```javascript
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../Utils/generateToken");
```

What this does:

- imports the User model
- imports the bcrypt library for password hashing and comparison
- imports the JWT token generator

#### Register logic

```javascript
exports.registerUser = async (data) => {
  const { name, email, password, phone } = data;
```

What this does:

- destructures the incoming user data

```javascript
const existingUser = await User.findOne({ email });
if (existingUser) {
  throw new Error("User already exists");
}
```

Purpose:

- checks whether the provided email is already registered
- if yes, the function stops and throws an error

```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

Purpose:

- creates a random salt for password hashing
- hashes the raw password before saving it to the database
- this keeps the password secure

```javascript
const user = await User.create({
  name,
  email,
  password: hashedPassword,
  phone,
});
```

Purpose:

- saves the user to MongoDB
- uses the hashed password instead of plain text

```javascript
return {
  id: user._id,
  name: user.name,
  email: user.email,
};
```

Purpose:

- returns only essential user details after registration

#### Login logic

```javascript
exports.loginUser = async (data) => {
  const { email, password } = data;
```

Purpose:

- takes the email and password sent by the client

```javascript
if (
  email === process.env.ADMIN_EMAIL &&
  password === process.env.ADMIN_PASSWORD
) {
```

Purpose:

- handles admin login using environment variables instead of database lookup
- this is a quick way to support an admin account without saving it in MongoDB

```javascript
const token = generateToken("admin", "admin");
```

Purpose:

- generates a JWT token for admin access

```javascript
return {
  token,
  user: {
    id: "admin",
    name: "Admin",
    email: process.env.ADMIN_EMAIL,
    role: "admin",
  },
};
```

Purpose:

- returns login result for admin with token and user details

```javascript
const user = await User.findOne({ email });
```

Purpose:

- looks for a normal user in the database using email

```javascript
if (!user) {
  throw new Error("Invalid credentials");
}
```

Purpose:

- if email does not match any user, login fails

```javascript
const isMatch = await bcrypt.compare(password, user.password);
```

Purpose:

- compares entered password with stored hashed password
- this ensures the password is valid without storing it in plain text

```javascript
if (!isMatch) {
  throw new Error("Invalid credentials");
}
```

Purpose:

- if password does not match, login fails

```javascript
const token = generateToken(user._id, user.role);
```

Purpose:

- creates a JWT token containing the user ID and role

```javascript
return {
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
};
```

Purpose:

- returns the token and user details to the frontend after successful login

---

### 3.9 middlewares/auth.middleware.js

Purpose:
This file protects routes that require authentication.

It checks whether the user sent a valid JWT token in the Authorization header.

Code breakdown:

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
```

Purpose:

- imports JWT library
- imports the user model to find the user from the token

Important note:
The path is currently written as `../models/user.model`, but the actual file in this project is `../model/User.js`. This is a path mismatch and could cause the middleware to fail.

```javascript
const protect = async (req, res, next) => {
```

Purpose:

- defines a middleware function that runs before protected routes

```javascript
let token;
const authHeader = req.headers.authorization;
```

Purpose:

- reads the Authorization header from the incoming request

```javascript
if (authHeader && authHeader.startsWith("Bearer ")) {
  token = authHeader.split(" ")[1];
}
```

Purpose:

- extracts the JWT token from the request header in the format:

```text
Authorization: Bearer <token>
```

```javascript
if (!token) {
  return res.status(401).json({
    success: false,
    message: "Access denied. No token provided.",
  });
}
```

Purpose:

- if no token is sent, the request is rejected with 401 Unauthorized

```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

Purpose:

- verifies that the token is valid and has not expired
- if invalid, an error is thrown

```javascript
const user = await User.findById(decoded.id).select("-password");
```

Purpose:

- finds the user using the ID inside the token
- excludes the password field from the result

```javascript
if (!user) {
  return res.status(401).json({
    success: false,
    message: "User not found.",
  });
}
```

Purpose:

- prevents access if the token belongs to a deleted or invalid user

```javascript
if (user.isBlocked) {
  return res.status(403).json({
    success: false,
    message: "Your account has been blocked.",
  });
}
```

Purpose:

- blocks access for users marked as blocked

```javascript
req.user = user;
next();
```

Purpose:

- attaches the user to the request and lets the route continue

```javascript
} catch (error) {
  return res.status(401).json({
    success: false,
    message: "Invalid or expired token.",
  });
}
```

Purpose:

- if token verification fails, sends a 401 response

```javascript
module.exports = {
  protect,
};
```

Purpose:

- exports middleware so it can be used in protected routes

---

### 3.10 Utils/generateToken.js

Purpose:
This file creates a JWT token for logged-in users.

Code breakdown:

```javascript
const jwt = require("jsonwebtoken");
```

Purpose:

- imports the JWT library

```javascript
const generateToken = (userId, role) => {
```

Purpose:

- creates a function that receives the user ID and role

```javascript
return jwt.sign(
```

Purpose:

- signs a new token using the user data

```javascript
{
  id: userId,
  role,
},
process.env.JWT_SECRET,
{
  expiresIn: process.env.JWT_EXPIRES_IN,
}
```

What this does:

- puts the ID and role inside the token
- signs it using the secret stored in `.env`
- sets the token expiration time from `JWT_EXPIRES_IN`

```javascript
module.exports = generateToken;
```

Purpose:

- exports the function so it can be used in auth service

---

### 3.11 .env.example

Purpose:
This file shows all environment variables needed by the backend.

It is a template used to create a real `.env` file.

Key values:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/your_cinema_db_name
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRES_IN=7d
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@yourwish.com
ADMIN_PASSWORD=change_this_to_a_secure_password
```

What each one does:

- `PORT` = server port
- `MONGO_URI` = database connection string
- `JWT_SECRET` = secret key used to sign JWT tokens
- `JWT_EXPIRES_IN` = token lifetime
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` = credentials for initial admin login

---

## 4. Authentication Flow in Simple Terms

### Registration flow

1. Frontend sends user data to `/api/auth/register`
2. Route calls `authController.registerUser`
3. Controller calls `authService.registerUser`
4. Service checks whether the user already exists
5. It hashes the password using bcrypt
6. It stores the user in MongoDB
7. Server returns success response

### Login flow

1. Frontend sends email and password to `/api/auth/login`
2. Route calls `authController.loginUser`
3. Controller calls `authService.loginUser`
4. Service checks if the login is admin or customer
5. It verifies the password using bcrypt
6. It generates a JWT token
7. Server returns the token and user details

### Protected route flow

1. User sends a token in the `Authorization` header
2. Middleware reads the token
3. Middleware verifies the token using `JWT_SECRET`
4. It finds the user in MongoDB from the token data
5. If valid, it allows access to the route
6. If invalid, it sends `401` or `403`

---

## 5. Summary of the Backend Role

This backend is the main engine of the The Jersey Hub system. It handles:

- user accounts
- login and token-based security
- database interaction
- route handling
- service logic
- protected access control

The backend is organized in a clean structure:

- `routes/` = API endpoints
- `controllers/` = request handlers
- `services/` = main logic
- `model/` = database schema
- `middlewares/` = protection logic
- `config/` = database setup
- `Utils/` = helper functions

---

## 6. Final Note

This backend is a good foundation for an authentication system, but some parts still need improvement and correction, especially:

- the forgot password route path has formatting issues
- the middleware path to `User` is inconsistent
- some files like `routes/user.routes.js` are still incomplete
- protected routes are not yet fully connected to the application

Even so, the core structure for authentication is clearly organized and can be completed step by step.
