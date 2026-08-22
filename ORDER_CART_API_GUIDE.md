# TheJerseyHub Order and Cart API Guide

This document describes the current cart and order behavior for frontend development. It covers the route map, authentication, role-based access control, request and response formats, database behavior, guest-cart behavior, and the customer-to-admin order flow.

## 1. API Basics

### Base URL

For local development:

```text
http://localhost:5000/api
```

For the deployed backend:

```text
https://thejerseyhub.onrender.com/api
```

All paths in this guide are shown with the `/api` prefix.

### Authentication

Authenticated requests may use either of these methods:

1. The httpOnly `token` cookie set by the authentication endpoints.
2. An HTTP Bearer token in the `Authorization` header.

Bearer header format:

```http
Authorization: Bearer <jwt-token>
```

Browser requests must include credentials when using cookies:

```js
fetch(`${API_BASE_URL}/orders/my-orders`, {
  credentials: "include",
});
```

The frontend currently also reads `tjh_token` from `localStorage` and sends it as a Bearer token when available.

### Roles

- `customer`: can manage their own authenticated cart, create orders, and view their own orders.
- `admin`: can view every order, update order and payment statuses, and delete orders.
- Guest visitor: can use the frontend cart stored in browser `sessionStorage`, but cannot save cart records to MongoDB or create an order until logging in.

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

## 2. Permission Summary

| Capability                         | Guest |        Customer |                                                    Admin |
| ---------------------------------- | ----: | --------------: | -------------------------------------------------------: |
| Keep a temporary browser cart      |   Yes |             Yes |                                                      Yes |
| Read an authenticated MongoDB cart |    No |   Own cart only |                                    No special admin cart |
| Add to a MongoDB cart              |    No |   Own cart only |                                    No special admin cart |
| Update own cart quantity           |    No |   Own cart only |                                    No special admin cart |
| Remove an item by product and size |    No |   Own cart only |                                    No special admin cart |
| Clear own MongoDB cart             |    No |   Own cart only |                                    No special admin cart |
| Create an order                    |    No |             Yes | The customer order route requires a real MongoDB user ID |
| View own order history             |    No | Own orders only |            Admin account is not a normal customer record |
| View all platform orders           |    No |              No |                                                      Yes |
| Update order status                |    No |              No |                                                      Yes |
| Update payment status              |    No |              No |                                                      Yes |
| Delete an order                    |    No |              No |                                                      Yes |

The admin order routes require both `protect` and `isAdmin` in production. Cart routes are guest-aware, but database cart mutations require an authenticated MongoDB customer.

## 3. Cart Architecture

The cart has two storage modes:

### Guest cart

The frontend stores the cart in browser `sessionStorage` under:

```text
tjh_guest_cart
```

The stored value contains:

```json
{
  "items": [],
  "expiresAt": 1780000000000
}
```

The current expiration period is seven days. The cart is removed when it expires or when it is cleared.

A guest cart is tied to the current browser tab/session. It is not stored in MongoDB and is not available on another device or browser.

### Authenticated customer cart

The backend stores an authenticated cart in the `Cart` MongoDB collection. A customer has one cart document, identified by the authenticated user ID:

```json
{
  "user": "665abc123456789012345678",
  "items": [
    {
      "product": "665def123456789012345678",
      "size": "L",
      "quantity": 2
    }
  ]
}
```

Cart items reference products. Product details are populated in cart responses.

The customer ID comes from the verified authentication token. It is never taken from a request body for cart ownership.

## 4. Cart Routes

Cart routes are mounted under `/api/cart`.

### 4.1 Get cart

```http
GET /api/cart
```

Access: guest-aware endpoint.

Behavior:

- Authenticated customer: returns that customer's MongoDB cart with populated product details.
- Guest: returns an empty database-cart response. The frontend must read the guest cart from `sessionStorage`.
- A customer cannot request another customer's cart by sending a user ID.

Authenticated response:

```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "665abc123456789012345679",
      "user": "665abc123456789012345678",
      "items": [
        {
          "product": {
            "_id": "665def123456789012345678",
            "id": "barca-24-25",
            "code": "BAR-2425",
            "name": "Barcelona Home Jersey",
            "price": "$135.00",
            "priceNumeric": 135,
            "imageSrc": "/images/barca-jersey.svg",
            "stock": 20,
            "sizesAvailable": ["S", "M", "L", "XL"]
          },
          "size": "L",
          "quantity": 2
        }
      ]
    },
    "items": []
  }
}
```

The `data.items` array contains the same cart items as `data.cart.items`, or an empty array when no cart exists.

### 4.2 Add or increase a cart item

```http
POST /api/cart
```

Access: authenticated customer required for database changes. The route itself is guest-aware and returns an authentication error for an unauthenticated database mutation.

Request body:

```json
{
  "productId": "barca-24-25",
  "size": "L",
  "quantity": 1
}
```

`productId` may be a MongoDB product ID, custom product ID, or product code.

Behavior:

- Confirms that the product exists.
- Confirms that the selected size is available.
- Confirms that the requested quantity is positive.
- Confirms that current product stock can satisfy the added quantity.
- Creates the customer's cart if it does not exist.
- Increases quantity when the same product and size already exist.
- Adds a new product-size item otherwise.
- Returns the updated cart with populated products.

The backend does not store price, name, or image inside the cart item. Those values come from the referenced product.

### 4.3 Set cart item quantity

```http
PATCH /api/cart/:productId/:size
```

Access: authenticated customer required.

Example:

```http
PATCH /api/cart/barca-24-25/L
```

Request body:

```json
{
  "quantity": 3
}
```

Behavior:

- Finds the authenticated customer's cart.
- Finds the selected product-size item.
- Replaces its quantity with the requested positive integer.
- Returns the updated cart.

The route does not currently re-check product stock before setting the new cart quantity. Stock is checked again during order creation.

### 4.4 Remove an item by product and size

```http
DELETE /api/cart/:productId/:size
```

Access: authenticated customer required.

Example:

```http
DELETE /api/cart/barca-24-25/L
```

Behavior:

- Finds only the authenticated customer's cart.
- Removes the matching product and size combination.
- Leaves other sizes of the same product untouched.
- Returns the updated cart.

### 4.5 Clear the cart

```http
DELETE /api/cart
```

Access: authenticated customer required for the MongoDB cart.

Behavior:

- Sets the authenticated customer's cart items to an empty array.
- Returns an empty cart response.
- The frontend also removes the guest `sessionStorage` cart when its local `clearCart` action is used.

## 5. Frontend Cart Flow

The expected frontend flow is:

```text
Browse products
  -> Choose size
  -> Choose quantity
  -> Add to cart
  -> View cart
  -> Update quantity
  -> Remove item
  -> Checkout
  -> Login or register
  -> Create order
```

### Guest behavior

1. Product data comes from the public product API.
2. The selected product, size, quantity, and customization are kept in frontend state.
3. The cart is saved to `sessionStorage` for seven days.
4. The guest can view, update, remove, or clear the temporary cart.
5. The guest must authenticate before the protected order route can create an order.

### Login behavior

After authentication, the frontend sends guest items to `/api/cart`, then reads the authenticated cart from `GET /api/cart`. The database cart becomes the source of truth for the logged-in customer.

### Authenticated behavior

- Add: `POST /api/cart`
- Quantity change: `PATCH /api/cart/:productId/:size`
- Remove: `DELETE /api/cart/:productId/:size`
- Clear: `DELETE /api/cart`
- Read: `GET /api/cart`

## 6. Order Architecture

Orders are stored in the `Order` MongoDB collection. An order contains:

- The authenticated customer ID.
- Product snapshots for each purchased item.
- The selected size and quantity.
- The trusted database product price.
- Shipping address details.
- Payment method.
- Payment status.
- Fulfillment/order status.
- Total amount.
- Creation and update timestamps.

Order status values:

```text
pending
processing
shipped
delivered
cancelled
```

Payment status values:

```text
pending
paid
failed
```

## 7. Customer Order Routes

Customer routes are mounted under `/api/orders`.

### 7.1 Create an order

```http
POST /api/orders
```

Access: authenticated customer with a real MongoDB user account.

The request must include product references, size, quantity, and shipping details. The server controls product identity, product name, image, price, payment method, payment status, order status, customer ID, and total amount.

Request body:

```json
{
  "items": [
    {
      "product": "barca-24-25",
      "size": "L",
      "quantity": 1,
      "customization": {
        "playerName": "MESSI",
        "playerNumber": "10",
        "patches": [],
        "extraCost": 0
      }
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9812345678",
    "street": "Main Street",
    "city": "Kathmandu",
    "state": "Bagmati",
    "country": "Nepal"
  }
}
```

Required customer-controlled values:

- At least one item.
- Product reference for every item.
- Positive integer quantity.
- Available size.
- `fullName`.
- `phone`.
- `street`.
- `city`.

Server behavior:

1. Requires a real authenticated MongoDB user ID.
2. Rejects an empty item list.
3. Looks up every product in MongoDB.
4. Checks that every size is available.
5. Checks available stock.
6. Deducts stock inside a MongoDB transaction.
7. Builds item snapshots from database product data.
8. Calculates `totalAmount` from trusted database prices.
9. Forces `paymentMethod` to `Cash on Delivery`.
10. Forces `paymentStatus` to `pending`.
11. Forces `orderStatus` to `pending`.
12. Creates the order for the authenticated user.

Success response:

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "_id": "665abc123456789012345680",
      "user": "665abc123456789012345678",
      "items": [],
      "shippingAddress": {},
      "paymentMethod": "Cash on Delivery",
      "paymentStatus": "pending",
      "orderStatus": "pending",
      "totalAmount": 135,
      "createdAt": "2026-08-22T10:00:00.000Z",
      "updatedAt": "2026-08-22T10:00:00.000Z"
    }
  }
}
```

Possible errors:

- `401`: no valid customer account.
- `400`: empty order, invalid product, unavailable size, invalid quantity, missing shipping details, invalid price, or insufficient stock.

Important current behavior: the order service uses the submitted order items rather than reading the MongoDB `Cart` document directly. The frontend checkout sends its current cart items. Backend cart clearing after successful order creation is not currently performed by this route.

### 7.2 View the logged-in customer's orders

```http
GET /api/orders/my-orders
```

Access: authenticated customer with a real MongoDB `User` record. The special environment-configured admin account is not a customer record and has no customer order history through this route.

The server reads the customer ID from the verified token and applies:

```js
Order.find({ user: userId }).sort({ createdAt: -1 });
```

A customer cannot supply another user ID through the query string or request body to change the result.

The response includes every order belonging to that customer, regardless of:

- Order status.
- Payment status.
- Payment method.

Response:

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "665abc123456789012345680",
        "user": "665abc123456789012345678",
        "items": [
          {
            "product": "665def123456789012345678",
            "name": "Barcelona Home Jersey",
            "image": "/images/barca-jersey.svg",
            "size": "L",
            "quantity": 1,
            "price": 135,
            "customization": {}
          }
        ],
        "shippingAddress": {
          "fullName": "John Doe",
          "phone": "9812345678",
          "street": "Main Street",
          "city": "Kathmandu",
          "state": "Bagmati",
          "country": "Nepal"
        },
        "paymentMethod": "Cash on Delivery",
        "paymentStatus": "pending",
        "orderStatus": "pending",
        "totalAmount": 135,
        "createdAt": "2026-08-22T10:00:00.000Z",
        "updatedAt": "2026-08-22T10:00:00.000Z"
      }
    ]
  }
}
```

The customer frontend can use this single response to display order details, products, shipping information, payment status, fulfillment status, totals, and timestamps.

## 8. Admin Order Routes

All routes in this section require:

1. A valid authenticated session.
2. `req.user.role === "admin"`.

The route definitions are:

```js
router.get("/", protect, isAdmin, orderController.getAllOrders);
router.put("/:id/status", protect, isAdmin, orderController.updateOrderStatus);
router.delete("/:id", protect, isAdmin, orderController.deleteOrder);
```

### 8.1 View all customer orders

```http
GET /api/orders
```

Access: admin only.

Optional query parameter:

```text
status=pending
```

The backend populates each order's customer with:

- `name`
- `email`
- `phone`

The result includes all order item snapshots and order fields. The admin frontend can display customer name, product name, size, quantity, total, payment status, and fulfillment status from this response.

Example:

```http
GET /api/orders?status=processing
```

Response shape:

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "665abc123456789012345680",
        "user": {
          "_id": "665abc123456789012345678",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "9812345678"
        },
        "items": [],
        "shippingAddress": {},
        "paymentMethod": "Cash on Delivery",
        "paymentStatus": "pending",
        "orderStatus": "processing",
        "totalAmount": 135,
        "createdAt": "2026-08-22T10:00:00.000Z"
      }
    ]
  }
}
```

A More Details modal can use the selected order object already returned by this endpoint. A separate order-detail route is not required for the current design.

### 8.2 Update order or payment status

```http
PUT /api/orders/:id/status
```

Access: admin only.

Update fulfillment status:

```json
{
  "orderStatus": "shipped"
}
```

Update payment status:

```json
{
  "paymentStatus": "paid"
}
```

Update both:

```json
{
  "orderStatus": "processing",
  "paymentStatus": "paid"
}
```

Legacy frontend payloads using `status` are also accepted:

```json
{
  "status": "delivered"
}
```

Allowed order statuses:

```text
pending, processing, shipped, delivered, cancelled
```

Allowed payment statuses:

```text
pending, paid, failed
```

Invalid or missing status values return an error. The response contains the updated order and populated customer information.

### 8.3 Delete an order

```http
DELETE /api/orders/:id
```

Access: admin only.

Behavior:

- Finds the order by MongoDB ID.
- Permanently deletes it.
- Returns the deleted order in `data.order`.

The frontend should show a confirmation step before calling this route.

Important: deletion is a separate route. The status route updates statuses and does not delete orders.

## 9. Order and Cart Data Models

### Cart item

| Field      | Type     | Meaning                     |
| ---------- | -------- | --------------------------- |
| `product`  | ObjectId | Referenced Product document |
| `size`     | string   | Selected size               |
| `quantity` | number   | Positive quantity           |

### Order item snapshot

| Field           | Type     | Meaning                                              |
| --------------- | -------- | ---------------------------------------------------- |
| `product`       | ObjectId | Product reference                                    |
| `name`          | string   | Product name at purchase time                        |
| `image`         | string   | Product image at purchase time                       |
| `size`          | string   | Purchased size                                       |
| `quantity`      | number   | Purchased quantity                                   |
| `price`         | number   | Trusted numeric price at purchase time               |
| `customization` | object   | Optional name, number, patches, and certificate data |

### Shipping address

| Field      | Type   |              Required |
| ---------- | ------ | --------------------: |
| `fullName` | string |                   Yes |
| `phone`    | string |                   Yes |
| `street`   | string |                   Yes |
| `city`     | string |                   Yes |
| `state`    | string |                    No |
| `country`  | string | No, defaults to Nepal |

### Order fields

| Field             | Type     | Meaning                                                         |
| ----------------- | -------- | --------------------------------------------------------------- |
| `user`            | ObjectId | Customer who owns the order                                     |
| `items`           | array    | Purchased item snapshots                                        |
| `shippingAddress` | object   | Delivery address snapshot                                       |
| `paymentMethod`   | string   | Currently forced to Cash on Delivery during creation            |
| `paymentStatus`   | enum     | `pending`, `paid`, or `failed`                                  |
| `orderStatus`     | enum     | `pending`, `processing`, `shipped`, `delivered`, or `cancelled` |
| `totalAmount`     | number   | Server-calculated order total                                   |
| `createdAt`       | date     | Creation timestamp                                              |
| `updatedAt`       | date     | Last update timestamp                                           |

## 10. Security and Validation Rules

- Customer cart queries use the authenticated user ID, not a client-supplied user ID.
- Customer order history uses the authenticated user ID.
- Admin order listing, status updates, and deletion require `isAdmin`.
- Product prices are read from MongoDB during order creation.
- Client-supplied total, item name, item image, payment status, payment method, and order status are not trusted during creation.
- Product availability and stock are checked before order creation.
- Stock deduction and order creation run inside a MongoDB transaction.
- Order and payment statuses are validated against allowed enum values.
- Passwords are not part of cart or order responses.
- The frontend should still validate form input before sending requests, but backend validation remains authoritative.

## 11. Current Integration Notes

- The cart routes are mounted at `/api/cart` in the Express app.
- The order routes are mounted at `/api/orders`.
- Guest cart storage is frontend-only and uses `sessionStorage` with a seven-day expiry.
- Authenticated cart operations require a valid customer token.
- The order creation route currently receives the frontend cart item list and does not clear the MongoDB cart after success.
- The checkout frontend should not show a successful order confirmation unless the API returns `success: true` and `data.order`.
- The frontend can use the response from `GET /api/orders` to build an admin order table and More Details view.
- The frontend can use the response from `GET /api/orders/my-orders` to build a customer order history and full order detail view.
