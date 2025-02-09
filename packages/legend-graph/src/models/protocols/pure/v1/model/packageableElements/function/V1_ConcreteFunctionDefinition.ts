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
import { hashRawLambda } from '../../../../../../../MetaModelUtils.js';
import { CORE_HASH_STRUCTURE } from '../../../../../../../MetaModelConst.js';
import type { V1_RawVariable } from '../../../model/rawValueSpecification/V1_RawVariable.js';
import type { V1_Multiplicity } from '../../../model/packageableElements/domain/V1_Multiplicity.js';
import type { V1_StereotypePtr } from '../../../model/packageableElements/domain/V1_StereotypePtr.js';
import type { V1_TaggedValue } from '../../../model/packageableElements/domain/V1_TaggedValue.js';
import {
  type V1_PackageableElementVisitor,
  V1_PackageableElement,
} from '../../../model/packageableElements/V1_PackageableElement.js';

export class V1_ConcreteFunctionDefinition extends V1_PackageableElement {
  /**
   * Studio does not process value specification, they are left in raw JSON form
   *
   * @discrepancy model
   */
  parameters: V1_RawVariable[] = [];
  /**
   * Studio does not process value specification, they are left in raw JSON form
   *
   * @discrepancy model
   */
  body: object[] = [];
  returnType!: string;
  returnMultiplicity!: V1_Multiplicity;
  taggedValues: V1_TaggedValue[] = [];
  stereotypes: V1_StereotypePtr[] = [];

  override get hashCode(): string {
    return hashArray([
      CORE_HASH_STRUCTURE.FUNCTION,
      this.path,
      hashArray(this.parameters),
      this.returnType,
      hashArray(this.taggedValues),
      hashArray(this.stereotypes),
      hashRawLambda(undefined, this.body),
    ]);
  }

  accept_PackageableElementVisitor<T>(
    visitor: V1_PackageableElementVisitor<T>,
  ): T {
    return visitor.visit_ConcreteFunctionDefinition(this);
  }
}
