# MOOJ - Mathematical Online Open Judge

MOOJ is an online judge platform for mathematics proofs, aiming to provide automated evaluation and feedback using LLM technology.

## Documentation

**For detailed information on setup, usage, architecture, and development, please refer to the [main documentation](./docs/index.md).**

## Quick Start (Docker)

```bash
# Ensure Docker & Docker Compose are installed
# Clone the repository
cd mooj

# Optional: Seed database
./seed_problems.sh

# Build and run
docker compose up --build

# Access: http://localhost:3000
```

## License

MIT License - see [LICENSE](LICENSE) file 