# TheJerseyHub User and Product API Guide

This document describes the current backend behavior for authentication, customer accounts, admin user management, and product/catalog management. It is written for frontend development.

## 1. API Basics

### Base URL

For local development:

```text
http://localhost:5000/api
```

Examples in this document use `/api` as the base path.

### Authentication

The backend supports two authentication methods:

1. An httpOnly `token` cookie set after login.
2. An HTTP Bearer token in the `Authorization` header.

Bearer header format:

```http
Authorization: Bearer <jwt-token>
```

For browser requests using cookies, the frontend must send credentials, for example with Axios:

```js
axios.get("/api/users/profile", { withCredentials: true });
```

The backend also enables CORS credentials for the configured frontend origins.

### Roles

The database user roles are:

- `customer`: normal shopper account.
- `admin`: administrator account.

The configured admin login is supplied through environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME`). The configured admin is represented by the special JWT id `admin`; it is not stored as a normal MongoDB `User` document.

### Common response format

Successful responses normally use:

```json
{
  "success": true,
  "data": {}
}
```

Errors normally use:

```json
{
  "success": false,
  "message": "Explanation of the error"
}
```

---

## 2. Permission Summary

| Area                                | Public visitor | Customer | Admin |
| ----------------------------------- | -------------: | -------: | ----: |
| Register account                    |            Yes |      Yes |   Yes |
| Login/logout                        |            Yes |      Yes |   Yes |
| View public products                |            Yes |      Yes |   Yes |
| View own profile                    |             No |      Yes |   Yes |
| Update own name                     |             No |      Yes |   Yes |
| Change own password                 |             No |      Yes |   Yes |
| View customer list                  |             No |       No |   Yes |
| Create customer from admin panel    |             No |       No |   Yes |
| Update customer name/phone          |             No |       No |   Yes |
| Block/unblock customer              |             No |       No |   Yes |
| Delete customer and related records |             No |       No |   Yes |
| Create/update/delete products       |             No |       No |   Yes |
| Change product placement            |             No |       No |   Yes |

All admin routes require authentication and the `admin` role in production.

---

## 3. Authentication APIs

### 3.1 Register a customer

```http
POST /api/auth/register
```

Access: public.

Request body: all fields are required.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Strong@123",
  "phone": "9812345678"
}
```

Validation rules:

- `name`: 2 to 50 characters and must start with a capital letter.
- `email`: valid email address.
- `password`: 6 to 128 characters with an uppercase letter, number, and special character.
- `phone`: exactly 10 digits.

The password is hashed before it is saved. A token is returned in an httpOnly cookie. The response user data does not contain the password.

Success: `201 Created`.

### 3.2 Login

```http
POST /api/auth/login
```

Access: public.

Request body:

```json
{
  "email": "john@example.com",
  "password": "Strong@123"
}
```

Customers are checked against the database. The configured admin credentials are checked against environment variables.

A blocked customer cannot log in while the block is active. A successful login sets the httpOnly token cookie.

Success: `200 OK`.

### 3.3 Get current session

```http
GET /api/auth/me
```

Access: authenticated customer or admin.

Returns a small session user object containing id, name, email, and role. Password is not returned.

Success: `200 OK`.

### 3.4 Logout

```http
POST /api/auth/logout
```

Access: public endpoint; normally called by an authenticated user.

Clears the httpOnly token cookie.

Success: `200 OK`.

### 3.5 Forget password placeholder

```http
POST /api/auth/forget-password
```

Access: public.

This currently only returns a confirmation message. It does not yet send an email or change a password.

---

## 4. Customer Profile APIs

These routes are mounted under `/api/users`.

### 4.1 View own profile

```http
GET /api/users/profile
```

Access: authenticated customer or admin.

The response intentionally exposes only these fields:

- `id`
- `role`
- `name`
- `phone`
- `email`

The password is never returned.

Example response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "665abc123456789012345678",
      "role": "customer",
      "name": "John Doe",
      "phone": "9812345678",
      "email": "john@example.com"
    }
  }
}
```

Frontend use: build the customer profile view using these fields. The role may be used to decide whether to show customer or admin navigation.

### 4.2 Update own profile

```http
PUT /api/users/profile
```

Access: authenticated customer or admin.

The customer may update only their own `name`.

```json
{
  "name": "John Smith"
}
```

The service whitelist writes only `name`. Sending `phone`, `email`, `password`, `role`, `isBlocked`, or `blockedUntil` does not update those fields.

Success: `200 OK` with the updated user excluding the password.

Frontend use: show a name input only. Use the separate change-password route for password changes.

### 4.3 Change own password

```http
PUT /api/users/change-password
```

Access: authenticated customer or admin.

Request body:

```json
{
  "currentPassword": "Old@123",
  "newPassword": "New@456"
}
```

The service verifies the current password, hashes the new password, and saves it. There is currently no Joi validator attached to this route, so the frontend should still enforce the same strong password rules used during registration.

Success: `200 OK`.

---

## 5. Admin User Management APIs

Every route in this section requires:

1. A valid authenticated session.
2. The admin role.

The admin user list contains customers only; admin accounts are not returned by `GET /api/users`.

### 5.1 List customers

```http
GET /api/users
```

Access: admin only.

Optional query parameters:

| Parameter | Default | Meaning                                          |
| --------- | ------: | ------------------------------------------------ |
| `page`    |     `1` | Page number, minimum 1                           |
| `limit`   |    `20` | Results per page, limited to 100                 |
| `search`  |    none | Case-insensitive search in name, email, or phone |
| `status`  |    none | Use `active` or `blocked`                        |

Example:

```http
GET /api/users?page=1&limit=20&search=john&status=active
```

Response shape:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "665abc123456789012345678",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9812345678",
        "role": "customer",
        "isBlocked": false,
        "blockedUntil": null,
        "createdAt": "2026-08-21T10:00:00.000Z",
        "updatedAt": "2026-08-21T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

Password is excluded. The frontend can use this response for an admin users table with search, status filters, pagination, edit, block/unblock, and delete actions.

### 5.2 Create customer from admin panel

```http
POST /api/users
```

Access: admin only.

All four fields are mandatory:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Strong@123",
  "phone": "9800000000"
}
```

This uses the same registration validation as public signup. The created account receives the default role `customer`. The password is hashed and is not returned.

Success: `201 Created`.

Possible errors:

- `400`: validation or database error.
- `409`: email already exists.

Frontend use: create a form with name, email, password, and phone. Do not include a role selector unless the backend requirement changes; this endpoint always creates a customer.

### 5.3 Update an existing customer

```http
PUT /api/users/:id
```

Access: admin only.

The admin can update:

- `name`
- `phone`

Example:

```json
{
  "name": "Jane Smith",
  "phone": "9800000001"
}
```

The service whitelist prevents this route from changing:

- Email
- Password
- Role
- `isBlocked`
- `blockedUntil`

The route targets customer records only, so an admin account cannot be updated through it.

Success: `200 OK`.

Frontend use: the edit customer form should contain name and phone fields only. Display email as read-only if it is shown.

### 5.4 Block or unblock a customer

```http
PATCH /api/users/:id/block
```

Access: admin only.

Block for a selected number of whole days:

```json
{
  "durationDays": 7
}
```

The service sets `isBlocked` to `true` and calculates `blockedUntil` from the current time.

Unblock immediately:

```json
{
  "durationDays": 0
}
```

This sets `isBlocked` to `false` and clears `blockedUntil`.

Rules:

- `durationDays` must be a non-negative integer.
- Values greater than 0 activate a timed block.
- `0` manually turns the block off.
- An expired block is cleared automatically when the customer makes a protected request.
- Blocked customers cannot log in and cannot access protected customer routes.

Frontend use: provide a block action with a whole-day duration input or menu, plus an unblock action. The users table should use `isBlocked` and `blockedUntil` to show status and expiry.

### 5.5 Delete a customer

```http
DELETE /api/users/:id
```

Access: admin only.

Before deleting the customer, the service deletes:

- The customer's `Cart` document.
- All `Order` documents belonging to the customer.
- The customer's `User` document.

This is permanent. The frontend should show a confirmation dialog before sending the request.

Success: `200 OK`.

The route cannot delete an admin account through this service.

---

## 6. Product and Catalog APIs

Products are mounted under `/api/products`.

### Product fields

The current product model supports:

| Field            | Type         | Required/default                 | Frontend meaning                                   |
| ---------------- | ------------ | -------------------------------- | -------------------------------------------------- |
| `code`           | string       | required                         | Product code; saved uppercase                      |
| `name`           | string       | required                         | Product display name                               |
| `season`         | string       | required                         | Season or year                                     |
| `club`           | string       | required                         | Club/team name                                     |
| `price`          | string       | required                         | Display price, such as `NPR 4,500`                 |
| `priceNumeric`   | number       | default `0`                      | Numeric price used for sorting/calculation support |
| `imageSrc`       | string       | required                         | Main image URL/path                                |
| `edition`        | string       | default `HERITAGE VAULT EDITION` | Edition label                                      |
| `category`       | string       | default `club`                   | `club`, `retro`, `special`, `vintage`, or `nation` |
| `league`         | string       | default `La Liga`                | League or competition                              |
| `sizesAvailable` | string array | default `S,M,L,XL`               | Available sizes: `S`, `M`, `L`, `XL`, `XXL`        |
| `stock`          | number       | default `25`, minimum `0`        | Inventory count                                    |
| `rating`         | number       | default `4.9`, range `1` to `5`  | Product rating                                     |
| `inStock`        | boolean      | default `true`                   | Whether product is available                       |
| `showOnLanding`  | boolean      | default `false`                  | Whether product appears on landing page            |
| `landingOrder`   | number       | default `0`                      | Landing page display order                         |
| `showInShop`     | boolean      | default `true`                   | Whether product appears in shop                    |
| `featured`       | boolean      | default `false`                  | Featured product flag                              |
| `description`    | string       | default empty                    | Product description                                |

The model also provides MongoDB `_id`, `createdAt`, and `updatedAt`.

### 6.1 List products

```http
GET /api/products
```

Access: public. Customers and admins can also use it.

Optional query parameters:

| Parameter       | Meaning                                                         |
| --------------- | --------------------------------------------------------------- |
| `category`      | Category filter. `ALL` means no category filter.                |
| `league`        | Exact league filter. `ALL` means no league filter.              |
| `showOnLanding` | Boolean filter: `true` or `false`                               |
| `showInShop`    | Boolean filter: `true` or `false`                               |
| `featured`      | Boolean filter: `true` or `false`                               |
| `search`        | Case-insensitive search in name, club, code, season, or edition |

Example:

```http
GET /api/products?category=retro&league=La%20Liga&featured=true&search=barcelona
```

Products are sorted by `landingOrder` ascending and then `createdAt` descending.

Response:

```json
{
  "success": true,
  "data": {
    "products": []
  }
}
```

Frontend use:

- Shop page: request products with `showInShop=true`.
- Featured section: request with `featured=true`.
- Category tabs: pass `category`.
- Search box: pass `search`.
- Admin inventory table: request the full list and display stock and placement flags.

### 6.2 Get landing products

```http
GET /api/products/landing
```

Access: public.

Returns only products where `showOnLanding` is `true`, sorted by `landingOrder` ascending and then creation date ascending.

Frontend use: use this endpoint for the home/landing page product carousel or 3D product placement. It prevents the frontend from having to filter landing products itself.

Response:

```json
{
  "success": true,
  "data": {
    "products": []
  }
}
```

### 6.3 Get one product

```http
GET /api/products/:id
```

Access: public.

The path value may be:

- MongoDB `_id`.
- Product `code`.
- Legacy/custom `id` field if present in a document.

Example:

```http
GET /api/products/THJ-BAR-24
```

Success: `200 OK` with `data.product`.

Not found: `404` with `Product not found`.

Frontend use: product detail page, quick view modal, and checkout product detail lookup.

### 6.4 Create product

```http
POST /api/products
```

Access: admin only.

Example request body:

```json
{
  "code": "THJ-BAR-24",
  "name": "Barcelona 2024 Home Jersey",
  "season": "2024/25",
  "club": "Barcelona",
  "price": "NPR 4,500",
  "imageSrc": "/images/barcelona-2024.jpg",
  "edition": "PLAYER EDITION",
  "category": "club",
  "league": "La Liga",
  "sizesAvailable": ["S", "M", "L", "XL"],
  "stock": 25,
  "rating": 4.8,
  "inStock": true,
  "showOnLanding": true,
  "landingOrder": 1,
  "showInShop": true,
  "featured": true,
  "description": "Official-style home jersey."
}
```

Required fields: `code`, `name`, `season`, `club`, `price`, and `imageSrc`.

The model validates category, sizes, stock, and rating. The service also derives `priceNumeric` from a string price when possible.

Success: `201 Created`.

Frontend use: admin product form with image path/URL, catalog details, stock controls, and placement controls.

### 6.5 Update product

```http
PUT /api/products/:id
```

Access: admin only.

The ID can be a MongoDB `_id`, product code, or custom id. The request can update product fields such as:

- Name, code, season, club, league, and edition.
- Price and description.
- Image path.
- Category and sizes.
- Stock, rating, and in-stock state.
- Landing/shop/featured placement fields.

Example:

```json
{
  "price": "NPR 4,200",
  "stock": 18,
  "description": "Updated product description",
  "inStock": true
}
```

The update runs Mongoose validators. If `price` is a string, the service recalculates `priceNumeric`.

Success: `200 OK` with the updated product.

Frontend use: admin edit product form. The frontend should send only fields it intends to change and should preserve the required fields when using a full edit form.

### 6.6 Update product placement

```http
PATCH /api/products/:id/placement
```

Access: admin only.

This is a quick placement-control endpoint. It is intended for toggles and ordering controls:

```json
{
  "showOnLanding": true,
  "landingOrder": 2,
  "showInShop": true,
  "featured": false
}
```

Frontend use: admin inventory table switches for:

- Show on landing page.
- Landing position.
- Show in shop.
- Featured status.

This endpoint does not need a full product form. It returns the updated product.

### 6.7 Delete product

```http
DELETE /api/products/:id
```

Access: admin only.

The product can be identified by MongoDB `_id`, product code, or custom id. Deletion is permanent. The frontend should ask for confirmation.

Success: `200 OK` and the deleted product in `data.product`.

---

## 7. Frontend Page Requirements

### Customer pages

#### Login/register

- Login form: email and password.
- Registration form: name, email, password, phone.
- Store session through the httpOnly cookie; do not attempt to read the cookie from JavaScript.
- Send `withCredentials: true` on browser requests.

#### Profile page

- Display name, phone, email, and role.
- Do not display a password field from the profile response.
- Provide an edit form with only a name input.
- Provide a separate change-password form with current and new password fields.

#### Shop page

- Fetch public products.
- Add category, league, featured, shop visibility, and search filters as needed.
- Use `sizesAvailable`, `stock`, `inStock`, `price`, `imageSrc`, and description to render product cards/details.

#### Landing page

- Fetch `/api/products/landing` for landing-specific products.
- Sort order is already handled by the backend.

### Admin pages

#### Admin dashboard/users page

- Load customers with `GET /api/users`.
- Add pagination, search, and active/blocked filter controls.
- Add create-user form with all four required signup fields.
- Add edit-user form with name and phone only; show email as read-only.
- Add block duration control and unblock action.
- Add delete confirmation.

#### Admin products page

- Load products with `GET /api/products`.
- Add create and edit forms for product fields.
- Add stock, in-stock, featured, show-in-shop, show-on-landing, and landing-order controls.
- Use the placement endpoint for quick switches.
- Add delete confirmation.

---

## 8. Authentication and Error Handling for Frontend

Recommended frontend behavior:

- `401`: session is missing, invalid, or expired. Redirect to login.
- `403`: authenticated account is blocked or the user is not an admin. Show an access/blocked message.
- `404`: requested user or product does not exist.
- `409`: attempted to create a user with an existing email.
- `400`: validation or request error. Show the backend `message`; registration validation may also include an `errors` array.

Do not expose or store password values from API responses. Passwords should only be sent over HTTPS in production.

---

## 9. Important Current Backend Notes

1. Product routes are mounted in `app.js` under `/api/products`.
2. User routes are mounted in `app.js` under `/api/users`.
3. The product controller currently has no separate Joi request validator. Product validation is primarily handled by the Mongoose schema, so the frontend should validate required fields before submitting.
4. The admin user-create route does use the strict registration validator.
5. Customer profile self-update writes only `name`.
6. Admin customer update writes only `name` and `phone`.
7. Customer deletion also deletes the customer's cart and orders.
8. In the current middleware, development mode can assign an admin-development context when authentication is absent or invalid. This is useful for local frontend work but must not be relied on in production. In production, valid authentication and admin authorization are required.
9. The current backend mounts order routes too, but this document focuses on the completed authentication, user, and product surfaces requested for frontend implementation.
