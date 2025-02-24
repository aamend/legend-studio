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

import packageJson from '../package.json';
import { AbstractPreset } from '@finos/legend-shared';
import { DSLDiagram_PureGraphManagerPlugin } from './graphManager/DSLDiagram_PureGraphManagerPlugin.js';
import { DSLDiagram_PureProtocolProcessorPlugin } from './models/protocols/pure/DSLDiagram_PureProtocolProcessorPlugin.js';
import { DSLDiagram_PureGraphPlugin } from './graph/DSLDiagram_PureGraphPlugin.js';

export class DSLDiagram_GraphPreset extends AbstractPreset {
  constructor() {
    super(packageJson.extensions.graphPreset, packageJson.version, [
      new DSLDiagram_PureGraphPlugin(),
      new DSLDiagram_PureGraphManagerPlugin(),
      new DSLDiagram_PureProtocolProcessorPlugin(),
    ]);
  }
}
