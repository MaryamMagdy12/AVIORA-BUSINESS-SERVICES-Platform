# Aviora Business Services - Frontend Interfaces

This directory contains the frontend interfaces for the Aviora Business Services application.

## Projects

- **Client_interface**: Customer-facing React application for booking appointments and managing services
- **Admin_interface**: Admin dashboard for managing appointments, services, clients, and payments

## Setup Instructions

### Prerequisites

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Or install via winget: `winget install Git.Git`
   - Restart PowerShell after installation

2. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Recommended: LTS version

### Pushing to GitHub

1. Navigate to this directory:
   ```powershell
   cd "g:\CBS\CBS_site\Front"
   ```

2. Run the setup script:
   ```powershell
   .\push-to-github.ps1
   ```

3. Follow the prompts:
   - The script will check if Git is installed
   - Configure Git user name and email (if not already set)
   - Create a commit with your changes
   - Guide you through adding a GitHub remote
   - Push to GitHub

### Manual Setup

If you prefer to do it manually:

1. **Initialize Git repository:**
   ```powershell
   git init
   ```

2. **Configure Git (if not already done):**
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Add files:**
   ```powershell
   git add .
   ```

4. **Create initial commit:**
   ```powershell
   git commit -m "Initial commit: Add Client and Admin interfaces"
   ```

5. **Set branch to main:**
   ```powershell
   git branch -M main
   ```

6. **Create a repository on GitHub:**
   - Go to: https://github.com/new
   - Enter a repository name
   - Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

7. **Add remote and push:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

   **Note:** If using HTTPS, you'll need a Personal Access Token instead of a password.
   - Generate one at: https://github.com/settings/tokens
   - Use the token as your password when pushing

## Development

Each interface has its own `package.json` and can be developed independently.

### Client Interface
```powershell
cd Client_interface
npm install
npm run dev
```

### Admin Interface
```powershell
cd Admin_interface
npm install
npm run dev
```

## Notes

- `node_modules` and `dist` folders are excluded from Git (see `.gitignore`)
- Make sure to commit only source code, not build artifacts
- Each project should have its dependencies installed locally using `npm install`

