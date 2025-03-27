# MOOJ - Mathematical Online Open Judge

MOOJ is an online judge platform for mathematics proofs with LLM-powered evaluation. Unlike traditional programming platforms, MOOJ evaluates mathematical solutions submitted as text or images of handwritten proofs.

<img src="https://placeholder.com/logo.png" alt="Moo the Cow" width="200"/>

*Meet Moo, our mathematical cow mascot!*

## Key Features

- **Submit Math Proofs**: Upload images of handwritten solutions or enter LaTeX directly
- **Automated Evaluation**: Get instant feedback on your proofs using LLM technology
- **Appeal System**: Contest evaluation results with justifications
- **Problem Library**: Explore problems across difficulty levels (1-9) and topics
- **Progress Tracking**: Monitor your improvement with visual statistics

## Core Evaluation Pipeline

1. User submits a solution (direct input or image)
2. If image: System converts to LaTeX using OCR technology
3. Solution is analyzed for errors (logical, mathematical, syntactical)
4. Detailed feedback and score are provided to the user
5. Users can appeal specific errors with justifications for reconsideration

## Tech Stack

- **Frontend**: React with TypeScript, Material-UI
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy
- **Evaluation**: LLM-powered proof validation
- **Deployment**: Docker and Docker Compose

## Quick Start

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Docker and Docker Compose

### Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mooj.git
   cd mooj
   ```

2. Set up backend
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Edit with your settings
   ```

3. Set up frontend
   ```bash
   cd ../frontend
   npm install
   ```

4. Start the development servers
   ```bash
   # Terminal 1 (Backend)
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload

   # Terminal 2 (Frontend)
   cd frontend
   npm start
   ```

5. Visit http://localhost:3000 to see the application

### Using Scripts (Windows PowerShell)

For convenience, you can use our PowerShell scripts:

```powershell
# Start backend
.\scripts\run_backend_local.ps1

# Start frontend (in a new terminal)
.\scripts\run_frontend_local.ps1

# Deploy with Docker
.\scripts\deploy_local.ps1
```

## Documentation

MOOJ's documentation is organized into these files:

1. **[Development Guide](docs/development/guide.md)** - Standards, workflow, and progress tracking
2. **[Cursor Rules](.cursorrules)** - Core development rules for contributors
3. **[Technical Specification](docs/technical-specification.md)** - System design and requirements
4. **[Implementation Plan](docs/implementation-plan.md)** - Step-by-step implementation roadmap
5. **[Deployment Guide](docs/deployment-guide.md)** - Instructions for deploying the application

> 📚 **Documentation Directory**: All documentation files are in the [`docs/`](docs/) directory with consistent formatting and tables of contents for easy navigation. Cursor rules are in the [`.cursorrules`](.cursorrules) file at the project root.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mooj.git
cd mooj
```

### 2. Setup Development Environment

#### Windows (PowerShell)
```powershell
.\scripts\setup_dev_environment.ps1
```

#### Unix/Linux/macOS (Bash)
```bash
chmod +x scripts/setup_dev_environment.sh
./scripts/setup_dev_environment.sh
```

This setup script will:
- Set up Python virtual environment and install dependencies
- Install Node.js dependencies for the frontend
- Check Docker availability
- Create necessary environment files
- Show the current implementation phase and next steps

### 3. Run the Backend

#### Windows (PowerShell)
```powershell
.\scripts\run_backend_local.ps1
```

#### Unix/Linux/macOS (Bash)
```bash
chmod +x scripts/run_backend_local.sh
./scripts/run_backend_local.sh
```

### 4. Run the Frontend

#### Windows (PowerShell)
```powershell
.\scripts\run_frontend_local.ps1
```

#### Unix/Linux/macOS (Bash)
```bash
chmod +x scripts/run_frontend_local.sh
./scripts/run_frontend_local.sh
```

### 5. Deploy with Docker (Alternative)

#### Windows (PowerShell)
```powershell
.\scripts\deploy_local.ps1
```

#### Unix/Linux/macOS (Bash)
```bash
chmod +x scripts/deploy_local.sh
./scripts/deploy_local.sh
```

### 6. Run Tests

#### Windows (PowerShell)
```powershell
.\scripts\run_backend_tests.ps1
```

#### Unix/Linux/macOS (Bash)
```bash
chmod +x scripts/run_backend_tests.sh
./scripts/run_backend_tests.sh
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Project Structure

```
/
├── backend/                 # FastAPI application
│   ├── app/                 # Application code
│   │   ├── api/             # API router and endpoints
│   │   │   └── v1/          # API version 1
│   │   │       ├── endpoints/ # Resource-specific endpoints
│   │   │       └── api.py   # Main API router
│   │   ├── core/            # Core functionality
│   │   │   └── config.py    # Application configuration
│   │   ├── crud/            # CRUD database operations
│   │   ├── db/              # Database setup and models
│   │   │   ├── models/      # SQLAlchemy models
│   │   │   ├── session.py   # Database session
│   │   │   └── base.py      # Base model class
│   │   ├── evaluation/      # Proof evaluation
│   │   ├── schemas/         # Pydantic schemas
│   │   └── main.py          # Entry point
│   ├── docs/                # Backend-specific docs
│   │   ├── DEVELOPMENT.md   # Development guide
│   │   └── README.md        # Documentation index
│   ├── tests/               # Test suite
│   │   ├── api/             # API tests
│   │   ├── core/            # Core functionality tests
│   │   ├── crud/            # CRUD operation tests
│   │   ├── db/              # Database tests
│   │   ├── evaluation/      # Evaluation pipeline tests
│   │   ├── utils/           # Test utilities
│   │   └── conftest.py      # Test fixtures
│   ├── .env                 # Environment variables
│   ├── .env.example         # Example environment file
│   ├── Dockerfile           # Docker configuration
│   ├── healthcheck.py       # Container health check
│   └── requirements.txt     # Python dependencies
├── frontend/                # React application
│   ├── docs/                # Frontend documentation
│   │   ├── DEVELOPMENT.md   # Development guide
│   │   ├── SOLUTIONS.md     # Code examples
│   │   ├── TROUBLESHOOTING.md # Troubleshooting
│   │   └── README.md        # Documentation index
│   ├── public/              # Public assets
│   ├── scripts/             # Frontend utility scripts
│   ├── src/                 # Source code
│   │   ├── assets/          # Static assets (images, styles)
│   │   ├── components/      # UI components
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Data models
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── theme/           # UI theming
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── .env                 # Frontend environment variables
│   ├── Dockerfile           # Frontend Docker configuration
│   └── package.json         # Frontend dependencies
├── docs/                    # Project documentation
│   ├── development/         # Development docs
│   │   ├── guide.md         # Dev guide
│   │   └── cursor_rules.md  # Core rules
│   ├── technical-specification.md
│   ├── implementation-plan.md
│   └── deployment-guide.md
├── scripts/                 # Project utility scripts
│   ├── deploy_local.ps1     # Docker deployment (Windows)
│   ├── deploy_local.sh      # Docker deployment (Unix)
│   ├── run_backend_local.ps1
│   ├── run_backend_local.sh
│   ├── run_frontend_local.ps1
│   ├── run_frontend_local.sh
│   ├── setup_dev_environment.ps1
│   └── setup_dev_environment.sh
└── docker-compose.yml       # Docker configuration
```

## License

MIT License - see [LICENSE](LICENSE) file 