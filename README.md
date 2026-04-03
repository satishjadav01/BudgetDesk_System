# LedgerFlow :bar_chart:

![Django](https://img.shields.io/badge/Django-5.1.8-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.4-1F1B4D?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-0F172A?style=for-the-badge&logo=tailwind-css&logoColor=38BDF8)
![JWT Auth](https://img.shields.io/badge/Auth-JWT_Cookies-0F766E?style=for-the-badge)
![PDF Export](https://img.shields.io/badge/Invoices-PDF_Export-B91C1C?style=for-the-badge)

LedgerFlow is a full-stack finance workspace for freelancers, founders, and service teams who want invoicing and expense control in one clean operating system. Create polished invoices, export client-ready PDFs, track spend in real time, and monitor business performance from a dashboard built for action.

Detailed technical documentation is available in [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

## Live Demo

[View Live Demo](https://budget-desk-system.vercel.app/)

## Features

- Secure user authentication with JWT-based sessions stored in HttpOnly cookies
- Create, edit, manage, and track invoices with payment status visibility
- Download professional invoice PDFs for client sharing and record keeping
- Track expenses by category and month to keep spending organized
- Monitor income, expenses, and profit from a clean dashboard with charts
- Filter ledger views with shareable query-based search and sorting

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | `React` `Vite` `Tailwind CSS` `Axios` `React Router` `Recharts` |
| Backend | `Django` `Django REST Framework` `Simple JWT` `django-filter` `ReportLab` |
| Database | `SQLite` for local development, `PostgreSQL` ready for production |
| Architecture | Monorepo structure with separate frontend and backend apps |

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd Expence_Tracker
```

### 2. Set up the backend

SQLite is enabled by default, so you can run the backend locally without extra database setup.

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Optional local environment file:

```env
SECRET_KEY=change-me
DEBUG=True
USE_SQLITE=True
```

Backend runs on `http://127.0.0.1:8000`.

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4. Start using the app

- Register a new account from the frontend
- Log in to access the protected dashboard
- Create invoices, track expenses, and review monthly performance

## Free Hosting

The most practical free setup for this project is:

- `Render` for the Django API
- `Render Static Site` for the React frontend
- `Neon` for free PostgreSQL

This repo now includes:

- `render.yaml` for Render blueprint deployment
- `backend/.env.example` with production variable examples
- `frontend/public/_redirects` for SPA routing on refresh

For production, make sure these values are updated:

- `VITE_API_BASE_URL` to your deployed backend URL
- `ALLOWED_HOSTS` to your backend domain
- `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to your frontend domain
- `JWT_COOKIE_SECURE=True`
- `JWT_COOKIE_SAMESITE=None`
- `USE_SQLITE=False` with your Postgres credentials

## Folder Structure

```text
Expence_Tracker/
|-- backend/
|   |-- apps/
|   |   |-- expenses/
|   |   |-- invoices/
|   |   `-- users/
|   |-- config/
|   |-- manage.py
|   |-- requirements.txt
|   `-- db.sqlite3
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- auth/
|   |   |-- components/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- router/
|   |   `-- utils/
|   |-- package.json
|   `-- vite.config.js
|-- PROJECT_DOCUMENTATION.md
`-- README.md
```

## Future Improvements

- Recurring invoices and scheduled billing cycles
- Email delivery and payment reminders for invoices
- CSV export and deeper financial reporting
- Team roles, permissions, and multi-user workspaces
- Payment gateway integration for faster collections

## Author

**Satis**  
Full-stack developer focused on building product-first web applications with strong backend foundations and polished user experiences. Available for freelance builds, startup collaborations, and client projects.
