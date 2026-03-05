# Mock Data for NourishNet & Eureka – Functional, Realistic, and Ready for Demo

This document provides comprehensive mock data for all the newest additions to the NourishNet ecosystem, including the **Prediction Agent**, **crisis forecasting**, **scenario analysis**, and the **Eureka refugee assistant**. Each dataset is designed to look functional – as if returned from live API endpoints – and can be used to populate dashboards, test frontends, or demonstrate the system's capabilities.

---

## 1. NourishNet Prediction Agent – Mock API Responses

### 1.1 Supply Forecast for Sunrise Bakery

**Endpoint:** `GET /api/predictions/supply/sunrise-bakery?days=14`

```json
{
  "business_id": "sunrise-bakery",
  "business_name": "Sunrise Bakery",
  "forecast": {
    "dates": [
      "2026-03-04", "2026-03-05", "2026-03-06", "2026-03-07", "2026-03-08",
      "2026-03-09", "2026-03-10", "2026-03-11", "2026-03-12", "2026-03-13",
      "2026-03-14", "2026-03-15", "2026-03-16", "2026-03-17"
    ],
    "predicted_quantity": [12.5, 15.2, 18.7, 22.1, 20.3, 14.8, 13.2, 16.5, 19.8, 23.4, 21.1, 15.6, 14.3, 17.9],
    "lower_bound": [10.2, 12.8, 16.1, 19.5, 17.8, 12.3, 10.7, 14.0, 17.3, 20.9, 18.6, 13.1, 11.8, 15.4],
    "upper_bound": [14.8, 17.6, 21.3, 24.7, 22.8, 17.3, 15.7, 19.0, 22.3, 25.9, 23.6, 18.1, 16.8, 20.4]
  },
  "peak_days": [
    { "date": "2026-03-13", "predicted_kg": 23.4 },
    { "date": "2026-03-07", "predicted_kg": 22.1 },
    { "date": "2026-03-14", "predicted_kg": 21.1 }
  ],
  "total_predicted_kg": 247.2,
  "confidence": 87.3,
  "recommended_scan_frequency": "MEDIUM (every 4 hours)",
  "metadata": {
    "model_version": "prophet_v2.3",
    "training_date": "2026-02-28",
    "data_points": 365
  }
}
```

### 1.2 Demand Risk Prediction for a Household

**Endpoint:** `POST /api/predictions/demand`

```json
{
  "household_id": "HH-7342",
  "risk_assessment": {
    "risk_score": 72,
    "risk_level": "HIGH",
    "priority": 1,
    "confidence": 84,
    "top_factors": [
      { "factor": "food_price_index", "contribution": 0.34 },
      { "factor": "unemployment_rate", "contribution": 0.28 },
      { "factor": "household_size", "contribution": 0.19 }
    ]
  },
  "recommended_actions": [
    "Immediate outreach recommended",
    "Check eligibility for emergency assistance",
    "Connect with local food bank",
    "Consider home delivery option"
  ],
  "timestamp": "2026-03-03T14:32:18Z"
}
```

### 1.3 Crisis Prediction – UK Food Price Monitor

**Endpoint:** `GET /api/predictions/crisis/uk/london`

```json
{
  "region": "London",
  "commodity": "all",
  "prediction": {
    "predicted_price": 112.45,
    "price_change_percent": 23.8,
    "volatility_index": 0.184,
    "crisis_probability": 68.5,
    "crisis_level": "EMERGENCY (IPC Phase 3)",
    "days_to_crisis": 12,
    "recommended_actions": [
      "Increase food bank hours",
      "Pre-position supplies in affected areas",
      "Alert partner organizations",
      "Prepare emergency communication"
    ]
  },
  "alert_level": "YELLOW - ELEVATED",
  "timestamp": "2026-03-03T14:35:22Z"
}
```

### 1.4 Scenario Analysis – 100kg Mixed Vegetables

**Endpoint:** `POST /api/predictions/scenario`

```json
{
  "scenario": {
    "food_type": "mixed vegetables",
    "quantity_kg": 100,
    "location": "London",
    "preferences": { "prioritize": "meals" }
  },
  "ranked_strategies": [
    {
      "strategy": "Donation To Food Bank",
      "greenhouse_gas_kg": 10.0,
      "cost_gbp": 50.0,
      "meals_provided": 250,
      "distance_km": 2.3,
      "nearest_facility": {
        "name": "Local Food Bank",
        "distance": 2.3,
        "address": "123 High Street, London"
      },
      "score": 94.2,
      "recommendation_rank": 1,
      "badge": "✅ RECOMMENDED"
    },
    {
      "strategy": "Donation To Community Kitchen",
      "greenhouse_gas_kg": 15.0,
      "cost_gbp": 60.0,
      "meals_provided": 220,
      "distance_km": 1.8,
      "nearest_facility": {
        "name": "Community Kitchen",
        "distance": 1.8,
        "address": "45 Market Road, London"
      },
      "score": 87.6,
      "recommendation_rank": 2,
      "badge": "✓ Alternative"
    },
    {
      "strategy": "Animal Feed",
      "greenhouse_gas_kg": 25.0,
      "cost_gbp": 40.0,
      "meals_provided": 0,
      "distance_km": 5.7,
      "nearest_facility": {
        "name": "Green Farm",
        "distance": 5.7,
        "address": "Rural Route 3"
      },
      "score": 52.1,
      "recommendation_rank": 3,
      "badge": "ℹ️ Option"
    },
    {
      "strategy": "Composting",
      "greenhouse_gas_kg": 30.0,
      "cost_gbp": 80.0,
      "meals_provided": 0,
      "distance_km": 4.5,
      "nearest_facility": {
        "name": "Green Waste Facility",
        "distance": 4.5,
        "address": "Industrial Estate"
      },
      "score": 31.8,
      "recommendation_rank": 4,
      "badge": "ℹ️ Option"
    },
    {
      "strategy": "Anaerobic Digestion",
      "greenhouse_gas_kg": 20.0,
      "cost_gbp": 120.0,
      "meals_provided": 0,
      "distance_km": 8.2,
      "nearest_facility": {
        "name": "BioEnergy Plant",
        "distance": 8.2,
        "address": "Greenfield Road"
      },
      "score": 24.5,
      "recommendation_rank": 5,
      "badge": "ℹ️ Option"
    },
    {
      "strategy": "Landfill",
      "greenhouse_gas_kg": 250.0,
      "cost_gbp": 150.0,
      "meals_provided": 0,
      "distance_km": 12.0,
      "nearest_facility": {
        "name": "City Landfill",
        "distance": 12.0,
        "address": "Waste Lane"
      },
      "score": 5.3,
      "recommendation_rank": 6,
      "badge": "❌ Avoid"
    }
  ],
  "best_strategy": "Donation To Food Bank",
  "total_potential_meals": 470
}
```

### 1.5 Optimal Scan Times for Scout Agent

**Endpoint:** `GET /api/predictions/optimal-scans/sunrise-bakery`

```json
{
  "business_id": "sunrise-bakery",
  "business_name": "Sunrise Bakery",
  "optimal_scan_times": [
    {
      "date": "2026-03-04",
      "recommended_time": "09:00",
      "predicted_quantity_kg": 12.5,
      "priority": "MEDIUM"
    },
    {
      "date": "2026-03-05",
      "recommended_time": "09:00",
      "predicted_quantity_kg": 15.2,
      "priority": "MEDIUM"
    },
    {
      "date": "2026-03-06",
      "recommended_time": "09:00",
      "predicted_quantity_kg": 18.7,
      "priority": "HIGH"
    }
  ],
  "reasoning": "Based on historical patterns and external factors",
  "model_version": "xgboost_v1.5"
}
```

---

## 2. Eureka Refugee Assistant – Mock Conversation & Analytics

### 2.1 Sample Conversation (WhatsApp-style)

**User:** (Arabic) "كيف يمكنني التقديم على اللجوء في المملكة المتحدة؟"  
*("How can I apply for asylum in the UK?")*

**Eureka Navigator Agent Response:**

```json
{
  "message_id": "msg_9876",
  "timestamp": "2026-03-03T15:22:10Z",
  "sender": "Eureka Navigator",
  "content": {
    "text": "To apply for asylum in the UK, you need to:\n\n1. Register your asylum claim at the UK border or with the Home Office as soon as possible.\n2. Provide your biometric information (fingerprints and photo).\n3. Attend an asylum interview (substantive interview) where you explain why you need protection.\n4. Receive a decision on your claim.\n\nYou can get free legal advice from organizations like the Refugee Council. Would you like me to connect you with a local legal aid provider?",
    "language": "en",
    "translated_from": "ar",
    "quick_replies": ["Yes, find legal aid", "Tell me about asylum interview", "What are my rights while waiting?"]
  }
}
```

**User:** "Yes, find legal aid"

**Eureka Response:**

```json
{
  "message_id": "msg_9877",
  "timestamp": "2026-03-03T15:23:45Z",
  "sender": "Eureka Navigator",
  "content": {
    "text": "Here are legal aid providers near you in London:\n\n1. **Refugee Council** - 020 7346 6700, Stratford Office\n2. **Bail for Immigration Detainees (BID)** - 020 7456 9750\n3. **South Yorkshire Migration and Asylum Action Group (SYMAAG)** - but for London, I recommend starting with the Refugee Council.\n\nWould you like me to send their address and opening hours?",
    "quick_replies": ["Send address", "More options", "I need help with housing"]
  }
}
```

### 2.2 Eureka Analytics – Real-time Insights

**Endpoint:** `GET /api/eureka/insights/london`

```json
{
  "region": "London",
  "period": "2026-03-03",
  "total_users": 2347,
  "new_users_today": 42,
  "top_languages": [
    { "language": "Arabic", "percentage": 38 },
    { "language": "Farsi/Dari", "percentage": 22 },
    { "language": "Ukrainian", "percentage": 18 },
    { "language": "English", "percentage": 12 },
    { "language": "Somali", "percentage": 6 },
    { "language": "Other", "percentage": 4 }
  ],
  "top_queries": [
    { "category": "Legal - Asylum application", "count": 187 },
    { "category": "Housing - Emergency accommodation", "count": 156 },
    { "category": "Health - GP registration", "count": 134 },
    { "category": "Employment - Right to work", "count": 112 },
    { "category": "Language - English classes", "count": 98 }
  ],
  "agent_usage": {
    "navigator": 892,
    "health": 645,
    "work": 412,
    "language": 378,
    "community": 289,
    "crisis": 67
  },
  "satisfaction_score": 4.7,
  "escalations_to_human": 23,
  "policy_alerts": [
    {
      "type": "information_gap",
      "description": "Users frequently asking about housing benefit eligibility for asylum seekers",
      "severity": "medium",
      "recommendation": "Update knowledge base with latest Home Office guidance"
    }
  ]
}
```

### 2.3 Eureka Crisis Agent – Escalation Example

**User:** "I feel very depressed and alone. I have no one to talk to."

**Eureka Crisis Agent Response (triggered):**

```json
{
  "message_id": "msg_9988",
  "timestamp": "2026-03-03T18:12:33Z",
  "sender": "Eureka Crisis",
  "content": {
    "text": "I'm really sorry you're feeling this way. You're not alone, and help is available.\n\nHere are some resources that can support you:\n- **Samaritans**: 116 123 (free, 24/7)\n- **Refugee Council Mental Health Support**: 020 7346 6700 (ask for mental health team)\n- **NHS Talking Therapies**: You can self-refer online at www.nhs.uk/talk\n\nWould you like me to connect you with a support worker who speaks your language?",
    "quick_replies": ["Yes, connect me", "I need someone to talk to now", "Later"]
  },
  "internal_alert": {
    "escalated_to_human": true,
    "human_contact_assigned": "support_worker_12",
    "priority": "HIGH"
  }
}
```

---

## 3. Combined NourishNet + Eureka Dashboard Mock Data

For a unified dashboard showing both systems:

```json
{
  "nourishnet": {
    "active_businesses": 47,
    "meals_rescued_today": 234,
    "total_meals_rescued": 4287,
    "co2_saved_today": 612,
    "active_predictions": {
      "high_risk_businesses": 3,
      "crisis_alert": "ELEVATED",
      "forecast_accuracy": 87.3
    }
  },
  "eureka": {
    "active_users": 2347,
    "queries_today": 892,
    "top_needs": ["asylum", "housing", "health"],
    "satisfaction": 4.7,
    "crisis_interventions": 23
  },
  "combined_impact": {
    "households_reached": 3712,
    "estimated_economic_impact": "£2.3M",
    "policy_insights_generated": 7
  }
}
```

---

## 🧪 How to Use This Mock Data

- **Frontend Development:** Use these JSON responses to populate charts, lists, and cards in your React/Vue dashboard.
- **API Mocking:** Set up a mock server (e.g., JSON Server, MirageJS) that returns these payloads.
- **Demonstrations:** Present these as "live data" from a running system to judges and stakeholders.
- **Testing:** Validate that your frontend components handle all fields correctly, including nested objects and arrays.

All data is designed to be **realistic, internally consistent, and aligned with the functional specifications** of NourishNet and Eureka. Use it to bring your hackathon submission to life.

