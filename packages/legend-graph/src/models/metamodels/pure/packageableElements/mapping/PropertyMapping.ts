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
import { CORE_HASH_STRUCTURE } from '../../../../../MetaModelConst.js';
import type { PropertyReference } from '../domain/PropertyReference.js';
import type { PropertyMappingsImplementation } from './PropertyMappingsImplementation.js';
import type { SetImplementation } from './SetImplementation.js';
import type { PurePropertyMapping } from '../store/modelToModel/mapping/PurePropertyMapping.js';
import type { FlatDataPropertyMapping } from '../store/flatData/mapping/FlatDataPropertyMapping.js';
import type { EmbeddedFlatDataPropertyMapping } from '../store/flatData/mapping/EmbeddedFlatDataPropertyMapping.js';
import type { RelationalPropertyMapping } from '../store/relational/mapping/RelationalPropertyMapping.js';
import type { OtherwiseEmbeddedRelationalInstanceSetImplementation } from '../store/relational/mapping/OtherwiseEmbeddedRelationalInstanceSetImplementation.js';
import type { EmbeddedRelationalInstanceSetImplementation } from '../store/relational/mapping/EmbeddedRelationalInstanceSetImplementation.js';
import type { InlineEmbeddedRelationalInstanceSetImplementation } from '../store/relational/mapping/InlineEmbeddedRelationalInstanceSetImplementation.js';
import type { AggregationAwarePropertyMapping } from './aggregationAware/AggregationAwarePropertyMapping.js';
import type { XStorePropertyMapping } from './xStore/XStorePropertyMapping.js';
import type { LocalMappingPropertyInfo } from './LocalMappingPropertyInfo.js';

export interface PropertyMappingVisitor<T> {
  visit_PropertyMapping(propertyMapping: PropertyMapping): T;
  visit_PurePropertyMapping(propertyMapping: PurePropertyMapping): T;
  visit_FlatDataPropertyMapping(propertyMapping: FlatDataPropertyMapping): T;
  visit_EmbeddedFlatDataPropertyMapping(
    propertyMapping: EmbeddedFlatDataPropertyMapping,
  ): T;
  visit_RelationalPropertyMapping(
    propertyMapping: RelationalPropertyMapping,
  ): T;
  visit_EmbeddedRelationalPropertyMapping(
    propertyMapping: EmbeddedRelationalInstanceSetImplementation,
  ): T;
  visit_InlineEmbeddedRelationalPropertyMapping(
    propertyMapping: InlineEmbeddedRelationalInstanceSetImplementation,
  ): T;
  visit_OtherwiseEmbeddedRelationalPropertyMapping(
    propertyMapping: OtherwiseEmbeddedRelationalInstanceSetImplementation,
  ): T;
  visit_AggregationAwarePropertyMapping(
    propertyMapping: AggregationAwarePropertyMapping,
  ): T;
  visit_XStorePropertyMapping(propertyMapping: XStorePropertyMapping): T;
}

export abstract class PropertyMapping implements Hashable {
  /**
   * the immediate parent instance set implementation that holds the property mappings
   */
  readonly _OWNER: PropertyMappingsImplementation;
  readonly _isEmbedded: boolean = false;

  property: PropertyReference;
  /**
   * NOTE: in case the holder of this property mapping is an embedded property mapping,
   * that embedded property mapping is considered the source otherwise, it is always
   * the top/root `InstanceSetImplementation` that is considered the source implementation
   *
   * TODO: change this to use `SetImplemenetationReference`
   */
  sourceSetImplementation: SetImplementation;
  /**
   * NOTE: in Pure, we actually only store `targetId` and `sourceId` instead of the
   * reference but for convenience and graph completeness validation purpose we will
   * resolve to the actual set implementations here
   *
   * TODO: change this to use `OptionalSetImplemenetationReference`
   */
  targetSetImplementation?: SetImplementation | undefined;
  localMappingProperty?: LocalMappingPropertyInfo | undefined;
  // store?: Store | undefined;

  constructor(
    owner: PropertyMappingsImplementation,
    property: PropertyReference,
    source: SetImplementation,
    target?: SetImplementation,
  ) {
    this._OWNER = owner;
    this.sourceSetImplementation = source;
    this.targetSetImplementation = target;
    this.property = property;
  }

  get hashCode(): string {
    return hashArray([
      CORE_HASH_STRUCTURE.PROPERTY_MAPPING,
      this.property.pointerHashCode,
      this.targetSetImplementation?.id.value ?? '',
      this.localMappingProperty ?? '',
    ]);
  }

  abstract accept_PropertyMappingVisitor<T>(
    visitor: PropertyMappingVisitor<T>,
  ): T;
}
