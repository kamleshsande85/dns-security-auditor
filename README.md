# DNS Security Auditor

## Project Overview
DNS Security Auditor is a comprehensive security scanning tool that analyzes DNS configurations, email security protocols, and infrastructure security measures for domain names.

## Features
- **DNS Records Analysis**: Fetches and displays A, MX, TXT, CNAME, and NS records
- **Email Security Checks**: Validates SPF, DMARC, and DKIM configurations
- **Infrastructure Security**: Checks DNSSEC, TTL values, and domain expiry
- **Security Scoring**: Calculates security score (0-100) and assigns letter grades
- **PDF Reports**: Generates professional security audit reports
- **Scan History**: Maintains database of all scans with timestamps
- **Dashboard**: Real-time statistics and visualization

## Technology Stack

### Backend
- Django 4.2 (Python Web Framework)
- Django REST Framework (API)
- dnspython (DNS queries)
- python-whois (Domain information)
- ReportLab (PDF generation)
- SQLite3 (Database)

### Frontend
- React 19 (UI Framework)
- Axios (HTTP client)
- Tailwind CSS (Styling)

## Installation & Setup

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Start Django server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

The frontend will open at `http://localhost:3000`

## API Endpoints

### Core Endpoints
- `POST /api/scan/` - Perform basic domain scan
- `POST /api/advanced-scan/` - Perform advanced scan with detailed analysis
- `GET /api/history/` - Get list of recent scans (up to 50)
- `GET /api/history/<id>/` - Get specific scan details
- `GET /api/scan/<id>/` - Get scan details by ID
- `GET /api/export/<id>/` - Export scan as PDF
- `GET /api/dashboard/stats/` - Get dashboard statistics

## Usage

1. Open the web interface at `http://localhost:3000`
2. Enter a domain name in the input field (e.g., `example.com`)
3. Click "Start Scan" to begin the security audit
4. View results including:
   - Security score and grade
   - Email security configuration (SPF, DMARC, DKIM)
   - Infrastructure security details (DNSSEC, TTL, Domain Expiry)
   - DNS records
5. Download PDF report or view scan history

## Project Structure

```
dns-security-auditor/
├── backend/
│   ├── backend/
│   │   ├── settings.py       # Django configuration
│   │   ├── urls.py          # Main URL routing
│   │   └── wsgi.py
│   ├── scanner/
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # DRF serializers
│   │   ├── urls.py          # Scanner URLs
│   │   ├── dns_scanner.py   # Core scanning logic
│   │   └── migrations/
│   ├── manage.py
│   ├── requirements.txt      # Python dependencies
│   └── db.sqlite3
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard.jsx # Main dashboard component
│   │   ├── App.js
│   │   ├── index.js
│   │   └── App.css
│   ├── package.json         # Node dependencies
│   ├── tailwind.config.js   # Tailwind CSS config
│   └── postcss.config.js    # PostCSS config
└── README.md
```

## Security Scoring Breakdown

- **SPF Pass**: +20 points
- **DMARC Pass**: +20 points (or +10 for quarantine)
- **DNSSEC Enabled**: +30 points
- **Domain Expiry Critical**: -20 points
- **Maximum Score**: 100 points

## Grading Scale

- A+ : 90-100
- A  : 80-89
- B  : 70-79
- C  : 60-69
- D  : 50-59
- F  : Below 50

## Common Issues & Solutions

### DNS Resolution Failures
- Verify domain name is correct
- Check internet connectivity
- Some DNS queries may fail due to network restrictions

### WHOIS Lookup Failures
- Not all domains provide WHOIS information
- Some registrars restrict WHOIS queries

### PDF Export Issues
- Ensure ReportLab is installed correctly
- Check disk space for temporary files

## Contributing
This is a standalone project for DNS security auditing.

## License
MIT License

