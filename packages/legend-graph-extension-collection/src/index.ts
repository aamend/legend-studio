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

import { DSLText_GraphPreset } from '@finos/legend-extension-dsl-text';
import { EFJSONSchema_GraphPreset } from '@finos/legend-extension-external-format-json-schema';
import type { AbstractPreset } from '@finos/legend-shared';
import { DSLDiagram_GraphPreset } from '@finos/legend-extension-dsl-diagram';
import { DSLDataSpace_GraphPreset } from '@finos/legend-extension-dsl-data-space';
import { DSLPersistence_GraphPreset } from '@finos/legend-extension-dsl-persistence';
import { ESService_GraphPreset } from '@finos/legend-extension-external-store-service';
import { DSLExternalFormat_GraphPreset } from '@finos/legend-graph';

export const getLegendGraphExtensionCollection = (): AbstractPreset[] => [
  new DSLText_GraphPreset(),
  new DSLDiagram_GraphPreset(),
  new DSLDataSpace_GraphPreset(),
  new DSLExternalFormat_GraphPreset(),
  new DSLPersistence_GraphPreset(),
  new EFJSONSchema_GraphPreset(),
  new ESService_GraphPreset(),
];
