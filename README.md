# Online Bookstore Application

This is a full-stack application for an online bookstore that displays books from a database with pagination, sorting capabilities, and responsive design.

## Features

- RESTful API with ASP.NET Core
- React frontend with TypeScript
- Book listing with pagination
- Ability to sort by any field (client-side)
- Responsive UI with Bootstrap
- SQLite database integration

## Prerequisites

- .NET 8.0 SDK
- Node.js (v16+) and npm
- A modern web browser

## Project Structure

- `/backend` - ASP.NET Core Web API
- `/frontend` - React + TypeScript frontend application

## Getting Started

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd BookStoreApp
```

2. Install dependencies:
```bash
npm install
npm run install:frontend
```

### Running the Application

You can run both the frontend and backend concurrently:

```bash
npm start
```

Or run them separately:

- Backend:
```bash
npm run backend
```

- Frontend:
```bash
npm run frontend
```

### Backend API Endpoints

- GET `/api/Books` - Get all books with pagination and sorting
  - Query Parameters:
    - `pageNumber` (default: 1)
    - `pageSize` (default: 5)
    - `sortField` (default: "title")
    - `sortOrder` (default: "asc")

- GET `/api/Books/{id}` - Get a specific book by ID

## Database

The application uses a SQLite database (`Bookstore.sqlite`) which contains a pre-populated collection of books.

## Technologies Used

- ASP.NET Core 8.0
- Entity Framework Core
- React 19
- TypeScript
- Bootstrap 5
- Axios for API calls
- SQLite for database 