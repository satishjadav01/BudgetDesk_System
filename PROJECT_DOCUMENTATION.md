# Project Documentation

## Overview

This project is a full-stack invoice and expense tracker built as a monorepo.

- Frontend: React, Vite, Tailwind CSS, Axios, React Router, Recharts
- Backend: Django, Django REST Framework, Simple JWT, django-filter, ReportLab
- Database: SQLite by default, PostgreSQL supported through environment variables

The application lets users:

- Register and log in with email/password
- Create, edit, list, and delete invoices
- Generate invoice PDFs
- Create, edit, list, and delete expenses
- View dashboard summaries for income, expenses, profit, and monthly activity

## Repository Structure

```text
Expence_Tracker/
  backend/
    apps/
      users/
      invoices/
      expenses/
    config/
    manage.py
    requirements.txt
    db.sqlite3
  frontend/
    src/
      api/
      auth/
      components/
      layouts/
      pages/
      router/
      utils/
    package.json
  README.md
  PROJECT_DOCUMENTATION.md
```

## Architecture

### Frontend

The frontend is a React single-page application.

- [main.jsx](./frontend/src/main.jsx) bootstraps the app
- [AuthContext.jsx](./frontend/src/auth/AuthContext.jsx) manages session state
- [ProtectedRoute.jsx](./frontend/src/auth/ProtectedRoute.jsx) protects authenticated routes
- [AppRouter.jsx](./frontend/src/router/AppRouter.jsx) defines app routing
- [DashboardLayout.jsx](./frontend/src/layouts/DashboardLayout.jsx) wraps the protected pages

Main pages:

- `/login`
- `/register`
- `/dashboard`
- `/invoices`
- `/expenses`

### Backend

The backend is a Django REST API split into three apps.

- `users`: authentication, session handling, dashboard endpoints
- `invoices`: invoice CRUD and PDF generation
- `expenses`: expense CRUD and filtering

Core backend configuration lives in:

- [settings.py](./backend/config/settings.py)
- [urls.py](./backend/config/urls.py)
- [exception_handler.py](./backend/config/exception_handler.py)

## Authentication Flow

The app uses JWT tokens stored in HttpOnly cookies.

1. User logs in through `POST /api/v1/auth/login/`
2. Backend sets `access_token` and `refresh_token` cookies
3. Frontend sends requests with `withCredentials: true`
4. If a request returns `401`, the Axios client tries `POST /api/v1/auth/refresh/`
5. Protected routes redirect unauthenticated users to `/login`

Frontend API configuration is in [client.js](./frontend/src/api/client.js).

## Data Models

### User

Defined in [models.py](./backend/apps/users/models.py).

Fields:

- `email`
- `full_name`
- `is_active`
- `is_staff`
- `created_at`
- `updated_at`

### Invoice

Defined in [models.py](./backend/apps/invoices/models.py).

Important fields:

- `owner`
- `invoice_number`
- `client_name`
- `client_email`
- `issue_date`
- `due_date`
- `currency`
- `tax_percent`
- `subtotal`
- `tax_amount`
- `total_amount`
- `status`
- `notes`
- `created_at`
- `updated_at`

Invoice items are stored in `InvoiceItem`:

- `invoice`
- `name`
- `quantity`
- `unit_price`
- `line_total`

### Expense

Defined in [models.py](./backend/apps/expenses/models.py).

Fields:

- `owner`
- `title`
- `amount`
- `category`
- `expense_date`
- `notes`
- `created_at`
- `updated_at`

Supported categories:

- `Office`
- `Travel`
- `Software`
- `Utilities`
- `Other`

## API Endpoints

Base URL:

- `http://localhost:8000/api/v1`
- `http://127.0.0.1:8000/api/v1`

### Auth

- `POST /auth/register/`
- `POST /auth/login/`
- `POST /auth/refresh/`
- `POST /auth/logout/`
- `GET /auth/me/`

### Dashboard

- `GET /dashboard/summary/`
- `GET /dashboard/monthly/?year=2026`

Summary response returns:

- `total_income`
- `total_expenses`
- `profit`

Monthly response returns a 12-row list with:

- `month`
- `income`
- `expenses`

### Invoices

- `GET /invoices/`
- `POST /invoices/`
- `GET /invoices/{id}/`
- `PUT /invoices/{id}/`
- `PATCH /invoices/{id}/`
- `DELETE /invoices/{id}/`
- `GET /invoices/{id}/pdf/`

Invoice list supports:

- pagination
- search on invoice number, client name, and client email
- ordering on issue date, created date, total amount, and status
- filtering by status, currency, `date_from`, and `date_to`

### Expenses

- `GET /expenses/`
- `POST /expenses/`
- `GET /expenses/{id}/`
- `PUT /expenses/{id}/`
- `PATCH /expenses/{id}/`
- `DELETE /expenses/{id}/`

Expense list supports:

- pagination
- search on title and category
- ordering on expense date, created date, and amount
- filtering by category, `date_from`, `date_to`, and `month`

## Response Format

Successful endpoints generally return one of these envelopes:

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": true,
  "message": "Invoice created.",
  "data": {}
}
```

Errors are normalized by the custom exception handler:

```json
{
  "success": false,
  "message": "Request could not be processed.",
  "errors": {
    "detail": "..."
  }
}
```

## Frontend Pages

### Login Page

- Sends credentials through `authService.login`
- On success, redirects to the originally requested route or `/dashboard`

### Register Page

- Creates a new user
- Redirects to `/login` after successful registration

### Dashboard Page

- Loads summary and monthly data from `dashboardService`
- Shows income, expenses, profit, strongest month, and expense ratio

### Invoices Page

- Loads invoice list from `invoiceService.list`
- Supports filters through URL query parameters
- Opens invoice form for create/edit
- Supports PDF download

### Expenses Page

- Loads expenses from `expenseService.list`
- Loads dashboard summary to compare expenses against income
- Supports filters through URL query parameters
- Opens expense form for create/edit

## Business Logic Notes

### Invoice totals

Invoice totals are calculated server-side in [services.py](./backend/apps/invoices/services.py).

The backend computes:

- line totals for each item
- subtotal
- tax amount
- total amount

Invoice numbers are also generated on the backend in the format:

- `INV-<year>-000001`

### Dashboard data

Dashboard summary totals are aggregated from:

- invoices for `total_income`
- expenses for `total_expenses`
- their difference for `profit`

Monthly dashboard data returns 12 months for the selected year, even when some months contain zero values.

## Setup

### Backend

```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Default backend URL:

- `http://127.0.0.1:8000`

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Default frontend URL:

- `http://localhost:5173`

## Environment Variables

Environment variables are loaded from `backend/.env`.

Important backend variables:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `USE_SQLITE`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `JWT_COOKIE_SECURE`
- `JWT_COOKIE_SAMESITE`

Optional frontend variable:

- `VITE_API_BASE_URL`

If `VITE_API_BASE_URL` is not set, the frontend automatically uses the current browser hostname with port `8000`.

## Testing

Backend tests currently cover:

- auth registration and login
- dashboard summary and monthly responses
- invoice total calculation
- invoice PDF download and owner scoping
- expense filtering by category and month

Run tests:

```powershell
cd backend
python manage.py test
```

## Known Notes

- SQLite is enabled by default through `USE_SQLITE=True`
- PostgreSQL configuration is already supported when `USE_SQLITE=False`
- API list endpoints are paginated with a default page size of `10`
- The frontend build currently shows a large bundle-size warning, but the app still builds successfully

## Suggested Next Improvements

- Add a dedicated `.env.example` file if you want easier onboarding
- Add frontend automated tests
- Add API schema documentation with Swagger or DRF Spectacular
- Add role-based access if multiple user types are needed
