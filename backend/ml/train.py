"""
MediNova AI - Heart Disease ML Training Pipeline
Dataset: Kaggle Heart Disease Dataset (Cleveland UCI)
Task: Binary Classification of Cardiovascular Disease Risk
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from sklearn.pipeline import Pipeline
import joblib

def train_and_evaluate():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "data", "heart_disease.csv")
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 60)
    print(" MediNova AI - Training Cardiovascular Risk ML Model")
    print("=" * 60)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    # Load dataset
    df = pd.read_csv(data_path)
    print(f" Loaded dataset with {len(df)} samples and {df.shape[1]} columns.")
    print(f" Class balance: Normal (0) = {(df['target'] == 0).sum()}, Heart Disease (1) = {(df['target'] == 1).sum()}")

    # Separate features and target
    X = df.drop(columns=["target"])
    y = df["target"]
    feature_names = list(X.columns)

    # Train / Test split (80% train, 20% test with stratification)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f" Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Candidate Models to benchmark
    candidates = {
        "RandomForest": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", RandomForestClassifier(n_estimators=150, max_depth=6, random_state=42))
        ]),
        "GradientBoosting": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42))
        ]),
        "LogisticRegression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, C=0.8, random_state=42))
        ])
    }

    best_name = None
    best_pipeline = None
    best_roc_auc = -1.0
    benchmark_results = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, pipeline in candidates.items():
        pipeline.fit(X_train, y_train)
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="roc_auc")
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)

        benchmark_results[name] = {
            "cv_roc_auc_mean": round(float(np.mean(cv_scores)), 4),
            "cv_roc_auc_std": round(float(np.std(cv_scores)), 4),
            "test_accuracy": round(float(acc), 4),
            "test_precision": round(float(prec), 4),
            "test_recall": round(float(rec), 4),
            "test_f1": round(float(f1), 4),
            "test_roc_auc": round(float(roc_auc), 4),
        }

        print(f"\n--- {name} Benchmark ---")
        print(f"  5-Fold CV ROC-AUC: {np.mean(cv_scores):.4f} (+/- {np.std(cv_scores):.4f})")
        print(f"  Test Accuracy:    {acc * 100:.2f}%")
        print(f"  Test ROC-AUC:     {roc_auc:.4f}")
        print(f"  Test F1-Score:    {f1:.4f}")

        if roc_auc > best_roc_auc:
            best_roc_auc = roc_auc
            best_name = name
            best_pipeline = pipeline

    print(f"\n Champion Model Selected: {best_name} (Test ROC-AUC: {best_roc_auc:.4f})")

    # Evaluate champion model
    y_pred = best_pipeline.predict(X_test)
    y_prob = best_pipeline.predict_proba(X_test)[:, 1]
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature Importance analysis
    feature_importances = {}
    clf = best_pipeline.named_steps["clf"]
    if hasattr(clf, "feature_importances_"):
        for col, imp in sorted(zip(feature_names, clf.feature_importances_), key=lambda x: x[1], reverse=True):
            feature_importances[col] = round(float(imp), 4)
    elif hasattr(clf, "coef_"):
        for col, coef in sorted(zip(feature_names, clf.coef_[0]), key=lambda x: abs(x[1]), reverse=True):
            feature_importances[col] = round(float(coef), 4)

    # Save Model Artifact
    model_output_path = os.path.join(models_dir, "heart_disease_model.joblib")
    joblib.dump({
        "pipeline": best_pipeline,
        "feature_names": feature_names,
        "model_type": best_name
    }, model_output_path)
    print(f" Model saved to: {model_output_path}")

    # Save Metrics & Metadata
    metrics_data = {
        "model_type": best_name,
        "dataset": "Kaggle Heart Disease (UCI Cleveland)",
        "total_samples": len(df),
        "test_samples": len(X_test),
        "metrics": benchmark_results[best_name],
        "confusion_matrix": {
            "true_negative": cm[0][0],
            "false_positive": cm[0][1],
            "false_negative": cm[1][0],
            "true_positive": cm[1][1]
        },
        "feature_importances": feature_importances,
        "all_benchmarks": benchmark_results
    }

    metrics_path = os.path.join(models_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f" Evaluation metrics saved to: {metrics_path}")

    # Run quick sample test
    sample_healthy = [[45, 0, 1, 115, 180, 0, 0, 175, 0, 0.2, 2, 0, 2]]
    sample_risk = [[67, 1, 3, 160, 286, 1, 1, 108, 1, 2.6, 1, 3, 3]]
    prob_healthy = best_pipeline.predict_proba(pd.DataFrame(sample_healthy, columns=feature_names))[0, 1]
    prob_risk = best_pipeline.predict_proba(pd.DataFrame(sample_risk, columns=feature_names))[0, 1]

    print("\n Quick Verification Inference:")
    print(f"  Healthy profile -> Heart Disease Risk: {prob_healthy * 100:.1f}%")
    print(f"  High-risk profile -> Heart Disease Risk: {prob_risk * 100:.1f}%")
    print("=" * 60)
    print(" Training completed successfully!")

if __name__ == "__main__":
    train_and_evaluate()
