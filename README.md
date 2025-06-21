# POSSE: PSM Online System for Software Engineering Program

> An integrated web-based platform to streamline and enhance the management of Final Year Projects (PSM) at MJIIT, UTM Kuala Lumpur.

---

## Description

**POSSE** is a centralized system designed to replace the fragmented and error-prone processes currently used for managing Final Year Projects. It consolidates tools such as Google Forms, Sheets, and Drive into a cohesive platform that improves **efficiency**, **accuracy**, and **communication** among stakeholders—**students**, **supervisors**, **evaluators**, and **course coordinators**.

Built using a **hybrid Waterfall-Agile** methodology with a **React frontend** and **Django backend**, POSSE offers structured workflows, real-time updates, and secure data handling.

---

## 🚀 Features

- **User Authentication & Management**  
  Role-based login for students, supervisors, evaluators, and coordinators.

- **Course Phase Management**  
  Dashboard and calendar showing deadlines, announcements, and course stages.

- **Supervisor Selection**  
  Students can view, select, and track supervisor assignments.

- **Document Management**  
  Access to centralized resources: templates, forms, and lecture materials.

- **Submission Management**  
  Report and logbook uploads with supervisor/evaluator access.

- **Feedback System**  
  Annotated feedback files and comment upload/download support.

- **Grading Module**  
  Grade submission and management via a structured scheme; student grade viewing.

- **Admin Panel (Django Admin)**  
  Admin interface to manage users, periods, rubrics, and submissions with bulk import/export.

- **PDF Annotation Tool**  
  In-browser markup tool for reviewing and commenting on PDF submissions.

---

## Technologies Used

### Frontend

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI (MUI)](https://mui.com/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

### Backend

- [Django](https://www.djangoproject.com/)
- [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
- [Python](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [PgAdmin 4](https://www.pgadmin.org/)
- [Django Import Export](https://github.com/django-import-export/django-import-export)
- [Jazzmin](https://github.com/farridav/django-jazzmin)

### Deployment

- [Vercel](https://vercel.com/) – Frontend
- [Render](https://render.com/) – Backend & PostgreSQL DB

---

## Getting Started

### Prerequisites

- Node.js (LTS) & npm or Yarn
- Python 3.9+ & pip
- Git
- PostgreSQL (optional for local prod-like setup)

---

### Backend Setup (Django)

- 1. Clone the repo
git clone <your-repo-url>
cd backend

- 2. Setup virtual environment
python -m venv venv
source venv/bin/activate # macOS/Linux
OR
.\venv\Scripts\activate # Windows

- 3. Install dependencies
pip install -r requirements.txt

- 4. Database Setup
SQLite (default):
python manage.py migrate
OR PostgreSQL
- Start PostgreSQL
- Create DB: createdb posse_db
- Update settings in backend/settings/dev.py
- Run migrations:
python manage.py migrate

- 5. Create .env file
Inside backend/.env:
DJANGO_ENV=development
DB_NAME=db name
DB_USER=db username
DB_PASSWORD=db password
DB_HOST=db host
DB_PORT=db port
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

 - 6. Create admin user
python manage.py createsuperuser

- 7. Start backend server
python manage.py runserver

### Frontend Setup (React)

- 1. Navigate to frontend
cd frontend

- 2. Install dependencies
npm install
OR
yarn install

- 3. Create .env file
Inside frontend/.env:
VITE_APP_API_URL=http://localhost:8000

- 4. Start development server
npm start
OR
yarn start
