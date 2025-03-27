# MOOJ - Mathematical Online Open Judge

MOOJ is an online judge for math proofs with LLM-powered evaluation.

<img src="https://placeholder.com/logo.png" alt="Moo the Cow" width="200"/>

*Meet Moo, our mathematical cow mascot!*

## Features

- **Math Problem Solving**: Tackle problems across difficulty levels (1-9)
- **Multiple Submission Types**: Direct answers or proof images
- **LLM Evaluation**: Instant feedback on mathematical proofs
- **Appeal System**: Contest evaluation results with justifications
- **Progress Tracking**: GitHub-like activity visualization
- **Role-Based Access**: Users, moderators, and administrators

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **LLM Integration**: For proof evaluation
- **Deployment**: Docker

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Docker

### Quick Start

1. Clone and install
   ```bash
   git clone https://github.com/yourusername/mooj.git
   cd mooj
   
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. Configuration
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env file with your configuration
   ```

3. Run development servers
   ```bash
   # Backend
   cd backend
   uvicorn app.main:app --reload

   # Frontend (separate terminal)
   cd frontend
   npm start
   ```

### Docker Deployment

```bash
docker-compose up -d
```

## Project Structure

```
mooj/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Core functionality
│   │   ├── db/              # Database models
│   │   ├── evaluation/      # Proof evaluation
│   │   └── main.py          # Entry point
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Application pages
│   │   └── services/        # API services
└── docker-compose.yml       # Docker configuration
```

## License

MIT License - see [LICENSE](LICENSE) file 