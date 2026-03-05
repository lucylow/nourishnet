import os

import aiohttp
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn


app = FastAPI(title="NourishNet Web Search MCP Server")

SERPAPI_KEY = os.getenv("SERPAPI_KEY")
USE_MOCK_SEARCH = os.getenv("USE_MOCK_SEARCH", "false").lower() == "true"


class SearchRequest(BaseModel):
    query: str
    num_results: int = 3


@app.post("/tools/search_web")
async def search_web(req: SearchRequest):
    """
    Perform a web search using SerpAPI.

    In mock mode, returns a canned result.
    """
    if USE_MOCK_SEARCH:
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


def main() -> None:
    uvicorn.run(app, host="0.0.0.0", port=8004)


if __name__ == "__main__":
    main()

