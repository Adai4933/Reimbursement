## Brief Introduction

This is a FastAPI based reimbursement server project.

To run this project, you need to change the config.json file to your own settings.
***

### How to run the project

Run the following command under the backend folder to start project: 

```bash
uvicorn src.main:app --reload
```

***

### Release Notes

#### v0.1.0 (2025-09-30)
1. Initial release of the reimbursement server project.
2. Implemented user authentication and authorization.
3. Set up database models.
4. Created API endpoints for 
   1. user login, registration, listing, suspension
   2. reimbursement ticket listing, creation, approval
   3. attachments uploading

***

### Enhance plan

1. Enhance logging and create log file.
2. Implement more robust error handling.
3. Use dependency injection.
4. Organize configuration files better.
5. Add Unit Tests.

***
