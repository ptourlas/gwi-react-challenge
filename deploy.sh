REGION=$(gcloud config get-value run/region)
PROJECT_ID=$(gcloud config get-value project)
IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/pennylane-guinea-pig/pennylane-guinea-pig-2:$(date +%Y%m%d%H%M%S)

gcloud builds submit --tag $IMAGE

gcloud run deploy pennylane-guinea-pig \
  --image $IMAGE \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --concurrency 80
