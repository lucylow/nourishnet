import asyncio
import multiprocessing
import subprocess
import sys
from pathlib import Path

from config import MCP_HOST, MCP_PORT


def run_mcp_server() -> None:
    """Run the MCP event bus server."""
    # Ensure we run from project root so imports work
    root = Path(__file__).parent
    subprocess.Popen(
        [sys.executable, "-m", "mcp.server"],
        cwd=str(root),
    )


def run_scout() -> None:
    from config import MCP_HOST, MCP_PORT
    from agents.scout_agent import ScoutAgent

    agent = ScoutAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    asyncio.run(agent.run())


def run_coordinator() -> None:
    from config import MCP_HOST, MCP_PORT
    from agents.coordinator_agent import CoordinatorAgent

    agent = CoordinatorAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    asyncio.run(agent.run())


def run_logistics() -> None:
    from config import MCP_HOST, MCP_PORT
    from agents.logistics_agent import LogisticsAgent

    agent = LogisticsAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    asyncio.run(agent.run())


def run_impact() -> None:
    from config import MCP_HOST, MCP_PORT
    from agents.impact_agent import ImpactAgent

    agent = ImpactAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    asyncio.run(agent.run())


def run_prediction() -> None:
    from config import MCP_HOST, MCP_PORT
    from agents.prediction_agent import PredictionAgent

    agent = PredictionAgent(f"http://{MCP_HOST}:{MCP_PORT}")
    asyncio.run(agent.run())


if __name__ == "__main__":
    # Start MCP server
    run_mcp_server()

    # Start agents in separate processes
    p1 = multiprocessing.Process(target=run_scout)
    p2 = multiprocessing.Process(target=run_coordinator)
    p3 = multiprocessing.Process(target=run_logistics)
    p4 = multiprocessing.Process(target=run_impact)
    p5 = multiprocessing.Process(target=run_prediction)

    p1.start()
    p2.start()
    p3.start()
    p4.start()
    p5.start()

    p1.join()
    p2.join()
    p3.join()
    p4.join()
    p5.join()

