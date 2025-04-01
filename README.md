# MOOJ - Mathematical Online Open Judge

MOOJ is an online judge platform for mathematics proofs, aiming to provide automated evaluation and feedback using LLM technology.

## Documentation

**For detailed information on setup, usage, architecture, and development, please refer to the [main documentation](./docs/index.md).**

## Quick Start (Docker)

### Using Bash (Linux/Mac)

```bash
# Ensure Docker & Docker Compose are installed
# Clone the repository
cd mooj

# Build and run
docker compose up --build

# Access: http://localhost:3000
```

### Using PowerShell (Windows)

```powershell
# Ensure Docker Desktop is installed and running
# Clone the repository
cd mooj

# Deploy locally
.\scripts\deploy_local.ps1

# Access: http://localhost:3000
```

To stop the application in PowerShell:
```powershell
docker compose down
```

## License

MIT License - see [LICENSE](LICENSE) file 