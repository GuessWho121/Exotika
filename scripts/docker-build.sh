#!/bin/bash

# Build production Docker image
echo "Building production Docker image..."
docker build -t exotika-creation:latest .

echo "Build complete!"
echo "To run the container:"
echo "docker run -p 3000:80 exotika-creation:latest"
echo ""
echo "Or use docker-compose:"
echo "docker-compose up -d"
