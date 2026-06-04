import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { logger } from '@forge/logger';

export interface TracingOptions {
  enabled?: boolean;
  serviceName?: string;
  endpoint?: string;
}

export const initTracing = (options: TracingOptions = {}) => {
  // Only initialize if tracing is explicitly enabled in production/staging
  if (options.enabled && options.endpoint) {
    const exporter = new OTLPTraceExporter({
      url: options.endpoint,
    });

    const sdk = new NodeSDK({
      serviceName: options.serviceName || 'forge-api',
      traceExporter: exporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable noisy instrumentation
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-net': { enabled: false },
        }),
      ],
    });

    sdk.start();

    logger.info('OpenTelemetry Tracing initialized');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => logger.info('Tracing terminated'))
        .catch((error) => logger.error({ error }, 'Error terminating tracing'))
        .finally(() => process.exit(0));
    });
  }
};
