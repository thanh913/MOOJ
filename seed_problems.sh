#!/bin/bash
# Script to seed problems into the MOOJ database using Docker

echo "Updating problems in the MOOJ database..."
echo "This script will update existing problems and add new ones if needed."
echo ""

# Run the seed script inside the backend container
docker compose exec backend python -m scripts.seed_problems

echo ""
echo "Process completed." 