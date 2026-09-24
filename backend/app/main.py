from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("medinova-backend")

app = FastAPI(
    title="MediNova AI API",
    description="The Future of AI-Powered Healthcare - Backend Services",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    logger.info("Health check endpoint triggered")
    return {
        "status": "healthy",
        "service": "MediNova AI Backend",
        "version": "1.0.0"
    }

from app.services.ml_service import ml_service, HeartDiseasePredictionInput, HeartDiseasePredictionOutput

@app.get("/api/ml/metrics")
async def get_ml_metrics():
    """Retrieve evaluation metrics for the trained Kaggle Heart Disease ML model"""
    logger.info("Retrieving ML model evaluation metrics")
    return ml_service.metrics

@app.post("/api/ml/predict-heart-disease", response_model=HeartDiseasePredictionOutput)
async def predict_heart_disease(payload: HeartDiseasePredictionInput):
    """Predict cardiovascular risk probability using trained Random Forest ML pipeline"""
    logger.info(f"Running ML heart disease prediction for patient age {payload.age}")
    result = ml_service.predict(payload)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
