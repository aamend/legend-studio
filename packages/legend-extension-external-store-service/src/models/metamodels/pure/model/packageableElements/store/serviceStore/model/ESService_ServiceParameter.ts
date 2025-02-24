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

import { hashArray, type Hashable } from '@finos/legend-shared';
import type { SerializationFormat } from './ESService_SerializationFormat.js';
import type { TypeReference } from './ESService_TypeReference.js';
import { SERVICE_STORE_HASH_STRUCTURE } from '../../../../../../../ESService_ModelUtils.js';

export enum LOCATION {
  HEADER = 'HEADER',
  PATH = 'PATH',
  QUERY = 'QUERY',
}

export class ServiceParameter implements Hashable {
  name!: string;
  type!: TypeReference;
  location!: LOCATION;
  allowReserved?: boolean | undefined;
  required?: boolean | undefined;
  enumeration?: string | undefined;
  serializationFormat?: SerializationFormat | undefined;

  get hashCode(): string {
    return hashArray([
      SERVICE_STORE_HASH_STRUCTURE.SERVICE_PARAMETER,
      this.name,
      this.type,
      this.location,
      this.allowReserved?.toString() ?? '',
      this.required?.toString() ?? '',
      this.enumeration ?? '',
      this.serializationFormat ?? '',
    ]);
  }
}
