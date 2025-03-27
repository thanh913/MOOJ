# MOOJ - Mathematical Online Open Judge

MOOJ is an online judge platform for mathematics proofs with LLM-powered evaluation. Users can submit solutions as LaTeX text or images of handwritten proofs for automated assessment and feedback.

<img src="https://placeholder.com/logo.png" alt="Moo the Cow" width="200"/>

*Meet Moo, our mathematical cow mascot!*

## Key Features

- **Submit Math Proofs**: Upload handwritten solutions or enter LaTeX
- **Automated Evaluation**: Get instant feedback using LLM technology
- **Appeal System**: Contest evaluation results with justifications
- **Problem Library**: Problems across difficulty levels (1-9) and topics
- **Progress Tracking**: Monitor your improvement with statistics

## Tech Stack

- **Frontend**: React with TypeScript, Material-UI
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL with SQLAlchemy
- **Evaluation**: LLM-powered proof validation
- **Deployment**: Docker and Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose (recommended)
- Alternatively: Node.js (v14+) and Python (v3.8+)

### Option 1: Deploy with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/mooj.git
cd mooj

# Deploy with Docker (Unix/Linux/macOS)
chmod +x scripts/deploy_local.sh
./scripts/deploy_local.sh

# Or on Windows (PowerShell)
./scripts/deploy_local.ps1

# Access the application at http://localhost:3000
```

### Option 2: Manual Setup

```bash
# Setup environment
chmod +x scripts/setup_dev_environment.sh
./scripts/setup_dev_environment.sh

# Run backend and frontend (in separate terminals)
./scripts/run_backend_local.sh
./scripts/run_frontend_local.sh
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Documentation Guide

MOOJ's documentation is organized by purpose:

| Document | Description | Primary Audience |
|----------|-------------|-----------------|
| [Development Guide](docs/development/guide.md) | Standards, workflow, progress tracking | Developers |
| [Technical Specification](docs/technical-specification.md) | System design and requirements | Developers, Architects |
| [Implementation Plan](docs/implementation-plan.md) | Step-by-step roadmap | Developers, Project Managers |
| [Deployment Guide](docs/deployment-guide.md) | Deployment instructions | DevOps, Sysadmins |
| [Cursor Rules](.cursorrules) | Core development rules | Contributors |

### For New Developers

Start with the Development Guide, then review the Technical Specification and current Implementation Plan.

### For Deployment

Follow the Deployment Guide which contains complete instructions for both local and production environments.

## Project Structure

```
/
├── backend/                 # FastAPI application
│   ├── app/                 # Application code
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Core functionality
│   │   ├── crud/            # Database operations
│   │   ├── db/              # Database models
│   │   ├── evaluation/      # Proof evaluation
│   │   └── schemas/         # Pydantic schemas
│   └── tests/               # Backend tests
├── frontend/                # React application
│   ├── src/                 # Source code
│   │   ├── components/      # UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── store/           # State management
│   └── tests/               # Frontend tests
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── docker-compose.yml       # Docker configuration
```

## Core Evaluation Pipeline

1. User submits a solution (text or image)
2. Image submissions are converted to LaTeX using OCR
3. Solution is analyzed for errors (logical, mathematical, syntactical)
4. Detailed feedback and score are provided
5. Users can appeal specific errors with justifications

## License

MIT License - see [LICENSE](LICENSE) file 