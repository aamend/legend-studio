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

import {
  V1_ValueSpecification,
  type V1_ValueSpecificationVisitor,
} from '../../model/valueSpecification/V1_ValueSpecification.js';
import type { V1_Multiplicity } from '../../model/packageableElements/domain/V1_Multiplicity.js';

export class V1_Variable extends V1_ValueSpecification {
  class?: string | undefined;
  name!: string;
  multiplicity?: V1_Multiplicity | undefined;

  accept_ValueSpecificationVisitor<T>(
    visitor: V1_ValueSpecificationVisitor<T>,
  ): T {
    return visitor.visit_Variable(this);
  }
}
