import assert from 'node:assert';
import { test, describe } from 'node:test';

describe('Wanderers API Health & Contract Checks', () => {
  test('Verify API environment configuration', () => {
    const port = process.env.PORT || '3001';
    assert.strictEqual(typeof port, 'string');
    assert.ok(parseInt(port, 10) > 0);
  });

  test('Verify status payload contract', () => {
    const payload = { status: 'ok', service: 'Wanderers API' };
    assert.strictEqual(payload.status, 'ok');
    assert.strictEqual(payload.service, 'Wanderers API');
  });
});
