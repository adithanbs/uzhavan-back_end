# Uzhavan Backend

Production-ready MVP backend for public product listings. The current project logic is simple: anyone can add a product, everyone can see all products on the dashboard, and users can open a product to contact the seller by mobile number.

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Update `MONGO_URI` and `CORS_ORIGIN` in `.env`.

4. Run the API in development:

```bash
npm run dev
```

Local API base URL:

```text
http://localhost:5050
```

## Scripts

- `npm run dev` starts the TypeScript server with `ts-node`.
- `npm run typecheck` verifies TypeScript without writing build files.
- `npm run build` compiles the app into `dist/`.
- `npm start` runs the compiled production build.

## Current API Routes

- `GET /health` checks service health.
- `GET /api/v1/products` lists all products.
- `POST /api/v1/products` creates a product.
- `GET /api/v1/products/:id` fetches one product.

Legacy `/api/products` routes also work for older frontend code, but new code should use `/api/v1/products`.

## Product Fields

Required fields:

- `name`: product name.
- `category`: product type/category.
- `location`: seller/product location.
- `phone`: seller mobile number.
- `images`: at least one product image URL.

Optional fields:

- `price`: product price.
- `quantity`: available quantity.
- `description`: product details.

MongoDB creates the product id automatically as `_id`, so the frontend does not need to send `productId`.

## Postman Examples

Create product with required fields only:

```http
POST http://localhost:5050/api/v1/products
```

```json
{
  "name": "Tomato",
  "category": "Vegetable",
  "location": "Coimbatore",
  "phone": "9876543210",
  "images": [
    "https://example.com/tomato.jpg"
  ]
}
```

Create product with optional fields:

```json
{
  "name": "Tomato",
  "category": "Vegetable",
  "price": 40,
  "quantity": "1 kg",
  "location": "Coimbatore",
  "phone": "9876543210",
  "images": [
    "https://example.com/tomato.jpg"
  ],
  "description": "Fresh tomato from farm"
}
```

List all products:

```http
GET http://localhost:5050/api/v1/products
```

Get one product by id:

```http
GET http://localhost:5050/api/v1/products/<product_id>
```

## Folder Structure

```text
src/
  config/        Environment and database configuration
  controllers/   Request/response handling
  middlewares/   Error handling and async handling
  models/        Mongoose schemas and model types
  routers/       Express route definitions
  services/      Business logic and database access
  types/         Shared TypeScript types
  utils/         Reusable API and error helpers
```

## Current Product Flow

1. Frontend dashboard calls `GET /api/v1/products`.
2. Backend returns all products, newest first.
3. User clicks add product in the frontend.
4. Frontend sends product details to `POST /api/v1/products`.
5. Backend saves the product after Mongoose model validation.
6. Frontend refreshes the dashboard list.
7. User opens a product using `GET /api/v1/products/:id`.
8. User contacts the seller directly through the product mobile number.

## Future Auth And Payments

Auth and payment should be added as separate modules instead of mixing them into product logic:

- `src/models/user.model.ts` for users, roles, password hashes, and auth provider IDs.
- `src/middlewares/auth.middleware.ts` for JWT/session verification.
- `src/routers/auth.router.ts` and `src/controllers/auth.controller.ts` for signup, login, refresh, and logout.
- `src/models/order.model.ts` for buyer, products, amount, payment status, and fulfillment status.
- `src/routers/payment.router.ts` for checkout creation and webhook handling.
- Payment webhooks should verify provider signatures before updating orders.

Keep product listing public for the MVP. When the product grows, auth can be added only where needed, for example to allow sellers to manage their own products.
