# Multi-Source Intelligence Fusion Dashboard

A sophisticated geospatial intelligence dashboard built with Django that visualizes and manages intelligence information from multiple sources on an interactive map.

## 🌟 Features

- **Interactive Map Interface**: Leaflet-powered map for visualizing intelligence points
- **Multi-Source Intelligence**: Support for OSINT, HUMINT, and IMINT data
- **REST API**: Full RESTful API for data management
- **CSV Upload**: Bulk import intelligence data via CSV files
- **Real-time Statistics**: Live dashboard with intelligence source breakdowns
- **Military-themed UI**: Dark terminal aesthetic with responsive design

## 🚀 Live Demo

**Deployed on Render:** [View Live Dashboard](https://your-service-name.onrender.com) *(Replace with your actual Render URL)*

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠 Tech Stack

- **Backend**: Django 4.2.7, Django REST Framework
- **Frontend**: Vanilla JavaScript, Leaflet.js, HTML5, CSS3
- **Database**: PostgreSQL (production) / SQLite (development)
- **Deployment**: Render
- **Other**: Pillow (image handling), WhiteNoise (static files)

## 📋 Prerequisites

- Python 3.8+
- pip
- Git
- PostgreSQL (for production)

## 🔧 Installation

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Akash-raj-INT/-Multi-Source-Intelligence-Fusion-Dashboard.git
   cd -Multi-Source-Intelligence-Fusion-Dashboard

   📖 Usage
Dashboard Features
Map View: Click anywhere on the map to auto-fill coordinates for new intelligence points
Add Intelligence Points: Fill the form with title, description, source type, and optional image
Statistics Panel: View real-time counts by intelligence source type
CSV Upload: Bulk import data using the provided CSV format
Sample Data Format
The sample_data.csv file contains sample intelligence points with the following columns:

title: Intelligence point title
description: Detailed description
lat: Latitude coordinate
long: Longitude coordinate
source_type: OSINT, HUMINT, or IMINT


🔌 API Endpoints
Intelligence Points
GET /api/points/ - List all intelligence points
POST /api/points/ - Create a new intelligence point
GET /api/points/{id}/ - Retrieve specific point
PUT /api/points/{id}/ - Update specific point
DELETE /api/points/{id}/ - Delete specific point
CSV Upload
POST /api/upload-csv/ - Upload CSV file for bulk import
Example API Usage

# Get all points
curl http://localhost:8000/api/points/

# Create a new point
curl -X POST http://localhost:8000/api/points/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Intel",
    "description": "Critical information",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "source_type": "OSINT"
  }'

  🚀 Deployment
Render Deployment
Fork/Clone this repository to GitHub

Create a new Render Web Service

Service Name: Multi-Source-Intelligence-Fusion-Dashboard
Environment: Python 3
Branch: main
Build Command: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
Start Command: gunicorn intel_dashboard.wsgi:application

DJANGO_SETTINGS_MODULE=intel_dashboard.settings
DEBUG=False
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=your-service-name.onrender.com


intel_dashboard/
├── manage.py                    # Django CLI tool
├── requirements.txt             # Python dependencies
├── sample_data.csv              # Sample intelligence data
├── intel_dashboard/             # Django project settings
│   ├── settings.py              # Main configuration
│   ├── urls.py                  # URL routing
│   └── wsgi.py                  # WSGI application
├── dashboard/                   # Main Django app
│   ├── models.py                # IntelligencePoint model
│   ├── views.py                 # API views
│   ├── serializers.py           # DRF serializers
│   ├── urls.py                  # App URL routing
│   ├── migrations/              # Database migrations
│   ├── templates/dashboard/
│   │   └── index.html           # Main dashboard template
│   └── static/dashboard/
│       ├── js/app.js            # Frontend JavaScript
│       └── css/style.css        # Dashboard styling
├── media/uploads/               # User-uploaded images
└── staticfiles/                 # Collected static files (production)

🙏 Acknowledgments
Built with Django and Django REST Framework
Map visualization powered by Leaflet.js
Dark theme inspired by military intelligence interfaces
Deployed on Render for reliable hosting
