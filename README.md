# svm-projections

This repository contains a simple layered web application with a Vue.js frontend and a FastAPI backend.  Originally projection data was pulled directly from Google Sheets but it is now served from BigQuery via the backend.

## Structure

- `frontend/` – minimal Vue application
- `backend/` – FastAPI service exposing Firestore based APIs with full CRUD endpoints

## Development

1. Install Python dependencies and run the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn src.main:app --reload
   ```

2. Install the Firebase CLI and start the emulators for Firestore and Hosting:
   ```bash
   npm install -g firebase-tools
   firebase emulators:start --project svm-projections
   ```

3. Alternatively you can start everything using Docker:
   ```bash
   docker-compose up
   ```

4. Open `frontend/index.html` in your browser during local development.
   Admins can inspect all bets via `frontend/admin.html`.


The frontend uses Firebase Authentication. Update the configuration in
`frontend/index.html` with your Firebase project credentials.

Once logged in you can select a team and see the odds against the other clubs.
Submitting the form will create a bet in Firestore.

## Deployment

Terraform configuration is provided in the `infra/` directory. Copy
`terraform.tfvars.example` to `terraform.tfvars` and update the values for your
Google Cloud project and container image. Initialize and apply the configuration
to create a Cloud Run service:

```bash
cd infra
terraform init
terraform apply
```

The repository also contains a `cloudbuild.yaml` file which you can trigger with
Google Cloud Build to build and push the backend image referenced by the
Terraform configuration.

You can deploy the frontend using Firebase Hosting:

```bash
firebase deploy --only hosting --project svm-projections
```

The backend writes each created bet to BigQuery. Ensure a dataset named `svm`
and a table `bets` exist in your project so that writes succeed.  Projection
data is served from the table `svm.projections` and can be queried via
`GET /projections/{sheet_name}`.
