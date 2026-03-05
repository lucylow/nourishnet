## Scalable Deployment of NourishNet – Multi‑Agent AI System

NourishNet is designed to operate at scale, handling thousands of businesses, recipients, and conversations simultaneously. This document outlines a production‑ready, scalable deployment architecture that leverages cloud‑native technologies, open‑source components, and best practices for high availability and elasticity.

---

### 1. Scalability Challenges

| Challenge | Description |
|-----------|-------------|
| **High message volume** | Thousands of surplus events and chat messages per second. |
| **Stateful conversations** | Logistics Agent must maintain per‑user context across messages. |
| **FLock API rate limits** | External LLM API may throttle requests. |
| **Variable load** | Peaks during business closing hours (surplus listings) and meal times (user inquiries). |
| **Multi‑channel webhooks** | WhatsApp/Telegram deliver messages asynchronously; need to handle spikes. |

---

### 2. High‑Level Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                            │
│                                                                        │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   │
│  │ Ingress    │   │ Ingress    │   │ Ingress    │   │            │   │
│  │ Controller │──▶│ Controller │──▶│ Controller │   │            │   │
│  └────────────┘   └────────────┘   └────────────┘   └────────────┘   │
│         │                 │                │                          │
│         ▼                 ▼                ▼                          │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   │
│  │ Scout      │   │ Coordinator│   │ Logistics  │   │ OpenClaw   │   │
│  │ Service    │   │ Service    │   │ Service    │   │ Gateway    │   │
│  │ (Deploy)   │   │ (Deploy)   │   │ (Deploy)   │   │ (Deploy)   │   │
│  └────────────┘   └────────────┘   └────────────┘   └────────────┘   │
│         │                 │                │                │          │
│         └─────────────────┼────────────────┼────────────────┘          │
│                           │                │                            │
│                    ┌──────▼──────┐  ┌──────▼──────┐                    │
│                    │   Message   │  │   Redis     │                    │
│                    │    Queue    │  │   (State)   │                    │
│                    │  (Kafka)    │  └─────────────┘                    │
│                    └─────────────┘                                      │
│                                                                         │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                     │
│  │ PostgreSQL │   │  MongoDB   │   │  Vector DB │                     │
│  │ (Recipients│   │ (Events)   │   │ (FAQs)     │                     │
│  │   & NGOs)  │   │            │   │            │                     │
│  └────────────┘   └────────────┘   └────────────┘                     │
└──────────────────────────────────────────────────────────────────────┘

                            │
                            ▼
                    ┌───────────────┐
                    │   FLock API   │
                    │  (external)   │
                    └───────────────┘
```

---

### 3. Component Breakdown

#### 3.1 Agents as Stateless Microservices

Each agent (Scout, Coordinator, Logistics) is deployed as a separate **Kubernetes Deployment** with multiple replicas. They are **stateless** – all persistent state is stored externally:

- **Conversation state** (Logistics Agent) → Redis
- **Recipient database** → PostgreSQL
- **Event log** → MongoDB / TimescaleDB
- **Vector cache** → FAISS with persistence or a dedicated vector DB (Qdrant, Weaviate)

**Benefits:**
- Horizontal scaling – just increase replicas.
- Rolling updates without downtime.
- Independent resource allocation (CPU/memory per agent).

#### 3.2 OpenClaw Gateway

The OpenClaw Gateway handles inter‑agent communication, session management, and model routing. It is also stateless and can be scaled horizontally. It uses a **shared message queue** (Kafka) to reliably pass events between agents.

#### 3.3 Message Queue (Kafka)

All inter‑agent events (`surplus.detected`, `match.ready`, `pickup.confirmed`) are published to Kafka topics. Agents consume from topics relevant to them. Kafka provides:

- **Durability** – events are persisted and can be replayed.
- **Ordering** – per‑partition ordering for conversation messages.
- **Scalability** – partitions allow parallel consumption.

#### 3.4 State Stores

| Store | Purpose | Technology | Scaling |
|-------|---------|------------|---------|
| **Conversation state** | Per‑user context for Logistics Agent | Redis Cluster | Redis Cluster with sharding |
| **Recipient database** | NGOs and individuals | PostgreSQL with read replicas | Horizontal read replicas, connection pooling |
| **Event archive** | Audit and analytics | MongoDB / TimescaleDB | Sharding |
| **Vector cache** | FAQ embeddings | FAISS with S3 backup / Qdrant | Partitioned |

#### 3.5 FLock API Integration

The FLock API is external; to handle rate limits and failures:

- **Local response cache** (Redis) for frequent queries.
- **Request queue** with backpressure – if rate limit is hit, requests are queued and retried with exponential backoff.
- **Fallback models** – if a model is unavailable, switch to another (as described in previous sections).

#### 3.6 Channel Adapters

WhatsApp (Twilio) and Telegram send messages asynchronously. We expose **webhook endpoints** for each channel, which are load‑balanced and handled by the Logistics Agent service. Webhook payloads are placed into a Kafka topic for reliable processing.

---

### 4. Kubernetes Deployment Example

#### 4.1 Namespace and ConfigMap

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: nourishnet
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nourishnet-config
  namespace: nourishnet
data:
  FLOCK_API_URL: "https://api.flock.io/v1/chat/completions"
  KAFKA_BROKERS: "kafka-cluster:9092"
  REDIS_URL: "redis-cluster:6379"
  POSTGRES_URL: "postgresql://user:pass@postgres:5432/nourishnet"
```

#### 4.2 Scout Agent Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scout-agent
  namespace: nourishnet
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scout-agent
  template:
    metadata:
      labels:
        app: scout-agent
    spec:
      containers:
      - name: scout
        image: nourishnet/scout:latest
        envFrom:
        - configMapRef:
            name: nourishnet-config
        - secretRef:
            name: flock-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
```

#### 4.3 Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: scout-agent-hpa
  namespace: nourishnet
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: scout-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Similar deployments for Coordinator and Logistics agents, with appropriate resource requests.

#### 4.4 Kafka Topic Configuration

```yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: surplus-detected
  namespace: nourishnet
  labels:
    strimzi.io/cluster: kafka-cluster
spec:
  partitions: 6
  replicas: 3
  config:
    retention.ms: 604800000  # 7 days
```

#### 4.5 Redis Cluster

Deploy Redis Cluster via Helm:

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis-cluster bitnami/redis-cluster --namespace nourishnet \
  --set cluster.nodes=3 \
  --set persistence.size=8Gi
```

---

### 5. Handling FLock API Rate Limits

FLock API likely imposes rate limits (e.g., requests per second). We employ:

- **Token bucket rate limiter** in each agent to stay within limits.
- **Request queuing** – when limit exceeded, requests are placed in a Redis queue and processed by a background worker.
- **Cache** – identical requests (e.g., same FAQ) served from Redis cache (TTL 1 hour).
- **Fallback chain** – if primary model is rate‑limited, try a different model with its own quota.

**Example rate limiter middleware for Logistics Agent:**

```python
from limits import strategies, storage, RateLimitItemPerSecond
import asyncio

storage = storage.RedisStorage("redis://redis-cluster:6379")
limiter = strategies.MovingWindowRateLimiter(storage)

async def call_flock_with_rate_limit(model, prompt):
    limit = RateLimitItemPerSecond(10, 1)  # 10 requests per second
    while not limiter.hit(limit, model):
        await asyncio.sleep(0.1)
    return await flock_inference(model, prompt)
```

---

### 6. Scaling Individual Components

| Component | Scaling Strategy | Notes |
|-----------|------------------|-------|
| **Scout Agent** | Horizontal (CPU/memory) + cron jobs for scheduled scans | Use Kubernetes CronJob for periodic scans instead of in‑agent timers. |
| **Coordinator Agent** | Horizontal, but ensure each surplus is processed by one replica – use Kafka partitions keyed by surplus ID. | Partition assignment ensures no duplicate matching. |
| **Logistics Agent** | Horizontal, but conversation state must be sticky – use consistent hashing on user ID to Redis shard, or route via user ID hash to same pod. | Use session affinity or a distributed cache that any pod can read/write. |
| **OpenClaw Gateway** | Stateless – scale horizontally behind a load balancer. | Gateway must share session store (Redis) if sessions are used. |
| **Kafka** | Partition scaling – increase partitions as load grows. | Monitor consumer lag. |
| **Redis** | Cluster mode with sharding. | For conversation state, use hash tags to keep all keys for a user in same shard. |
| **PostgreSQL** | Read replicas for recipient queries; write master for updates. | Use connection pooling (PgBouncer). |

---

### 7. Multi‑Region Deployment

To serve users globally and reduce latency:

- Deploy Kubernetes clusters in multiple regions.
- Use **global load balancer** (e.g., AWS Route53, GCP Global Load Balancer) to route traffic to nearest region.
- Database replication: PostgreSQL streaming replication cross‑region; Redis active‑passive with failover.
- Kafka MirrorMaker to replicate topics across regions for disaster recovery.

---

### 8. Monitoring and Observability

- **Metrics**: Prometheus + Grafana dashboards for agent health, queue lengths, FLock latency, error rates.
- **Logs**: Centralized with Loki or ELK stack.
- **Tracing**: OpenTelemetry to trace a request from webhook to pickup confirmation.
- **Alerts**: PagerDuty/Slack alerts for high error rates, queue backlog, or FLock API failures.

---

### 9. Cost Optimization

- **Spot instances** for stateless agents (Scout, Coordinator, Logistics) with pod disruption budgets.
- **Auto‑scale to zero** for non‑critical components during low traffic (using KEDA).
- **Cache aggressively** to reduce FLock API calls.
- **Use smaller models** (Gemma 2B) for high‑volume tasks where accuracy is less critical.

---

### 10. Deployment Pipeline

- CI/CD with GitHub Actions / GitLab CI.
- Container images built and pushed to registry (Docker Hub / ECR).
- Helm charts for Kubernetes deployment.
- Canary deployments for agents.

---

### 11. Summary

NourishNet’s scalable architecture ensures it can grow from a hackathon prototype to a global food rescue platform. By leveraging Kubernetes, Kafka, Redis, and cloud‑native principles, each agent can scale independently, handle spikes, and remain resilient. The design also respects external API limits and optimizes costs – key considerations for real‑world deployment.

This blueprint demonstrates to hackathon judges that NourishNet is not just a demo but a system ready for production at scale.

