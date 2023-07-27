// eslint-disable-next-line import/order
const app = require('./package.json');

const opentelemetry = require('@opentelemetry/api');

// Not functionally required but gives some insight what happens behind the scenes
const { diag, DiagConsoleLogger, DiagLogLevel } = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');

const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

const setupTracing = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: app.name,
      [SemanticResourceAttributes.SERVICE_VERSION]: app.version,
      [SemanticResourceAttributes.HOST_ARCH]: process.arch,
      [SemanticResourceAttributes.HOST_TYPE]: process.platform,
    }),
  });
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      HttpInstrumentation,
      ExpressInstrumentation,
    ],
  });

  const exporter = new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    url: 'http://jaeger:4318/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer(serviceName);
};

module.exports = { setupTracing };
