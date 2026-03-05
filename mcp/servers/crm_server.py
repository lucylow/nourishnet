import os
from typing import Dict

from fastapi import FastAPI, HTTPException
from hubspot import HubSpot
from hubspot.crm.contacts import SimplePublicObjectInput
from pydantic import BaseModel
import uvicorn


app = FastAPI(title="NourishNet CRM MCP Server")


# HubSpot client (or mock)
USE_MOCK_CRM = os.getenv("USE_MOCK_CRM", "false").lower() == "true"
if not USE_MOCK_CRM:
    api_client = HubSpot(access_token=os.getenv("HUBSPOT_ACCESS_TOKEN"))
else:
    # In-memory mock for hackathon/demo use
    mock_contacts: Dict[str, Dict] = {}


class GetContactRequest(BaseModel):
    email: str


class UpdateContactRequest(BaseModel):
    email: str
    properties: Dict


@app.post("/tools/get_contact")
async def get_contact(req: GetContactRequest):
    """
    Fetch a contact by email.

    In mock mode, reads from an in-memory dict.
    """
    if USE_MOCK_CRM:
        contact = mock_contacts.get(req.email)
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        return contact

    try:
        filter_payload = {
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
            public_object_search_request=filter_payload
        )
        if contacts.results:
            return contacts.results[0].properties
        raise HTTPException(status_code=404, detail="Contact not found")
    except Exception as e:  # pragma: no cover - external API
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tools/update_contact")
async def update_contact(req: UpdateContactRequest):
    """
    Update or upsert contact properties by email.

    In mock mode, writes to an in-memory dict.
    """
    if USE_MOCK_CRM:
        mock_contacts[req.email] = req.properties
        return {"status": "updated"}

    try:
        filter_payload = {
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
            public_object_search_request=filter_payload
        )
        if not contacts.results:
            raise HTTPException(status_code=404, detail="Contact not found")

        contact_id = contacts.results[0].id
        simple_input = SimplePublicObjectInput(properties=req.properties)
        api_client.crm.contacts.basic_api.update(
            contact_id, simple_public_object_input=simple_input
        )
        return {"status": "updated", "id": contact_id}
    except Exception as e:  # pragma: no cover - external API
        raise HTTPException(status_code=500, detail=str(e))


def main() -> None:
    uvicorn.run(app, host="0.0.0.0", port=8003)


if __name__ == "__main__":
    main()

