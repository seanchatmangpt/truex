# Tutorial 5: Setting Up Observatory

To operate Truex systems at production scale, you need comprehensive visibility into your Operational Topology, Gall sequencer throughput, and OTP supervisor health. The Truex Observatory provides a real-time dashboard and a metrics pipeline designed specifically for these primitives.

## Theoretical Context

Why do we need a specialized Observatory instead of standard logging?

1. **Gall Sequencing Visibility**: Standard logs don't capture total ordering effectively. The Observatory visualizes the continuous stream of Gall sequences, allowing you to identify exact bottlenecks in your event processing pipeline and see the cryptographic linking of state.
2. **OTP Equivalence Monitoring**: It provides a live view of your supervision trees. You can monitor crashed processes, track supervisor restart metrics, and assess worker node health, ensuring that isolated failures aren't silently degrading system throughput.
3. **Operational Topology Mapping**: The Observatory renders an interactive, living graph of your capabilities. It shows traffic flow, latency, and error rates between nodes dynamically, rather than relying on static architecture diagrams.

## Step 1: Installing the Observatory Package

The Observatory requires its own plugin package to instrument your application.

```bash
npm install @truex/observatory
```

## Step 2: Instrumenting the Sequencer

To send telemetry data to the Observatory, you must attach the `ObservatoryExporter` to your core Gall Sequencer.

```typescript
import { GallSequencer } from '@truex/membrane';
import { ObservatoryExporter } from '@truex/observatory';

const sequencer = new GallSequencer();

const exporter = new ObservatoryExporter({
  endpoint: 'http://localhost:4318/v1/traces', // Standard OTLP HTTP endpoint
  serviceName: 'my-truex-production-service',
  exportIntervalMs: 5000 // Flush telemetry every 5 seconds
});

// Attach the exporter as middleware to the sequencer
sequencer.use(exporter);

console.log('Observatory exporter attached. Metrics will be flushed continuously.');
```

## Step 3: Launching the Dashboard

Truex provides a comprehensive local dashboard for development and debugging, which consumes the OpenTelemetry data.

```bash
npx truex-observatory start
```

This will launch a local web interface, typically accessible at `http://localhost:3000`.

## Step 4: Exploring the Metrics Dashboard

Once your system processes a few capabilities, navigate to the dashboard. You will see three primary analytical panels:

### 1. Operational Topology Graph
This interactive network graph shows all loaded capabilities in real-time.
- **Green nodes**: Healthy hooks with successful recent executions.
- **Red/Yellow nodes**: Hooks currently experiencing high error rates or latency.
- **Edges**: Represent the flow of data or capability invocations. Thickness indicates throughput.

### 2. Gall Sequence Waterfall
Similar to a network waterfall in browser developer tools, this panel shows the exact timing of operations within a Gall sequence. It is invaluable for tracking down latency issues in complex, multi-hook transactions, showing exactly which step in the sequence is causing delay.

### 3. OTP Supervisor Health
A hierarchical tree showing process health. You can see how many times a supervisor has had to restart a failing capability worker, helping you identify unstable code before it exhausts the supervisor's restart budget and causes a complete system outage.

## Integration with Production APM Tools

The `ObservatoryExporter` uses standard OpenTelemetry (OTLP) under the hood. In a production environment, you don't need the local dashboard; you should point the `endpoint` to your existing OTLP collector, which can then route the metrics to Datadog, Prometheus, Grafana, or Honeycomb.

```typescript
const productionExporter = new ObservatoryExporter({
  endpoint: process.env.OTLP_COLLECTOR_URL,
  headers: {
    'Authorization': `Bearer ${process.env.OTLP_TOKEN}`
  }
});
```

## Troubleshooting

- **No Data in Dashboard**: Ensure the `exportIntervalMs` has elapsed and that your system is actively processing hooks. Also, verify that the OTLP `endpoint` URL is correct and reachable.
- **Missing Topology Edges**: If the topology graph looks disconnected, ensure your hooks are using the official Truex API (e.g., `ctx.invoke()`) to call other capabilities, rather than bypassing the framework and using standard function calls.
- **High Overhead**: If the exporter is causing performance issues, increase the `exportIntervalMs` or configure a sampler to only export a percentage of traces.

## Conclusion

With the Observatory fully set up, you now have a complete, production-ready Truex installation. You can write robust hooks, replay complex failures deterministically, diagnose issues automatically with the Doctor, simulate alternative futures, and monitor the entire Operational Topology in real-time. Welcome to the future of deterministic, observable distributed systems.
