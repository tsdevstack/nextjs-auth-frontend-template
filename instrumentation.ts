import packageJson from "./package.json";

// Traces (@tsdevstack/telemetry): Next.js's own server spans, sent to the
// cloud's trace service (Jaeger locally), and the trace passed on to Kong by
// the API clients. Every request starts its own trace: a traceparent sent by
// a browser is ignored. Node.js runtime only.
//
// Logs: in the cloud, every console line of the server (Next.js's own errors
// too) becomes one JSON line, with its level, stack and trace ID. Locally the
// output stays as it is.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerTelemetry, logConsoleAsJson } =
      await import("@tsdevstack/telemetry");
    logConsoleAsJson({ serviceName: packageJson.name });
    registerTelemetry({
      serviceName: packageJson.name,
      serviceVersion: packageJson.version,
      continueIncomingTraces: false,
    });
  }
}
