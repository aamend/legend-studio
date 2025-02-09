/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect } from '@jest/globals';
import { unitTest } from '@finos/legend-shared';
import {
  compareSemVerVersions,
  parseGACoordinates,
  parseGAVCoordinates,
} from '../DepotUtils.js';

test(unitTest('Compare Semver versions'), () => {
  expect(compareSemVerVersions('0.0.0', '0.0.0')).toEqual(0);
  expect(compareSemVerVersions('1.0.0', '0.0.0')).toEqual(1);
  expect(compareSemVerVersions('0.0.0', '1.0.0')).toEqual(-1);
  expect(compareSemVerVersions('1.1.0', '1.2.0')).toEqual(-1);
  expect(compareSemVerVersions('2.1.0', '2.2.0')).toEqual(-1);
  expect(compareSemVerVersions('2.1.1', '2.2.1')).toEqual(-1);
  expect(compareSemVerVersions('2.4.1', '2.2.1')).toEqual(1);
  expect(compareSemVerVersions('1232.34.31', '2.2.1')).toEqual(1);
  expect(compareSemVerVersions('1234.34.31', '1234.34.31')).toEqual(0);
});

test(unitTest('Parse GA(V) coordinates'), () => {
  expect(parseGACoordinates('test.group:test-artifactId')).toEqual({
    artifactId: 'test-artifactId',
    groupId: 'test.group',
  });
  expect(() => parseGACoordinates('test.group')).toThrow();
  expect(() =>
    parseGACoordinates('test.group:test-artifactId:1.0.0'),
  ).toThrow();
  expect(parseGAVCoordinates('test.group:test-artifactId:1.0.0')).toEqual({
    artifactId: 'test-artifactId',
    groupId: 'test.group',
    versionId: '1.0.0',
  });
  expect(() => parseGAVCoordinates('test.group')).toThrow();
  expect(() => parseGAVCoordinates('test.group:test-artifactId')).toThrow();
});
