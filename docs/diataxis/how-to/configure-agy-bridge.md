# How To: Configure the Antigravity (AGY) Bridge

To wire Truex into an AGY swarm, you must intercept the agent's actions before they hit the disk, and follow up with observability.

## 1. Register the BeforeTool Hook
In your workspace root, create or update `.agents/hooks.json` to route commands to the Truex evaluator:

```json
{
  "hooks": {
    "truex-hook-loop": {
      "event": "BeforeTool",
      "matcher": "write_to_file|replace_file_content|run_command",
      "script": "npx tsx scripts/truex-agy-bridge.ts {{tool}} '{{arguments}}'",
      "enabled": true,
      "outputToContext": true
    }
  }
}
```

*Setting `outputToContext: true` ensures that the cryptographic receipt is injected back into the agent's prompt.*

## 2. Register the AfterTool Hook
To ensure the Observatory updates the environment after a successful mutation:

```json
{
  "hooks": {
    "after-tool-observatory": {
      "event": "AfterTool",
      "matcher": "write_file|replace|write_to_file|replace_file_content",
      "script": "npm run observatory",
      "enabled": true,
      "waitForCompletion": false
    }
  }
}
```

Now, AGY agents are physically bounded by Truex's operational law.