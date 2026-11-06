import packageJson from "./package.json";

// Traces (@tsdevstack/telemetry): Next.js's own server spans, sent to the
// cloud's trace service (Jaeger locally), and the trace passed on to Kong by
// the API clients. Every request starts its own trace: a traceparent sent by
// a browser is ignored. Node.js runtime only.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerTelemetry } = await import("@tsdevstack/telemetry");
    registerTelemetry({
      serviceName: packageJson.name,
      serviceVersion: packageJson.version,
      continueIncomingTraces: false,
    });
  }
}
