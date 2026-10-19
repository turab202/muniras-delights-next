import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPhoneNumber } from '../lib/phone';

test('accepts Ethiopian mobile and international phone formats', () => {
  for (const phone of ['0911234567', '+251 911 234 567', '+1 202 555 0123', '00251911123456']) {
    assert.equal(isValidPhoneNumber(phone), true, phone);
  }
});

test('rejects missing, malformed, and implausible phone numbers', () => {
  for (const phone of ['', 'abc', '1111111111', '12345', '0612345678', '+0123456789']) {
    assert.equal(isValidPhoneNumber(phone), false, phone);
  }
});
