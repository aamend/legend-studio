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

import { makeAutoObservable, action } from 'mobx';
import type { QueryBuilderState } from './QueryBuilderState.js';
import type { RawLambda } from '@finos/legend-graph';

export class QueryBuilderUnsupportedState {
  queryBuilderState: QueryBuilderState;
  rawLambda?: RawLambda | undefined;
  lambdaError?: Error | undefined;

  constructor(queryBuilderState: QueryBuilderState) {
    makeAutoObservable(this, {
      queryBuilderState: false,
      setRawLambda: action,
      setLambdaError: action,
    });

    this.queryBuilderState = queryBuilderState;
  }

  setRawLambda(rawLambda: RawLambda | undefined): void {
    this.rawLambda = rawLambda;
  }
  setLambdaError(lambdaError: Error | undefined): void {
    this.lambdaError = lambdaError;
  }
}
