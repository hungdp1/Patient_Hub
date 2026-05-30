-- Setup script for Patient Hub database
-- Run this as postgres superuser

-- Create user
CREATE USER "user" WITH PASSWORD 'password';

-- Create database
CREATE DATABASE patient_hub OWNER "user";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE patient_hub TO "user";