## Ethics Guardrails for NourishNet Multi‑Agent System

NourishNet’s mission—fighting food waste and hunger—must be pursued with the highest ethical standards. As an autonomous multi‑agent system interacting with vulnerable populations, handling personal data, and making decisions that affect people’s well‑being, we embed **ethics guardrails** at every layer. These guardrails are not afterthoughts; they are core design principles, implemented in code and continuously monitored.

---

## 1. Core Ethical Principles

| Principle | Definition | Implementation in NourishNet |
|-----------|------------|------------------------------|
| **Beneficence** | Act in the best interest of users and society. | Agents prioritize recipients with highest urgency (food bank > individual if need greater). |
| **Non‑maleficence** | Do no harm. | Content moderation prevents unsafe/ inappropriate messages. Agents never encourage unsafe behaviour. |
| **Autonomy** | Respect human decision‑making. | Human‑in‑the‑loop for low‑confidence cases; users can opt out or request human. |
| **Justice** | Distribute benefits and burdens fairly. | Matching algorithms are audited for bias (e.g., no discrimination by race, gender). |
| **Transparency** | Make agent reasoning visible. | Agent “thought bubbles” and decision logs are shown in UI. |
| **Privacy** | Protect personal data. | Data minimisation, encryption, and compliance with GDPR/CCPA. |
| **Accountability** | Ensure responsibility for outcomes. | Full audit trail of every agent action and human override. |

---

## 2. Guardrails by Agent

### 2.1 Scout Agent – Responsible Detection

- **Content Moderation** – Before extracting data, the agent checks for profanity, personal information, or unsafe content using a lightweight moderation model (e.g., FLock with Llama Guard). If detected, the listing is flagged for human review and never published.

```python
async def moderate_text(text: str) -> bool:
    prompt = f"Does this message contain harmful content (violence, hate speech, personal info)? Answer only YES or NO.\nMessage: {text}"
    response = await call_flock("meta-llama/Llama-Guard-3-8B", prompt)
    return "YES" not in response  # Safe if not YES
```

- **Bias Prevention** – The extraction model is tested on diverse business names and food descriptions to avoid racial or cultural bias (e.g., assuming “ethnic” food is less valuable).

- **Data Minimisation** – Only fields relevant to food rescue are stored (no business owner names, addresses unless needed). All data is pseudonymised after 30 days.

### 2.2 Coordinator Agent – Fair Matching

- **Fairness‑Aware Matching** – The urgency scoring model is regularly audited for disparate impact. We use **equal opportunity metrics**: ensure that similarly situated recipients (e.g., two families with same profile) receive comparable scores.

```python
# Audit function (run weekly)
def audit_urgency_scores():
    groups = recipients.groupby('demographic_group')
    scores = groups['urgency'].mean()
    assert scores.std() < 0.1, "Potential bias detected"
```

- **Explainability** – When a match is made, the agent records the factors (distance, household size, food type) that contributed to the score. This is shown to supervisors on request.

- **Override Transparency** – Any human override of a match is logged with reason, and the log is reviewed periodically to detect systematic biases.

### 2.3 Logistics Agent – Safe Communication

- **Content Filtering** – All outbound messages are checked against a blocklist and moderation model to prevent accidental sharing of sensitive info.

- **Conversation Boundaries** – The agent is programmed to **not** engage in personal conversations, ask for private data, or provide medical/nutritional advice. If a user asks such questions, it politely declines and offers to connect to a human.

```python
if "diagnose" in user_message or "cure" in user_message:
    reply = "I'm sorry, I can't provide medical advice. Please consult a healthcare professional."
```

- **User Consent** – Before sending reminders, the agent checks if the user has opted out (via a preference stored in Redis). Users can text "STOP" to unsubscribe.

---

## 3. Human‑in‑the‑Loop (HITL) as an Ethics Mechanism

- **Low Confidence = Human Review** – Any agent decision with confidence below 0.9 is escalated to a human supervisor. This prevents the system from acting on uncertain or potentially harmful data.

- **Appeal Process** – Users can request human review of any decision (e.g., a match they believe is unfair) via a simple command. The request creates a task in the supervisor dashboard.

- **Audit Trail** – Every human intervention is logged with timestamp, agent state before/after, and reason. This enables post‑hoc analysis and continuous improvement.

---

## 4. Privacy & Data Governance

- **GDPR / CCPA Compliance** – Users can request deletion of their data via a `/delete_my_data` command. The system verifies identity (via WhatsApp/Telegram ID) and removes all associated records within 72 hours.

- **Encryption** – All personal data at rest is encrypted using AES‑256. In transit, TLS 1.3 is mandatory.

- **Data Retention** – Surplus records are anonymised after 30 days; conversation logs are deleted after 7 days unless flagged for audit.

- **Third‑Party APIs** – FLock, Groq, etc., receive only anonymised prompts (no personal identifiers). We use local models (Ollama) for sensitive data.

---

## 5. Transparency & Explainability

- **Agent Thoughts** – The UI displays each agent’s “current thought” (e.g., “Matching surplus #123… urgency: 0.92 for Food Bank”). This demystifies AI decisions.

- **Decision Logs** – Supervisors can view a detailed log of every inference, including the prompt sent to the LLM and the raw output, with highlighting of key factors.

- **Model Cards** – For each LLM used, we maintain a model card (following Hugging Face standards) describing its capabilities, limitations, and bias evaluations. These are published in the project documentation.

---

## 6. Safety & Reliability

- **Rate Limiting** – To prevent abuse, all external API calls are rate‑limited per user/business. This also protects against unintentional DDoS.

- **Fallback Mechanisms** – If an LLM provider returns unsafe content, the system discards it and falls back to a rule‑based response. If all providers fail, the agent pauses and alerts a human.

- **Red Teaming** – We periodically simulate adversarial inputs (e.g., attempts to get the agent to say something harmful) and adjust prompts accordingly.

---

## 7. Ethical AI Training & Governance

- **Bias Testing** – Before deploying a new model, we run it on a synthetic dataset of food listings and recipient profiles to measure fairness.

- **Stakeholder Feedback** – We collect feedback from NGOs and recipients via surveys and integrate their concerns into model tuning.

- **Ethics Review Board** – A small committee (including at least one external ethicist) reviews any major changes to the matching algorithm or data usage policy.

---

## 8. Code‑Level Implementation Examples

### 8.1 Content Moderation Middleware

```python
# middleware/safety.py
from functools import wraps
from agents.logistics import reply_with_fallback

def safety_filter(func):
    @wraps(func)
    async def wrapper(self, user_id, message, *args, **kwargs):
        # Check for blocklist
        if any(bad in message.lower() for bad in BLOCKLIST):
            await self.send_message(user_id, "I can't respond to that. Please keep our conversation respectful.")
            return
        
        # Check with moderation model
        if not await moderate_text(message):
            await self.send_message(user_id, "I'm unable to process that request. A human has been notified.")
            # Notify supervisor
            await self.create_human_task("User sent unsafe message", user_id=user_id)
            return
        
        return await func(self, user_id, message, *args, **kwargs)
    return wrapper
```

### 8.2 Fair Matching Audit

```python
# audit/fairness.py
def audit_matches(db_session):
    matches = db_session.query(Match).all()
    df = pd.DataFrame([(m.recipient_demographic, m.urgency) for m in matches],
                      columns=['group', 'urgency'])
    
    # Calculate mean urgency per group
    group_means = df.groupby('group')['urgency'].mean()
    
    # Check if any group mean deviates by more than 0.1 from overall mean
    overall_mean = df['urgency'].mean()
    for group, mean in group_means.items():
        if abs(mean - overall_mean) > 0.1:
            alert(f"Potential bias in group {group}: urgency mean {mean:.2f} vs overall {overall_mean:.2f}")
```

### 8.3 User Data Deletion Endpoint

```python
# api/privacy.py
@router.post("/delete_user/{user_id}")
async def delete_user_data(user_id: str, db: Session = Depends(get_db)):
    # Verify identity (simplified – in reality, use a token)
    # Delete from all tables
    db.query(Conversation).filter_by(user_id=user_id).delete()
    db.query(Recipient).filter_by(id=user_id).delete()
    db.query(Log).filter_by(user_id=user_id).delete()
    db.commit()
    return {"status": "deleted"}
```

---

## 9. Monitoring & Continuous Improvement

- **Dashboard Metrics** – Real‑time graphs showing:
  - Human intervention rate (target < 1%)
  - User complaints (per week)
  - Average urgency score by recipient demographic
  - Model confidence distribution

- **Automated Alerts** – If intervention rate spikes or a demographic group receives consistently lower urgency, an email is sent to the ethics board.

- **Quarterly Audits** – Full review of all logs by an independent auditor.

---

## 10. Conclusion

NourishNet’s ethics guardrails are not bolted‑on; they are woven into the fabric of the system. By combining technical controls (content filters, fairness audits) with human oversight (HITL, review board) and transparency, we ensure that our AI agents remain a force for good—trustworthy, fair, and respectful of the people they serve.

This commitment to ethical AI is a key differentiator for the FLock bounty and a foundation for real‑world deployment.

