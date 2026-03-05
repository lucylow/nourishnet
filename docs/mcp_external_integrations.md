## Extending MCP for External Systems – Calendars, CRMs, Web Search

This guide extends the NourishNet multi‑agent system by connecting it to **external data sources** via the Model Context Protocol (MCP). We create MCP servers that act as bridges to:

- **Google Calendar** – schedule pickups, appointments, or volunteer shifts.
- **CRM (HubSpot / mock)** – manage recipient and donor relationships.
- **Web Search** – enable agents to fetch real‑time information (e.g., local food bank hours).

These tools give agents access to **real‑world data**, making them far more powerful and context‑aware.

---

### 1. MCP Server Architecture for External Integrations

Each external system is wrapped in its own **MCP server** that exposes a set of tools. Agents can then call these tools via the MCP client/event bus. This keeps the agents decoupled from external API details.

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Event Bus                          │
│  (publish/subscribe, queues, tool invocation)               │
└───────────────────────────────┬─────────────────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Scout Agent    │    │ Coordinator     │    │ Logistics Agent │
│                 │    │ Agent           │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Google Calendar│    │  CRM Server     │    │  Web Search     │
│  MCP Server     │    │  MCP Server     │    │  MCP Server     │
│  (tools:        │    │  (tools:        │    │  (tools:        │
│   create_event, │    │   get_contact,  │    │   search_web)   │
│   check_free)   │    │   update_contact)    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

### 2. Google Calendar MCP Server

This server uses the **Google Calendar API** to create events and check availability. It requires OAuth 2.0 credentials. For hackathon/demo use, you can run it in mock mode.

#### 2.1 Setup

1. Enable the Google Calendar API in your Google Cloud project.
2. Download credentials (client ID and secret) or create a service account.
3. Install the Google client library:

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

#### 2.2 MCP Server Code

```python
# mcp/servers/calendar_server.py
import os
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from google.oauth2 import service_account
from googleapiclient.discovery import build
from pydantic import BaseModel
import uvicorn

# Google Calendar API setup (using service account)
SCOPES = ["https://www.googleapis.com/auth/calendar"]
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
CALENDAR_ID = os.getenv("CALENDAR_ID")  # e.g., primary or a shared calendar
USE_MOCK_CALENDAR = os.getenv("USE_MOCK_CALENDAR", "false").lower() == "true"

app = FastAPI()


class CreateEventRequest(BaseModel):
    summary: str
    description: str = ""
    start_time: str  # ISO format
    end_time: str
    attendees: list[str] = []


class CheckAvailabilityRequest(BaseModel):
    time_min: str
    time_max: str


def _get_service():
    if USE_MOCK_CALENDAR:
        return None
    if not SERVICE_ACCOUNT_FILE or not CALENDAR_ID:
        raise RuntimeError("GOOGLE_SERVICE_ACCOUNT_FILE and CALENDAR_ID must be set")
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    return build("calendar", "v3", credentials=credentials)


@app.post("/tools/create_event")
async def create_event(req: CreateEventRequest):
    if USE_MOCK_CALENDAR:
        # Return a fake event for local/demo use
        return {
            "status": "success",
            "event_id": "mock-event-id",
            "html_link": "https://calendar.google.com/mock-event",
        }

    service = _get_service()
    event = {
        "summary": req.summary,
        "description": req.description,
        "start": {"dateTime": req.start_time, "timeZone": "UTC"},
        "end": {"dateTime": req.end_time, "timeZone": "UTC"},
        "attendees": [{"email": email} for email in req.attendees],
    }
    try:
        created = (
            service.events()
            .insert(calendarId=CALENDAR_ID, body=event)
            .execute()
        )
        return {
            "status": "success",
            "event_id": created["id"],
            "html_link": created.get("htmlLink"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/check_availability")
async def check_availability(req: CheckAvailabilityRequest):
    if USE_MOCK_CALENDAR:
        # Always report "available" in mock mode
        return {"available": True, "events": []}

    service = _get_service()
    try:
        events_result = (
            service.events()
            .list(
                calendarId=CALENDAR_ID,
                timeMin=req.time_min,
                timeMax=req.time_max,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])
        return {"available": len(events) == 0, "events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

#### 2.3 Agent Integration Example

In the `LogisticsAgent`, after a pickup is confirmed, we can add a calendar event for the NGO to remind them:

```python
async def handle_confirmed_pickup(self, match):
    # Call calendar MCP tool
    result = await self.mcp_client.call_tool(
        server="calendar",
        tool="create_event",
        params={
            "summary": f"Food pickup: {match['surplus']['business']}",
            "description": f"{match['surplus']['quantity']} {match['surplus']['food_items']}",
            "start_time": match["surplus"]["pickup_deadline"],  # ISO
            "end_time": (
                datetime.fromisoformat(match["surplus"]["pickup_deadline"])
                + timedelta(hours=1)
            ).isoformat(),
            "attendees": [match["recipient"]["email"]],
        },
    )
    if result["status"] == "success":
        await self.send_message(
            match["channel"],
            match["recipient"]["id"],
            f"Pickup added to your calendar: {result['html_link']}",
        )
```

---

### 3. CRM MCP Server

This server interfaces with a CRM like **HubSpot** or a simple mock database. It allows agents to fetch and update contact information.

#### 3.1 HubSpot Integration (or Mock)

We use the HubSpot API (free tier). For demos, there is also a mock in‑memory implementation.

Install:

```bash
pip install hubspot-api-client
```

#### 3.2 MCP Server Code

```python
# mcp/servers/crm_server.py
import os

from fastapi import FastAPI, HTTPException
from hubspot import HubSpot
from hubspot.crm.contacts import SimplePublicObjectInput
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# HubSpot client (or mock)
USE_MOCK_CRM = os.getenv("USE_MOCK_CRM", "false").lower() == "true"
if not USE_MOCK_CRM:
    api_client = HubSpot(access_token=os.getenv("HUBSPOT_ACCESS_TOKEN"))
else:
    # In-memory mock
    mock_contacts: dict[str, dict] = {}


class GetContactRequest(BaseModel):
    email: str


class UpdateContactRequest(BaseModel):
    email: str
    properties: dict


@app.post("/tools/get_contact")
async def get_contact(req: GetContactRequest):
    if USE_MOCK_CRM:
        contact = mock_contacts.get(req.email)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        return contact

    try:
        filter = {
            "filter_groups": [
                {
                    "filters": [
                        {
                            "property_name": "email",
                            "operator": "EQ",
                            "value": req.email,
                        }
                    ]
                }
            ]
        }
        contacts = api_client.crm.contacts.search_api.do_search(
            public_object_search_request=filter
        )
        if contacts.results:
            return contacts.results[0].properties
        raise HTTPException(status_code=404, detail="Contact not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/update_contact")
async def update_contact(req: UpdateContactRequest):
    if USE_MOCK_CRM:
        mock_contacts[req.email] = req.properties
        return {"status": "updated"}

    try:
        filter = {
            "filter_groups": [
                {
                    "filters": [
                        {
                            "property_name": "email",
                            "operator": "EQ",
                            "value": req.email,
                        }
                    ]
                }
            ]
        }
        contacts = api_client.crm.contacts.search_api.do_search(
            public_object_search_request=filter
        )
        if not contacts.results:
            raise HTTPException(status_code=404, detail="Contact not found")

        contact_id = contacts.results[0].id
        simple_input = SimplePublicObjectInput(properties=req.properties)
        api_client.crm.contacts.basic_api.update(
            contact_id, simple_public_object_input=simple_input
        )
        return {"status": "updated", "id": contact_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
```

#### 3.3 Agent Integration Example

The `CoordinatorAgent` can fetch recipient details from the CRM to enrich matching:

```python
async def load_recipient_details(self, recipient_id: str):
    # Assume recipient_id is email
    contact = await self.mcp_client.call_tool(
        server="crm", tool="get_contact", params={"email": recipient_id}
    )
    if contact:
        # Merge with existing data
        self.recipients[recipient_id].update(
            {
                "preferences": contact.get("food_preferences", ""),
                "family_size": contact.get("family_size", 1),
                "special_needs": contact.get("special_needs", False),
            }
        )
```

---

### 4. Web Search MCP Server

This server performs web searches using a search API (e.g., **SerpAPI**, **Bing Web Search**, or a free open‑source alternative). Here we use SerpAPI with plain HTTP.

Install:

```bash
pip install aiohttp
```

#### 4.1 MCP Server Code

```python
# mcp/servers/websearch_server.py
import os

import aiohttp
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

SERPAPI_KEY = os.getenv("SERPAPI_KEY")
USE_MOCK_SEARCH = os.getenv("USE_MOCK_SEARCH", "false").lower() == "true"


class SearchRequest(BaseModel):
    query: str
    num_results: int = 3


@app.post("/tools/search_web")
async def search_web(req: SearchRequest):
    if USE_MOCK_SEARCH:
        # Return mock results
        return {
            "results": [
                {
                    "title": f"Mock result for {req.query}",
                    "link": "https://example.com",
                    "snippet": "This is a mock result.",
                }
            ]
        }

    if not SERPAPI_KEY:
        raise HTTPException(status_code=500, detail="SERPAPI_KEY not set")

    async with aiohttp.ClientSession() as session:
        params = {
            "q": req.query,
            "api_key": SERPAPI_KEY,
            "num": req.num_results,
            "engine": "google",
        }
        async with session.get(
            "https://serpapi.com/search", params=params
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=resp.status, detail=await resp.text())
            data = await resp.json()
            organic = data.get("organic_results", [])
            results = [
                {
                    "title": r["title"],
                    "link": r["link"],
                    "snippet": r.get("snippet"),
                }
                for r in organic[: req.num_results]
            ]
            return {"results": results}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
```

#### 4.2 Agent Integration Example

The `LogisticsAgent` can search for nearby food banks when a user asks for help finding one:

```python
async def handle_find_food_bank(self, user_message: str, user_id: str):
    # Extract location from message (simplified)
    if "near me" in user_message:
        # Assume we have user's location from profile
        location = await self.get_user_location(user_id)
        query = f"food bank near {location}"
    else:
        query = user_message.replace("find food bank", "").strip()

    search_result = await self.mcp_client.call_tool(
        server="websearch",
        tool="search_web",
        params={"query": query, "num_results": 3},
    )
    reply = "Here are some food banks nearby:\n"
    for r in search_result["results"]:
        reply += f"- {r['title']}: {r['link']}\n"
    await self.send_message("whatsapp", user_id, reply)
```

---

### 5. Registering External MCP Servers with OpenClaw

In the OpenClaw configuration (`config/openclaw.json`), add these servers to the MCP adapter plugin:

```json
{
  "plugins": {
    "entries": {
      "mcp-adapter": {
        "enabled": true,
        "config": {
          "servers": [
            {
              "name": "scout",
              "transport": "stdio",
              "command": "python",
              "args": ["agents/scout.py"]
            },
            {
              "name": "coordinator",
              "transport": "stdio",
              "command": "python",
              "args": ["agents/coordinator.py"]
            },
            {
              "name": "logistics",
              "transport": "stdio",
              "command": "python",
              "args": ["agents/logistics.py"]
            },
            { "name": "calendar", "transport": "http", "url": "http://localhost:8002" },
            { "name": "crm", "transport": "http", "url": "http://localhost:8003" },
            { "name": "websearch", "transport": "http", "url": "http://localhost:8004" }
          ]
        }
      }
    }
  }
}
```

Now any agent running under OpenClaw can call tools from these servers via `self.mcp_client.call_tool(server, tool, params)`, while the core Python MCP event bus continues to handle publish/subscribe and human elicitation.

---

### 6. Error Handling & Fallbacks

- **Exception handling:** Each external API call is wrapped in `try`/`except` and translated into HTTP errors (`HTTPException`) with useful details.
- **Agent fallbacks:** If an external service fails, the agent should log the error and continue with a fallback (e.g., use cached data, skip enrichment, or ask the user to try later).
- **Retries:** For critical operations (like calendar invites), you may want to implement retries with exponential backoff in the calling agent code.

---

### 7. Mock Mode for Development

All servers support environment flags for mock mode. Set them to `true` to run without real API keys – perfect for hackathons and demos:

```bash
export USE_MOCK_CALENDAR=true
export USE_MOCK_CRM=true
export USE_MOCK_SEARCH=true
```

In mock mode:

- The calendar server returns a fake event and always reports time slots as available.
- The CRM server stores contacts in an in‑memory dictionary.
- The web search server returns a canned result for any query.

---

### 8. Testing the Integration

You can test each MCP server independently with `curl`:

```bash
# Test calendar server
curl -X POST http://localhost:8002/tools/create_event \
  -H "Content-Type: application/json" \
  -d '{"summary":"Test","description":"Demo event","start_time":"2026-03-04T10:00:00Z","end_time":"2026-03-04T11:00:00Z"}'

# Test CRM server
curl -X POST http://localhost:8003/tools/get_contact \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test web search
curl -X POST http://localhost:8004/tools/search_web \
  -H "Content-Type: application/json" \
  -d '{"query":"food bank london"}'
```

---

### 9. Summary

By adding these MCP servers, NourishNet agents gain superpowers:

- **Calendar integration** – schedule pickups, remind volunteers.
- **CRM integration** – personalise communication, track donor history.
- **Web search** – answer user questions, find local resources.

All while keeping the agent code clean and decoupled. This architecture is scalable, testable, and ideal for a production‑ready hackathon submission.

