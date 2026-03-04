#!/usr/bin/env python3
# ========================================
# TechBoard — Python Engine (IPC Bridge)
# ========================================
# Persistent process that reads JSON commands from stdin
# and writes JSON responses to stdout.
# Protocol: one JSON object per line (JSON Lines).

import sys
import json
import traceback
from services.image_processing import process_base64_image


def handle_command(cmd: dict) -> dict:
    """Route a command to the appropriate handler."""
    action = cmd.get("action")

    if action == "process_image":
        b64 = cmd.get("image", "")
        result = process_base64_image(
            b64_input=b64,
            do_upscale=cmd.get("upscale", True),
            target_width=cmd.get("target_width", 3840),
            do_sharpen=cmd.get("sharpen", True),
            do_remove_bg=cmd.get("remove_bg", True),
        )
        return {"status": "ok", "cleanImage": f"data:image/png;base64,{result}"}

    elif action == "ping":
        return {"status": "ok", "message": "pong"}

    else:
        return {"status": "error", "message": f"Unknown action: {action}"}


def main():
    """Main loop: read JSON lines from stdin, process, write JSON to stdout."""
    # Signal ready
    sys.stdout.write(json.dumps({"status": "ready"}) + "\n")
    sys.stdout.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            cmd = json.loads(line)
            result = handle_command(cmd)
        except json.JSONDecodeError as e:
            result = {"status": "error", "message": f"Invalid JSON: {str(e)}"}
        except Exception as e:
            traceback.print_exc(file=sys.stderr)
            result = {"status": "error", "message": str(e)}

        sys.stdout.write(json.dumps(result) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
