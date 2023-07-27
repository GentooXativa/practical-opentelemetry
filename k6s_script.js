import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 30 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 10 },
    { duration: '5s', target: 0 },
  ],
  batch: 100,
};

export default function () {
  http.get('http://ks-opentelemetry-demo:3000/');
  sleep(1);
}
