export function startTimer() {
  return process.hrtime.bigint();
}

export function calculateLatency(startedAt) {
  return Number((process.hrtime.bigint() - startedAt) / 1000000n);
}
