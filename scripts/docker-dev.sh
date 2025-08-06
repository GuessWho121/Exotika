#!/bin/bash

# Run development environment with Docker
echo "Starting development environment..."
docker-compose -f docker-compose.dev.yml up --build

echo "Development server will be available at http://localhost:5173"
