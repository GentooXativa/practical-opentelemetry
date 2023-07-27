# practical-opentelemetry

Knowledge Sharing about OpenTelemetry

- [practical-opentelemetry](#practical-opentelemetry)
  - [Description](#description)
  - [Requisites](#requisites)
  - [How to run](#how-to-run)
  - [How to stop](#how-to-stop)
  - [Recommended Readings](#recommended-readings)

## Description

This is a demostration on how we can implement [OpenTelemetry](https://opentelemetry.io/) on a NodeJS project and interact with it using [Jaeger](https://www.jaegertracing.io/) a end-to-end distributed open-source tracing solution.

## Requisites

- NodeJS version 20, you can use [nvm](https://github.com/nvm-sh/nvm) version manager to get it `nvm use`
- Any browser
- An editor of your choice

## How to run

You only need to use docker-compose to run it:

```bash
docker compose up
```

if you are using an older version of docker:

```bash
docker-compose up
```

Then you can go to [http://localhost:16686/](http://localhost:16686/) to see the Jaeger UI and see the traces.

## How to stop

```bash
docker compose down
```

or

```bash
docker-compose down
```

You can use `CONTROL+C` at any time to stop it.

## Recommended Readings

- Open Telemetry documentation: https://opentelemetry.io/docs/
- Instrumentation for different languages: https://opentelemetry.io/docs/instrumentation/
- Jaeger documentation: https://www.jaegertracing.io/docs/
- Obervability VS Monitoring VS Telemetry: https://cribl.io/blog/observability-vs-monitoring-vs-telemetry/
- Observability VS Monitoring: https://www.ibm.com/cloud/blog/observability-vs-monitoring

