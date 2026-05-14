#!/bin/bash

# Patient Hub Backend Installation Script

echo "🚀 Patient Hub Backend Setup Script"
echo "===================================="

# Check if PostgreSQL is installed
echo ""
echo "📦 Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "   Please install from: https://www.postgresql.org/download/"
    exit 1
fi
echo "✅ PostgreSQL found"

# Check if Node.js is installed
echo ""
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install from: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Create .env file if not exists
echo ""
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env created. Please edit with your database credentials."
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"

# Push schema to database
echo ""
echo "🗄️ Setting up database schema..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema to database"
    echo "   Make sure your DATABASE_URL in .env is correct"
    exit 1
fi
echo "✅ Database schema created"

# Success
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the server: npm run dev"
echo "2. View database: npm run db:studio"
echo "3. API docs: See API_DOCUMENTATION.md"
echo ""
echo "Server will run at: http://localhost:5000"
