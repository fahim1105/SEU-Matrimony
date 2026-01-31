#!/usr/bin/env bash

# ============================================================================
# SEU MATRIMONY - ROBUST AUTHENTICATION SYSTEM
# Installation & Quick Start Script
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     SEU MATRIMONY - Authentication System Installation        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================================================
# STEP 1: Check Node.js Installation
# ============================================================================
print_step "Checking Node.js installation..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js is installed ($NODE_VERSION)"

# ============================================================================
# STEP 2: Check npm Installation
# ============================================================================
print_step "Checking npm installation..."

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm is installed ($NPM_VERSION)"

# ============================================================================
# STEP 3: Navigate to Server Directory
# ============================================================================
print_step "Navigating to Server directory..."

cd Server || {
    print_error "Server directory not found!"
    exit 1
}

print_success "In Server directory"

# ============================================================================
# STEP 4: Install Dependencies
# ============================================================================
print_step "Installing dependencies..."
echo "This may take a minute..."

npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# ============================================================================
# STEP 5: Check for .env file
# ============================================================================
print_step "Checking for .env file..."

if [ -f ".env" ]; then
    print_success ".env file found"
else
    print_warning ".env file not found"
    
    if [ -f ".env.example" ]; then
        print_step "Creating .env from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please edit .env with your credentials:"
        echo ""
        echo "  - DB_USER: Your MongoDB username"
        echo "  - DB_PASS: Your MongoDB password"
        echo "  - JWT_SECRET: Random 32+ character string"
        echo "  - EMAIL_USER: Your Gmail address"
        echo "  - EMAIL_PASSWORD: Gmail App Password"
        echo "  - FRONTEND_URL: http://localhost:3000"
        echo ""
        echo "  Command: nano .env"
        echo ""
    else
        print_error ".env.example not found!"
        exit 1
    fi
fi

# ============================================================================
# STEP 6: Display Installation Summary
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            ✓ INSTALLATION COMPLETE                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

print_success "All dependencies installed"
print_success "Environment file ready"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Configure your environment variables:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Get Gmail App Password:"
echo "   - Go to: https://myaccount.google.com/security"
echo "   - Enable 2-Step Verification"
echo "   - Find 'App Passwords' section"
echo "   - Select 'Mail' and 'Windows Computer'"
echo "   - Copy 16-character password"
echo "   - Paste as EMAIL_PASSWORD in .env"
echo ""
echo "3. Start the development server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "4. Server will start at:"
echo "   ${BLUE}http://localhost:5000${NC}"
echo ""
echo "5. Test the API:"
echo "   ${YELLOW}curl http://localhost:5000/${NC}"
echo ""

echo -e "${BLUE}Documentation Files:${NC}"
echo ""
echo "  - START_HERE.md              ← Read this first!"
echo "  - QUICK_REFERENCE.md         ← Quick commands and endpoints"
echo "  - BACKEND_SETUP.md           ← Detailed setup guide"
echo "  - AUTHENTICATION_SYSTEM.md   ← Complete API reference"
echo "  - FRONTEND_INTEGRATION.md    ← Frontend code examples"
echo "  - AUTHENTICATION_DIAGRAMS.md ← Visual architecture"
echo "  - IMPLEMENTATION_SUMMARY.md  ← Complete overview"
echo ""

echo -e "${BLUE}API Endpoints:${NC}"
echo ""
echo "  POST   /api/auth/register-email     Register with email/password"
echo "  POST   /api/auth/register-google    Register with Google"
echo "  POST   /api/auth/verify-email       Verify with OTP"
echo "  POST   /api/auth/resend-otp         Resend OTP"
echo "  POST   /api/auth/login              Login"
echo "  GET    /api/auth/me                 Get user (with JWT)"
echo "  POST   /api/auth/logout             Logout"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Ready to start? Open the documentation:"
echo ""
echo "  cd .. && cat START_HERE.md"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
