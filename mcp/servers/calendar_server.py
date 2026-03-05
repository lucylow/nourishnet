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

app = FastAPI(title="NourishNet Calendar MCP Server")


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
    """
    Create a calendar event for a pickup / appointment.

    In mock mode, returns a fake event without calling Google APIs.
    """
    if USE_MOCK_CALENDAR:
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
    except Exception as e:  # pragma: no cover - external API
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/check_availability")
async def check_availability(req: CheckAvailabilityRequest):
    """
    Check if the calendar is free between two ISO timestamps.

    In mock mode, always reports availability.
    """
    if USE_MOCK_CALENDAR:
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
    except Exception as e:  # pragma: no cover - external API
        raise HTTPException(status_code=500, detail=str(e))


def main() -> None:
    uvicorn.run(app, host="0.0.0.0", port=8002)


if __name__ == "__main__":
    main()

