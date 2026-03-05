from flask import Flask, render_template, request, jsonify
import requests

from config import MCP_HOST, MCP_PORT

app = Flask(__name__, template_folder="templates")

MCP_URL = f"http://{MCP_HOST}:{MCP_PORT}"


@app.route("/")
def index():
    """Render the supervisor dashboard shell; tasks are fetched via JS."""
    return render_template("index.html")


@app.route("/api/tasks")
def get_tasks():
    """
    Fetch pending tasks from MCP.

    This proxies the MCP /tasks endpoint so the frontend has a stable URL.
    """
    try:
        resp = requests.get(f"{MCP_URL}/tasks", timeout=5)
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception:
        # In case MCP is down, return an empty list to keep UI responsive.
        return jsonify([])


@app.route("/api/respond/<task_id>", methods=["POST"])
def respond(task_id: str):
    """
    Forward supervisor response to MCP.

    Expects JSON body matching the schema expected by the agent, plus
    an optional 'action' field (default: 'accept').
    """
    body = request.json or {}
    action = body.pop("action", "accept")
    payload = {"action": action, "data": body}
    try:
        requests.post(f"{MCP_URL}/respond/{task_id}", json=payload, timeout=5)
    except Exception:
        # For demo purposes we don't propagate the error to the UI
        pass
    return jsonify({"status": "ok"})


def main() -> None:
    app.run(port=5000, debug=True)


if __name__ == "__main__":
    main()

