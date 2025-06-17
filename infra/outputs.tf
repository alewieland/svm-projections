output "cloud_run_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.backend.status[0].url
}

output "bigquery_dataset" {
  description = "BigQuery dataset used for bet logging"
  value       = google_bigquery_dataset.bets.dataset_id
}
