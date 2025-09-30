# Project introduction

This is a reimbursement project including the following function:
1. User registration and login
2. Submit single reimbursement request with upto 6 attachments
3. View reimbursement request details
4. Approve or reject reimbursement request (for EMPLOYER group users)
5. Employee management (for EMPLOYER group users)

***

## Setup DB 

1. Install PostgreSQL 17.6-1
2. Create a database named 'reimbursement'
3. Change the postgresql information in /backend/src/config.json file to match your server PostgreSQL setting

***

## Setup and run backend project

1. Install Python and pip.
2. Run `pip install uv` to install uvicorn.
3. Run `uv sync` to install dependencies in the backend folder.
4. Change the `/backend/src/config.template.json` file to fit your own setting, and rename it to `config.json`.
5. Run `uvicorn src.main:app --reload` to start the development server in the backend folder.

***

## Setup and run frontend project

1. Install Node.js 22.1.0 and pnpm
2. Run `pnpm install` to install dependencies in the frontend folder
3. Change the `/frontend/template.env.development` file to fit your own setting and rename it to `.env.development`, 
add `.env.production` for production setting.
4. Run `pnpm run dev` to start the development server in the frontend folder
5. Run `pnpm run build` to build the project in the frontend folder

***
