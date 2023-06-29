const opentelemetry = require('@opentelemetry/api');

// Not functionally required but gives some insight what happens behind the scenes
const { diag, DiagConsoleLogger, DiagLogLevel } = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { Sampler, SpanKind } = require('@opentelemetry/api');
const { AlwaysOnSampler } = require('@opentelemetry/core');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const Exporter = (process.env.EXPORTER || '').toLowerCase().startsWith('z') ? ZipkinExporter : JaegerExporter;
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

const setupTracing = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    // sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
  });
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      HttpInstrumentation,
      ExpressInstrumentation,
    ],
  });

  const exporter = new Exporter({
    serviceName,
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer(serviceName);
};

// type FilterFunction = (spanName: string, spanKind: SpanKind, attributes: SpanAttributes) => boolean;

// function filterSampler(filterFn: FilterFunction, parent: Sampler): Sampler {
//   return {
//     shouldSample(ctx, tid, spanName, spanKind, attr, links) {
//       if (!filterFn(spanName, spanKind, attr)) {
//         return { decision: opentelemetry.SamplingDecision.NOT_RECORD };
//       }
//       return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
//     },
//     toString() {
//       return `FilterSampler(${parent.toString()})`;
//     }
//   }
// }

// function ignoreHealthCheck(spanName: string, spanKind: SpanKind, attributes: SpanAttributes) {
//   return spanKind !== opentelemetry.SpanKind.SERVER || attributes[SemanticAttributes.HTTP_ROUTE] !== "/health";
// }

module.exports = { setupTracing };
