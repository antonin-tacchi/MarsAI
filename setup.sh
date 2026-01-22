#!/bin/bash
# Script to initialize environment files for Mac/Linux

if [ ! -f "Front-end/.env.local" ]; then
    echo "Creating Front-end/.env.local..."
    cp "Front-end/.env.local.example" "Front-end/.env.local"
    echo "✅ Created Front-end/.env.local"
else
    echo "✅ Front-end/.env.local already exists"
fi

if [ ! -f "back-end/.env" ]; then
    echo "Creating back-end/.env..."
    cp "back-end/.env.example" "back-end/.env"
    echo "✅ Created back-end/.env"
else
    echo "✅ back-end/.env already exists"
fi

echo ""
echo "Setup complete! You can now run: docker-compose up -d"
