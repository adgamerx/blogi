# Blogi

A modern full-stack blogging platform with a clean UI, user authentication, and content management capabilities.

## 📋 Overview

Blogi is a feature-rich blogging platform that allows users to create, read, update, and delete blog posts. The application includes user authentication, profile management, image uploads, and a clean, responsive interface built with Material UI.

## 🚀 Features

- **User Authentication**: Register, login, and profile management
- **Blog Management**:
  - Create, read, update, and delete posts
  - Rich text content with image support
  - Author attribution and timestamps
- **Search Functionality**: Find posts by keywords
- **Responsive UI**: Works on desktop and mobile devices
- **Modern Design**: Clean interface with Material UI components

## 🛠️ Tech Stack

### Frontend
- Next.js (React framework)
- TypeScript
- Material UI
- React Hook Form
- Zustand (state management)
- Axios (API requests)
- React-toastify (notifications)
- date-fns (date formatting)

### Backend
- FastAPI (Python)
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Docker

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Python 3.8+
- Docker and Docker Compose (optional)

### Local Setup

#### Clone the repository
```bash
git clone https://github.com/yourusername/Blogi.git
cd Blogi
```

#### Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
# Install dependencies
npm install
# or
yarn install

# Create .env.local file with your API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
# or
yarn dev
```

### Docker Setup
```bash
# Start the entire application
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

## 🧭 Project Structure

```
Blogi/
├── backend/              # Backend FastAPI application
│   ├── app/              # Application modules
│   │   ├── api/          # API routes
│   │   ├── core/         # Core functionality
│   │   ├── db/           # Database models and config
│   │   └── services/     # Business logic
│   ├── requirements.txt  # Python dependencies
│   └── main.py           # Application entry point
│
├── frontend/             # Next.js frontend
│   ├── app/              # Next.js app directory
│   │   ├── components/   # Reusable components
│   │   ├── lib/          # Utility functions
│   │   ├── services/     # API service functions
│   │   └── store/        # State management
│   ├── public/           # Static assets
│   └── package.json      # Node dependencies
│
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation
```

## 📝 Usage

1. Register a new account or login with existing credentials
2. Create new blog posts with the "Create Post" button
3. View posts on the homepage and click to read details
4. Edit or delete your own posts from the post detail page
5. Search for posts using the search bar
6. View and edit your profile from the profile page

## 🔐 Authentication

The application uses JWT-based authentication. When logged in, the token is stored in local storage and automatically used for API requests requiring authentication.

## 🌐 API Endpoints

The backend provides the following main API endpoints:

- **Authentication**:
  - `POST /token` - Login and get access token
  - `POST /register` - Register new user

- **Users**:
  - `GET /users/{username}` - Get user details

- **Posts**:
  - `GET /posts` - List all posts (with pagination)
  - `GET /posts/{id}` - Get post by ID
  - `POST /posts` - Create new post (authenticated)
  - `PUT /posts/{id}` - Update post (authenticated)
  - `DELETE /posts/{id}` - Delete post (authenticated)
  - `GET /posts/search` - Search posts by query

## 👥 Contributors

This project was developed as part of a full-stack development assignment by datachecks.

## 📄 License

[MIT License](LICENSE)
