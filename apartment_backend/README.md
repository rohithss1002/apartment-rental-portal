# Residential Apartment Rental Portal

A full-stack web application for managing residential apartment rentals, built using **Angular (Standalone Components)** and **Flask**, and deployed on **Google Cloud Platform**.

---

## Project Overview

The **Residential Apartment Rental Portal** provides a centralized platform to manage apartment complexes, tenants, and bookings with secure, role-based access.

This project demonstrates:
- Modern frontend architecture using Angular standalone components
- RESTful backend APIs with Flask
- JWT-based authentication
- Real cloud deployment using Google Cloud services

---

## Live Deployment

- **Frontend (Firebase Hosting – Google Cloud)**  
  ttps://<your-project-id>.web.app

- **Backend API (Google Cloud Run)**  
  https://<cloud-run-service-url>

---

## 🛠 Tech Stack

### Frontend
- Angular (Standalone Components)
- TypeScript, HTML, CSS
- Firebase Hosting (Google Cloud)

### Backend
- Python (Flask)
- REST APIs
- JWT Authentication
- Google Cloud Run

### Database (Planned)
- PostgreSQL
- Google Cloud SQL  
(Currently mocked data is used for demo purposes)

---

## System Architecture

Browser
↓
Angular Frontend (Firebase Hosting)
↓
Flask REST API (Cloud Run)
↓
PostgreSQL Database (Planned - Cloud SQL)

## Features

- Landing page with feature overview
- Role-based authentication (Admin / User)
- JWT-based login system
- Dashboard with system statistics
- Occupancy trend visualization
- Recent activity feed
- Secure routing and guarded pages
- Cloud-native deployment

---

## Demo Credentials

### Admin
Email: admin@apartment.com
Password: admin123
Role: ADMIN


### User
Email: user@apartment.com
Password: user123
Role: USER


---

Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Angular CLI
- Python 3.10+
- Docker & Docker Compose (optional)

---

Frontend Setup

```bash
cd frontend
npm install
ng serve
Frontend runs at:

http://localhost:4200
▶ Backend Setup
cd backend
pip install -r requirements.txt
python app.py
Backend runs at:

http://localhost:5000

Cloud Deployment:
Frontend

Built using Angular production build

Deployed via Firebase Hosting

Backend

Containerized Flask application

Deployed on Google Cloud Run

Testing:

Frontend tested via browser and incognito mode

Backend APIs tested using curl / Postman

Authentication and routing verified

Dashboard rendering validated

Limitations:

Database layer is mocked for demo stability

CRUD operations are limited in the current version

Payments and notifications are not implemented

Future Enhancements:

PostgreSQL integration using Google Cloud SQL

Full CRUD operations for apartments and tenants

Payment tracking and billing

Notifications and reporting

Enhanced admin controls

Refresh token–based authentication

Developer:

Name: Rohith
Role: Full Stack Developer
Technologies: Angular, Flask, Google Cloud, Firebase

✅ Conclusion

This project showcases full-stack development skills, modern Angular architecture, REST API design, and real-world cloud deployment using Google Cloud Platform. The system is designed to be scalable and production-ready with future enhancements.