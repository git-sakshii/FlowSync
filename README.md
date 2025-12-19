# FlowSync

FlowSync is a modern Workflow Management SaaS application designed to streamline project tracking, task management, and team collaboration. It features a responsive dashboard, Kanban board, activity tracking, and real-time updates.

## Tech Stack

**Frontend:**
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS, Shadcn UI
- **State Management:** Zustand
- **Icons:** Lucide React
- **HTTP Client:** Axios

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** JWT (Access & Refresh Tokens)

---

## Prerequisites

Before starting, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/download/) (v14 or higher)

---

## Getting Started

### 1. Database Setup (PostgreSQL)

You need to have a PostgreSQL server running to use FlowSync.

#### Option A: Local Installation
1.  Install PostgreSQL from the [official website](https://www.postgresql.org/download/).
2.  During installation, set a password for the default `postgres` user.
3.  Open **pgAdmin** or a terminal and create a new database named `flowsync`.
    ```sql
    CREATE DATABASE flowsync;
    ```
4.  Your **Connection String** will look like this:
    ```
    postgresql://postgres:YOUR_PASSWORD@localhost:5432/flowsync
    ```
    *Replace `YOUR_PASSWORD` with the password you set.*

#### Option B: Docker
If you have Docker installed, you can quickly spin up a Postgres instance:
```bash
docker run --name flowsync-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=flowsync -p 5432:5432 -d postgres
```
*Connection String for Docker:* `postgresql://postgres:password@localhost:5432/flowsync`

#### Option C: Neon DB (Serverless Cloud)
If you prefer a cloud-hosted database without local installation:
1.  Go to [Neon.tech](https://neon.tech) and sign up.
2.  Create a new project.
3.  Copy the **Connection String** provided in the dashboard. It will look like:
    ```
    postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
    ```
4.  Use this string as your `DATABASE_URL` in the backend `.env` file.

---

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Variables**: Create a `.env` file in the `backend` directory based on `.env.example`.
    ```bash
    cp .env.example .env
    ```
    
    Edit the `.env` file and verify the configuration:
    ```env
    # Database Connection
    DATABASE_URL="postgresql://postgres:your_password@localhost:5432/flowsync"

    # JWT Secrets (Change these for production!)
    JWT_ACCESS_SECRET="complex_secret_key_access"
    JWT_REFRESH_SECRET="complex_secret_key_refresh"
    JWT_ACCESS_EXPIRES_IN="15m"
    JWT_REFRESH_EXPIRES_IN="7d"

    # Server Configuration
    PORT=5000
    NODE_ENV="development"
    FRONTEND_URL="http://localhost:3000"
    ```

4.  **Database Migration**: Run the Prisma migrations to create tables in your database.
    ```bash
    npm run prisma:migrate
    ```

5.  **Seed Database** (Optional): Populate the database with initial test data.
    ```bash
    npm run prisma:seed
    ```

6.  **Start the Server**:
    ```bash
    npm run dev
    ```
    The backend API should now be running on `http://localhost:5000`.

---

### 3. Frontend Setup

1.  Navigate to the project root (if not already there):
    ```bash
    cd ..
    ```
    *(If you are in the directory containing `package.json`, `app`, `components` folders)*

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Variables**: Create a `.env.local` file in the root directory.
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```
    *Note: Ensure this matches your backend URL. If you changed the backend PORT, update it here too.*

4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Features

- **Dashboard**: Overview of project progress, tasks stats, and recent activity.
- **Projects**: Create and manage projects with detailed descriptions.
- **Kanban Board**: Drag-and-drop task management with customizable columns.
- **Activity Log**: Track user actions (task movement, updates) in real-time.
- **Analytics**: Visual charts for task completion trends and team workload.
- **Settings**: Manage user profile, password, and notification preferences.
- **Command Palette**: Quickly navigate and search using `Cmd+K` (Mac) or `Ctrl+K` (Windows).

## Troubleshooting

-   **Database Connection Refused**: Ensure your PostgreSQL service is running. If using Docker, check if the container is up (`docker ps`). Verify the port (5432) and credentials in `.env`.
-   **Prisma Errors**: If you modify the `prisma/schema.prisma` file, remember to run `npm run prisma:generate` to update the client.
-   **CORS Errors**: If the frontend cannot communicate with the backend, check the `FRONTEND_URL` in `backend/.env` and ensure it matches the URL your browser is using (e.g., `http://localhost:3000`).

## License

MIT