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

import { hashArray } from '@finos/legend-shared';
import { CORE_HASH_STRUCTURE } from '../../../../../../../../MetaModelConst.js';
import { V1_AssociationMapping } from '../V1_AssociationMapping.js';
import type { V1_PropertyMapping } from '../V1_PropertyMapping.js';

export class V1_XStoreAssociationMapping extends V1_AssociationMapping {
  propertyMappings: V1_PropertyMapping[] = [];

  override get hashCode(): string {
    return hashArray([
      CORE_HASH_STRUCTURE.XSTORE_ASSOCIATION_IMPLEMENTATION,
      super.hashCode,
      hashArray(this.propertyMappings),
    ]);
  }
}
