uvicorn app.main:app --reload

Create Database and User
Connect to PostgreSQL as the postgres user:

Then run these SQL commands:

-- Create a database
CREATE DATABASE fastapi_db;

-- Create a user
CREATE USER fastapi_user WITH PASSWORD 'your_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fastapi_db TO fastapi_user;

-- Exit
\q

