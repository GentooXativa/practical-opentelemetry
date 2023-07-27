const api = require('@opentelemetry/api');
const { setupTracing } = require('./openTelemetry');

const tracer = setupTracing('ob-ks-opentelemetry');

// eslint-disable-next-line import/order
const express = require('express');

const app = express();

const port = 3000;

const randomApis = [
  'https://catfact.ninja/fact',
  'https://api.chucknorris.io/jokes/random',
  'https://official-joke-api.appspot.com/random_joke',
  'https://api.kanye.rest/',
  'https://ifconfig.me/all.json',
];

app.get('/', async (req, res) => {
  const randomApiToUse = randomApis[Math.floor(Math.random() * randomApis.length)];
  const span = tracer.startSpan(`client.makeRequest(${randomApiToUse.split('/')[2]})`, {
    kind: api.SpanKind.CLIENT,
  });

  let result = {};

  api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, span), async () => {
    try {
      result = await await fetch(randomApiToUse, {
        method: 'GET',
        headers: {
        },
      });

      span.addEvent('Retrieving something to generate noise', {
        'log.severity': 'debug',
        'log.message': `Retrieving data from ${randomApiToUse}`,
      });
      span.setStatus({ code: api.SpanStatusCode.OK });
    } catch (e) {
      if (e instanceof Error) {
        res.status(500).send('failed:', e.message);
        span.setStatus({ code: api.SpanStatusCode.ERROR, message: e.message });
      }
    }

    const resultSpan = tracer.startSpan('client.processResult()', {
      kind: api.SpanKind.CLIENT,
    });

    api.context.with(api.trace.setSpan(api.ROOT_CONTEXT, resultSpan), async () => {
      try {
        if (result.ok) {
          const resultText = await result.json();
          res.send(resultText);
          resultSpan.addEvent(`Fetch result from: ${randomApiToUse}`, {
            'log.severity': 'debug',
            'log.message': JSON.stringify(resultText),
          });
          resultSpan.setStatus({ code: api.SpanStatusCode.OK });
        } else {
          res.status(500);
          res.send('Error');

          resultSpan.addEvent(`Fetch failed ${randomApiToUse}`, {
            'log.severity': 'error',
            'log.message': await result.text(),
          });

          resultSpan.setStatus({ code: api.SpanStatusCode.ERROR, message: 'Fetch failed' });
        }
      } catch (e) {
        if (e instanceof Error) {
          res.status(500).send('failed:', e.message);
          resultSpan.setStatus({ code: api.SpanStatusCode.ERROR, message: e.message });
        }
      }
      resultSpan.end();
    });

    span.end();
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
