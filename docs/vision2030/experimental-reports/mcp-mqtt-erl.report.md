# Experimental Project Report: mcp-mqtt-erl

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/mcp-mqtt-erl`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `mcp-mqtt-erl/Makefile`
- `mcp-mqtt-erl/scripts/ensure-rebar3.sh`
- `mcp-mqtt-erl/scripts/get-otp-vsn.sh`

## 3. Extracted Documentation & Context
### Source: `mcp-mqtt-erl/README.md`
```markdown
# MCP over MQTT Erlang SDK

The MCP over MQTT Erlang SDK for both MCP clients and servers.

## Build

```bash
$ rebar3 compile
```

## Usage

### Create a simple MCP client:

```erlang
-module(mcp_mqtt_erl_client_demo).

-behaviour(mcp_mqtt_erl_client_session).

-export([
    client_name/0,
    client_version/0,
    client_capabilities/0,
    received_non_mcp_message/3
]).
-export([start_link/0]).

%% The client name, version and capabilities. These info will be sent to the server during the MCP initialization.
client_name() ->
    <<"emqx_tools/cli_demo">>.

client_version() ->
    <<"1.0">>.

client_capabilities() -> #{}.

%% Callbacks for non-MCP messages
received_non_mcp_message(MqttClient, Msg, State) ->
    io:format("~p Received non-MCP message: ~p~n", [MqttClient, Msg]),
    State.
...
```

