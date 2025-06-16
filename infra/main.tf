provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_service_account" "backend" {
  account_id   = "backend-service"
  display_name = "Backend Service Account"
}

resource "google_cloud_run_service" "backend" {
  name     = "svm-backend"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.backend.email
      containers {
        image = var.image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_project_service" "run" {
  service = "run.googleapis.com"
}

resource "google_project_service" "firestore" {
  service = "firestore.googleapis.com"
}
