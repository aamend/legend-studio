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

import type { Type } from '../packageableElements/domain/Type.js';
import type { VariableExpression } from './VariableExpression.js';
import { InstanceValue } from './InstanceValue.js';
import type {
  ValueSpecification,
  ValueSpecificationVisitor,
} from './ValueSpecification.js';
import type { Multiplicity } from '../packageableElements/domain/Multiplicity.js';

export class FunctionType {
  returnType?: Type | undefined;
  parameters: VariableExpression[] = [];
  returnMultiplicity: Multiplicity;

  constructor(returnType: Type | undefined, returnMultiplicity: Multiplicity) {
    this.returnType = returnType;
    this.returnMultiplicity = returnMultiplicity;
  }
}

export class LambdaFunction {
  functionType: FunctionType;
  openVariables: string[] = [];
  expressionSequence: ValueSpecification[] = [];

  constructor(type: FunctionType) {
    this.functionType = type;
  }
}

export class LambdaFunctionInstanceValue extends InstanceValue {
  override values: LambdaFunction[] = [];

  override accept_ValueSpecificationVisitor<T>(
    visitor: ValueSpecificationVisitor<T>,
  ): T {
    return visitor.visit_LambdaFunctionInstanceValue(this);
  }
}
