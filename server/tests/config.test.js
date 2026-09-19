import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getKnowledgeDailyCount,
  getQuizDailyCount,
  getContentRetentionDays
} from '../src/config/content.js';

test('environment configuration falls back to default counts and retention', () => {
  assert.equal(getKnowledgeDailyCount(), 10);
  assert.equal(getQuizDailyCount(), 10);
  assert.equal(getContentRetentionDays(), 5);
});
