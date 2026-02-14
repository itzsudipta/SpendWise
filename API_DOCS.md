# SpendWise API Documentation

Base URL: `http://localhost:3001`

## Common Response Shape (JSON APIs)
Most JSON endpoints return:

```json
{
  "status": 200,
  "message": "Human readable message",
  "data": {}
}
```

Errors usually return:

```json
{
  "status": 400,
  "message": "Validation or server error message",
  "error": "Detailed error (non-production)"
}
```

## Health & Root

### GET `/health`
- Description: Health check.
- Response: `200 { status, message }`

### GET `/`
- Description: Database connectivity test.
- Response: `200` plain text

---

## Users (`/api/user`)

### GET `/api/user`
- Description: Get all users.

### GET `/api/user/:id`
- Description: Get user by ID.
- Params:
  - `id` (number)

### POST `/api/user`
- Description: Create user.
- Body:
```json
{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "password": "secret"
}
```

### PUT `/api/user/:id`
- Description: Update user.
- Params:
  - `id` (number)
- Body:
```json
{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "password": "new-secret"
}
```

### PATCH `/api/user/:id/bank-balance`
- Description: Update opening bank balance for current balance tracking.
- Params:
  - `id` (number)
- Body:
```json
{
  "bank_opening_balance": 50000
}
```

### DELETE `/api/user/:id`
- Description: Delete user.
- Params:
  - `id` (number)

---

## Transactions / Expenses (`/api/expenses`)
Note: This module supports both `expense` and `income` via `ex_type`.

### GET `/api/expenses`
- Description: Get all transaction rows from `expense` table.

### GET `/api/expenses/:id`
- Description: Get transaction by ID.
- Params:
  - `id` (number)

### POST `/api/expenses`
- Description: Create transaction.
- Body:
```json
{
  "user_id": 1,
  "cy_id": 1,
  "ex_amount": 1200.5,
  "ex_desc": "Salary",
  "ex_data": "2026-02-14",
  "ex_type": "income"
}
```
- Validation:
  - `user_id`, `cy_id`, `ex_amount` required
  - `ex_amount > 0`
  - `ex_type` is `expense` or `income` (default `expense`)

### PUT `/api/expenses/:id`
- Description: Update transaction.
- Params:
  - `id` (number)
- Body: Same shape as POST.

### DELETE `/api/expenses/:id`
- Description: Delete transaction.
- Params:
  - `id` (number)

### GET `/api/expenses/user/:user_id`
- Description: Get transactions by user.
- Params:
  - `user_id` (number)

### GET `/api/expenses/category/:cy_id`
- Description: Get transactions by category.
- Params:
  - `cy_id` (number)

### GET `/api/expenses/details/all`
- Description: Get joined details (user + category fields).

---

## Categories (`/api/categories`)

### GET `/api/categories`
- Description: Get all categories.

### GET `/api/categories/user/:user_id`
- Description: Get categories by user.
- Params:
  - `user_id` (number)

### GET `/api/categories/:cy_id`
- Description: Get category by ID.
- Params:
  - `cy_id` (number)

### POST `/api/categories`
- Description: Create category.
- Body:
```json
{
  "user_id": 1,
  "cy_name": "Groceries"
}
```

### PUT `/api/categories/:cy_id`
- Description: Update category.
- Params:
  - `cy_id` (number)
- Body:
```json
{
  "user_id": 1,
  "cy_name": "Food"
}
```

### DELETE `/api/categories/:cy_id`
- Description: Delete category.
- Params:
  - `cy_id` (number)

---

## Budgets (`/api/budgets`)

### GET `/api/budgets`
- Description: Get all budgets.

### GET `/api/budgets/:id`
- Description: Get budget by ID.
- Params:
  - `id` (number)

### POST `/api/budgets`
- Description: Create budget.
- Body:
```json
{
  "user_id": 1,
  "b_mnth": "2026-02",
  "limit_amount": 10000
}
```
- Validation:
  - `b_mnth` format: `YYYY-MM`
  - one budget per user per month (conflict if duplicate)

### PUT `/api/budgets/:id`
- Description: Update budget.
- Params:
  - `id` (number)
- Body:
```json
{
  "user_id": 1,
  "b_mnth": "2026-02",
  "limit_amount": 12000
}
```

### DELETE `/api/budgets/:id`
- Description: Delete budget.
- Params:
  - `id` (number)

### GET `/api/budgets/user/:user_id`
- Description: Get budgets by user.
- Params:
  - `user_id` (number)

### GET `/api/budgets/user/:user_id/month/:b_mnth`
- Description: Get budget by user and month.
- Params:
  - `user_id` (number)
  - `b_mnth` (`YYYY-MM`)

### GET `/api/budgets/user/:user_id/month/:b_mnth/summary`
- Description: Get budget with computed `spent_amount` and `remaining_amount`.
- Params:
  - `user_id` (number)
  - `b_mnth` (`YYYY-MM`)

---

## Reports (`/api/reports`)

### GET `/api/reports/monthly/live?user_id={id}&month={YYYY-MM}`
- Description: Generate and download live monthly PDF report from current data.
- Query:
  - `user_id` (number, required)
  - `month` (`YYYY-MM`, required)
- Response:
  - `application/pdf`

### POST `/api/reports/monthly/auto/generate`
- Description: Generate and store month-end report in DB (`monthly_report_archive`).
- Body:
```json
{
  "user_id": 1,
  "month": "2026-01"
}
```
- Rules:
  - Only allowed for completed months.

### GET `/api/reports/monthly/auto?user_id={id}&month={YYYY-MM}`
- Description: Download auto-generated report PDF from DB storage.
- Query:
  - `user_id` (number, required)
  - `month` (`YYYY-MM`, required)
- Response:
  - `application/pdf`
  - `404` if report not generated yet

### GET `/api/reports/monthly/auto/users?month={YYYY-MM}`
- Description: Get user IDs with month activity (budget or transactions).
- Query:
  - `month` (`YYYY-MM`, required)

---

## Scheduled Automation (Server)

Automatic month-end job:
- Runs at `00:05` on day 1 of each month.
- Generates previous month auto reports.
- Stores PDF in DB table: `monthly_report_archive`.
- Carries forward previous month budgets into the new month if not already present.

Bootstrap behavior on server start:
- Tries to run auto report generation for previous month once.

---

## Data Notes

- `expense.ex_type` values: `expense`, `income`
- `user_data.bank_opening_balance` used for current balance formula in frontend:
  - `opening_balance + total_income - total_expense`
- Month format used across APIs: `YYYY-MM`
