# NEXORA – Student Management System

NEXORA is a full-stack Student Management System developed as part of an onboarding project. It provides a centralized platform for managing students, courses, departments, enrollments, and user access through a role-based system.

The application follows a frontend-backend architecture, with a Next.js frontend communicating with a Spring Boot REST API and a PostgreSQL database hosted on Supabase.

## Features

- **Authentication & Authorization:** JWT-based authentication with Spring Security and role-based access control.
- **User Management:** Manage users and assign roles according to system permissions.
- **Student Management:** Manage student profiles and access student information.
- **Department Management:** Create, view, update, and manage academic departments.
- **Course Management:** Manage courses and their associated departments.
- **Enrollment Management:** Create and manage student course enrollments with duplicate-enrollment validation.
- **Role-Based Dashboards:** Provide role-specific access for administrators, teachers, and students.
- **RESTful API:** Separate backend endpoints for authentication and core management operations.
- **Database Management:** Persistent relational data storage using PostgreSQL and Spring Data JPA.
- **Containerization:** Docker and Docker Compose support for running the frontend and backend services.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- HTML & CSS

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven

### Database & Tools
- PostgreSQL (Supabase)
- Docker
- Docker Compose
- Flyway (database migration management)
- Postman (API testing)
- Git & GitHub

## System Architecture

The application follows a three-layer architecture:

```text
Next.js Frontend
       |
       | HTTP / REST API
       v
Spring Boot Backend
       |
       | Spring Data JPA / Hibernate
       v
PostgreSQL Database
     (Supabase)
```

## User Roles

| Role | Access |
|---|---|
| ADMIN | Manage users, students, departments, courses, and enrollments according to administrative permissions. |
| TEACHER | Access student information and manage courses and related academic operations permitted by the system. |
| STUDENT | Access personal profile information and view available courses and personal enrollments. |

## API Modules

The backend exposes REST API endpoints organized into the following modules:

| Module | Base Endpoint |
|---|---|
| Authentication | `/api/auth` |
| User Management | `/api/users` |
| Student Management | `/api/students` |
| Department Management | `/api/departments` |
| Course Management | `/api/courses` |
| Enrollment Management | `/api/enrollments` |

## Project Structure

```text
student-management-system/
├── frontend/             # Next.js frontend
├── backend/              # Spring Boot REST API
├── docker-compose.yml    # Multi-container configuration
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Java JDK compatible with the backend configuration
- Docker Desktop and Docker Compose (for containerized execution)
- A PostgreSQL database, such as Supabase
- Git

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd student-management-system
```

### 2. Configure Environment Variables

Configure the required environment variables before starting the application.

**Backend**

Create a `.env` file inside the `backend` directory:

```env
DB_URL=your_postgresql_jdbc_url
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

Configure any additional variables required by the backend, including JWT settings, according to the application's configuration.

**Frontend**

Configure the API URL using the environment variable expected by the frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Do not commit actual credentials, secret keys, or production environment variables to GitHub. Use an `.env.example` file to document the required variables safely.

### 3. Run the Backend

From the project root:

```bash
cd backend
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS or Linux:

```bash
./mvnw spring-boot:run
```

The backend will be available at:

`http://localhost:8080`

### 4. Run the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

`http://localhost:3000`

### 5. Run with Docker Compose

From the project root, ensure the required environment variables are configured and run:
Make sure you run this in the project root folder!
```bash
docker compose up --build
```

To run the containers in the background:

```bash
docker compose up -d
```

To stop the services:

```bash
docker compose down
```

The frontend and backend run in separate containers. The PostgreSQL database remains hosted on Supabase unless the Docker configuration is changed.

## Database Management

The application uses PostgreSQL for relational data storage, with Spring Data JPA and Hibernate handling persistence and entity relationships.

Flyway can be used to version and apply database schema changes through migration scripts, helping maintain consistent database structures across development environments.

Database credentials should be supplied through environment variables rather than hardcoded in the source code.

## Security

- JWT-based authentication.
- Spring Security for request authorization.
- Role-based access control for ADMIN, TEACHER, and STUDENT users.
- Protected API endpoints based on user permissions.
- Environment-based configuration for sensitive credentials.

## Testing

Postman can be used to test the REST API endpoints, including authentication, CRUD operations, request validation, and role-based access restrictions.

## Development Workflow

The project uses Git and GitHub for source control and collaborative development, with feature branches used to organize changes.

## Future Improvements

- Expand automated unit and integration test coverage.
- Improve application monitoring and logging.
- Extend deployment and cloud infrastructure.
- Further enhance API documentation and validation.

## Author

**Mohamed Fayas**

Software Engineering Graduate | Backend Development

Portfolio: [fayasdev.vercel.app](https://fayasdev.vercel.app/)
