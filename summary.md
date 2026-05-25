# CredExplain Fintech Platform

CredExplain is a full-stack, AI-powered fintech application designed for loan officers to manage, evaluate, and analyze loan applications. It provides intelligent prediction of loan approvals while offering transparent, SHAP-based explainability for the models' decisions.

## Project Architecture

The project is organized into a full-stack architecture with a React-based frontend, a FastAPI-based backend, and a robust predictive machine learning engine.

### 1. Frontend
The frontend provides a polished, modern, and responsive user interface for loan officers, focusing on glassmorphism-style design and real-time data visualization.
- **Framework:** React with Vite build tool.
- **Styling:** Tailwind CSS for utility-first styling and PostCSS.
- **Routing:** React Router v6 for clean single-page application navigation.
- **Charts and Visualization:** Recharts for rendering analytics and SHAP value contributions.
- **Icons:** Lucide-React for modern UI scalable vectors.
- **HTTP Client:** Axios for making requests to the FastAPI backend.

### 2. Backend
The backend powers the business logic, handles data persistence, and bridges the gap between the frontend requests and the machine learning models.
- **Framework:** FastAPI for high-performance, asynchronous REST API endpoints (`/predict`, `/explain`, `/models`, `/analytics`).
- **Database:** SQLite (`credexplain.db`) used as the primary data store.
- **ORM:** SQLAlchemy for database models and interactions models include `Application`, `Prediction`, and `Explanation`.
- **Validation:** Pydantic models (`schemas.py`) for ensuring data integrity of incoming requests and outgoing responses.

### 3. Machine Learning & Explainability
The prediction engine utilizes a sophisticated multi-model ensemble system accompanied by explainable AI techniques.
- **Ensemble Model Prediction Engine:** Uses a combination of 5 individual models to calculate a weighted average probability:
  - XGBoost (`xgb_model.pkl`)
  - Random Forest (`rf_model.pkl`)
  - LightGBM (`lgb_model.pkl`)
  - Gradient Boost (`gb_model.pkl`)
  - Neural Network (`nn_model.pkl`)
- **Risk Assessment:** Categorizes applications dynamically into "Low", "Medium", and "High" risk levels based on calculated probabilities.
- **Explainable AI (XAI):** Incorporates SHAP (SHapley Additive exPlanations) through saved explainers (`shap_explainer_xgb.pkl`, `shap_explainer_rf.pkl`) to identify the top positive/negative contributing features for individual loan application predictions. This gives loan officers human-readable plain text explanations for each automated decision.

## Core Workflows
1. **Application Submission:** New applications are submitted via the frontend, validated by FastAPI, and saved to the SQLite database.
2. **Prediction Pipeline:** The backend maps the application's characteristics against a vector of 39 features, loads the 5 ensemble models, and computes an average approval probability.
3. **Decision Explainability:** SHAP values are extracted to find which features most heavily influenced the decision, producing a human-readable explanation and visual feature contributions.
4. **Data Analytics:** All applications, predictions, and text explanations are persistently stored, allowing the frontend dashboard to display real-time approval rates, average credit scores, and aggregate risk distributions.
