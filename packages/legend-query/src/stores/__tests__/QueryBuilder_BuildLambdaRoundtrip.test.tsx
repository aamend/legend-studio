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

import { test, expect, describe } from '@jest/globals';
import {
  TEST_DATA__simpleProjection,
  TEST_DATA__projectionWithChainedProperty,
  TEST_DATA__projectionWithResultSetModifiers,
  TEST_DATA__getAllWithGroupedFilter,
  TEST_DATA__getAllWithOneConditionFilter,
  TEST_DATA__projectWithDerivedProperty,
  TEST_DATA__fullComplexProjectionQuery,
  TEST_DATA__complexGraphFetch,
  TEST_DATA__simpleGraphFetch,
  TEST_DATA__graphFetchWithDerivedProperty,
  TEST_DATA__graphFetchWithDerivedPropertyAndParameter,
  TEST_DATA__simpleProjectionWithSubtype,
  TEST_DATA__graphFetchWithSubtype,
  TEST_DATA__filterQueryWithSubtypeWithoutExists,
  TEST_DATA__filterQueryWithSubtypeWithExists,
  TEST_DATA__filterQueryWithSubtypeWithExistsChain,
} from './TEST_DATA__QueryBuilder_Generic.js';
import TEST_DATA__ComplexRelationalModel from './TEST_DATA__QueryBuilder_Model_ComplexRelational.json';
import TEST_DATA__ComplexM2MModel from './TEST_DATA__QueryBuilder_Model_ComplexM2M.json';
import TEST_DATA__M2MWithInheritance from './TEST_DATA__QueryBuilder_Model_M2MWithInheritance.json';
import TEST_DATA__COVIDDataSimpleModel from './TEST_DATA__QueryBuilder_Model_COVID.json';
import TEST_DATA__SimpleM2MModel from './TEST_DATA__QueryBuilder_Model_SimpleM2M.json';
import TEST_DATA__PostFilterModel from './TEST_DATA__QueryBuilder_Model_PostFilter.json';
import {
  TEST_DATA__lambda_simpleSingleConditionFilterWithParameter,
  TEST_DATA__lambda_enumerationOperatorFilter,
  TEST_DATA__lambda_existsChainFilter,
  TEST_DATA__lambda_existsChainFilterWithCustomVariableName,
  TEST_DATA__lambda_groupConditionFilter,
  TEST_DATA__lambda_groupConditionFilter_withMultipleClauseGroup,
  TEST_DATA__lambda_notOperatorFilter,
  TEST_DATA__lambda_setOperatorFilter,
  TEST_DATA__lambda_simpleSingleConditionFilter,
  TEST_DATA_lambda_dateTimeCapabilityFilterWithYesterday,
} from './TEST_DATA__QueryBuilder_Roundtrip_TestFilterQueries.js';
import {
  TEST_DATA__lambda_input_filterWithExists,
  lambda_output_filterWithExists,
} from './TEST_DATA__QueryBuilder_TestFilterQueriesWithExists.js';
import {
  TEST_DATA__lambda_input_graphFetchWithFullPathFunctions,
  TEST_DATA__lambda_output_graphFetchWithFullPathFunctions,
  TEST_DATA__lambda_input_filterWithFullPathFunctions,
  TEST_DATA__lambda_output_filterWithFullPathFunctions,
  TEST_DATA__lambda_input_projectionWithFullPathFunctions,
  TEST_DATA__lambda_output_projectionWithFullPathFunctions,
} from './TEST_DATA__QueryBuilder_TestQueriesWithFullPathFunctions.js';
import type { Entity } from '@finos/legend-model-storage';
import {
  RawLambda,
  TEST__buildGraphWithEntities,
  TEST__getTestGraphManagerState,
} from '@finos/legend-graph';
import { TEST__getTestApplicationStore } from '@finos/legend-application';
import {
  integrationTest,
  type TEMPORARRY__JestMatcher,
} from '@finos/legend-shared';
import {
  QueryBuilderState,
  StandardQueryBuilderMode,
} from '../QueryBuilderState.js';
import { LegendQueryPluginManager } from '../../application/LegendQueryPluginManager.js';
import { QueryBuilder_GraphPreset } from '../../models/QueryBuilder_GraphPreset.js';
import { TEST__getTestQueryConfig } from '../LegendQueryStoreTestUtils.js';
import {
  TEST_DATA__lambda_simpleConditionPostFilter,
  TEST_DATA__lambda_aggregationPostFilter,
  TEST_DATA__lambda_derivationPostFilter,
  TEST_DATA_lambda_dateTimeCapabilityPostFilterWithToday,
} from './TEST_DATA__QueryBuilder_Roundtrip_TestPostFilterQueries.js';

type RoundtripTestCase = [
  string,
  {
    entities: Entity[];
  },
  { parameters?: object; body?: object },
  { parameters?: object; body?: object } | undefined,
];

const projectionCtx = {
  entities: TEST_DATA__ComplexRelationalModel,
};

const graphFetchCtx = {
  entities: TEST_DATA__ComplexM2MModel,
};

const graphFetchWithSubtypeCtx = {
  entities: TEST_DATA__M2MWithInheritance,
};

const relationalFilterCtx = {
  entities: TEST_DATA__COVIDDataSimpleModel,
};

const m2mFilterCtx = {
  entities: TEST_DATA__SimpleM2MModel,
};

const postFilterCtx = {
  entities: TEST_DATA__PostFilterModel,
};

const cases: RoundtripTestCase[] = [
  // projection
  ['Simple projection', projectionCtx, TEST_DATA__simpleProjection, undefined],
  [
    'Simple projection with subType',
    projectionCtx,
    TEST_DATA__simpleProjectionWithSubtype,
    undefined,
  ],
  [
    'Complex filter',
    projectionCtx,
    TEST_DATA__fullComplexProjectionQuery,
    undefined,
  ],
  [
    'Projection with property chain',
    projectionCtx,
    TEST_DATA__projectionWithChainedProperty,
    undefined,
  ],
  [
    'Projection with result set modifiers',
    projectionCtx,
    TEST_DATA__projectionWithResultSetModifiers,
    undefined,
  ],
  [
    'Projection with derived property',
    projectionCtx,
    TEST_DATA__projectWithDerivedProperty,
    undefined,
  ],
  [
    '(auto-fix) Projection with full-path functions',
    projectionCtx,
    TEST_DATA__lambda_output_projectionWithFullPathFunctions,
    TEST_DATA__lambda_input_projectionWithFullPathFunctions,
  ],
  // graph fetch
  ['Simple graph fetch', graphFetchCtx, TEST_DATA__simpleGraphFetch, undefined],
  [
    'Complex graph fetch',
    graphFetchCtx,
    TEST_DATA__complexGraphFetch,
    undefined,
  ],
  [
    '(auto-fix) Graph-fetch with full-path functions',
    graphFetchCtx,
    TEST_DATA__lambda_output_graphFetchWithFullPathFunctions,
    TEST_DATA__lambda_input_graphFetchWithFullPathFunctions,
  ],
  [
    'Graph-fetch with derived property',
    graphFetchCtx,
    TEST_DATA__graphFetchWithDerivedProperty,
    undefined,
  ],
  [
    'Graph-fetch with derived property with parameters',
    graphFetchCtx,
    TEST_DATA__graphFetchWithDerivedPropertyAndParameter,
    undefined,
  ],
  [
    'Graph-fetch with subtype',
    graphFetchWithSubtypeCtx,
    TEST_DATA__graphFetchWithSubtype,
    undefined,
  ],
  // filter
  [
    'Simple filter',
    relationalFilterCtx,
    TEST_DATA__lambda_simpleSingleConditionFilter,
    undefined,
  ],
  [
    'Filter with a single condition',
    projectionCtx,
    TEST_DATA__getAllWithOneConditionFilter,
    undefined,
  ],
  [
    'Filter with subtype without exists',
    projectionCtx,
    TEST_DATA__filterQueryWithSubtypeWithoutExists,
    undefined,
  ],
  [
    'Filter with subtype with exists',
    projectionCtx,
    TEST_DATA__filterQueryWithSubtypeWithExists,
    undefined,
  ],
  [
    'Filter with subtype with exists() chain',
    projectionCtx,
    TEST_DATA__filterQueryWithSubtypeWithExistsChain,
    undefined,
  ],
  [
    'Simple filter with parameter',
    relationalFilterCtx,
    TEST_DATA__lambda_simpleSingleConditionFilterWithParameter,
    undefined,
  ],
  // group condition
  [
    'Filter with group condition',
    relationalFilterCtx,
    TEST_DATA__lambda_groupConditionFilter,
    undefined,
  ],
  [
    'Filter with group condition with multiple clauses',
    relationalFilterCtx,
    TEST_DATA__lambda_groupConditionFilter_withMultipleClauseGroup,
    undefined,
  ],
  [
    'Filter with complex group conditions',
    projectionCtx,
    TEST_DATA__getAllWithGroupedFilter,
    undefined,
  ],
  // operator
  [
    'Filter with set operator',
    relationalFilterCtx,
    TEST_DATA__lambda_setOperatorFilter,
    undefined,
  ],
  [
    'Filter with not() operator',
    relationalFilterCtx,
    TEST_DATA__lambda_notOperatorFilter,
    undefined,
  ],
  [
    'Filter with enumeration',
    m2mFilterCtx,
    TEST_DATA__lambda_enumerationOperatorFilter,
    undefined,
  ],
  // exists()
  [
    'Filter with exists() chain',
    m2mFilterCtx,
    TEST_DATA__lambda_existsChainFilter,
    undefined,
  ],
  [
    'Filter with exists() chain with custom lambda variable name',
    m2mFilterCtx,
    TEST_DATA__lambda_existsChainFilterWithCustomVariableName,
    undefined,
  ],
  [
    '(auto-fix) Filter with outdated exists()',
    m2mFilterCtx,
    lambda_output_filterWithExists,
    TEST_DATA__lambda_input_filterWithExists,
  ],
  [
    '(auto-fix) Filter with full-path functions',
    m2mFilterCtx,
    TEST_DATA__lambda_output_filterWithFullPathFunctions,
    TEST_DATA__lambda_input_filterWithFullPathFunctions,
  ],
  // post-filter
  [
    'Post-filter on primitives',
    postFilterCtx,
    TEST_DATA__lambda_simpleConditionPostFilter,
    undefined,
  ],
  [
    'Post-filter on aggregation column',
    postFilterCtx,
    TEST_DATA__lambda_aggregationPostFilter,
    undefined,
  ],
  [
    'Post-filter on derivation column',
    postFilterCtx,
    TEST_DATA__lambda_derivationPostFilter,
    undefined,
  ],
  [
    'Post-filter with result set modifier',
    postFilterCtx,
    TEST_DATA__lambda_derivationPostFilter,
    undefined,
  ],
  // date compabilty, today(), yesterday() etc
  [
    'Filter with yesterday()',
    postFilterCtx,
    TEST_DATA_lambda_dateTimeCapabilityFilterWithYesterday,
    undefined,
  ],
  [
    'Post-filter with today()',
    postFilterCtx,
    TEST_DATA_lambda_dateTimeCapabilityPostFilterWithToday,
    undefined,
  ],
];

describe(
  integrationTest('Query builder lambda processing roundtrip test'),
  () => {
    test.each(cases)(
      '%s',
      async (
        testName: RoundtripTestCase[0],
        context: RoundtripTestCase[1],
        lambda: RoundtripTestCase[2],
        inputLambda: RoundtripTestCase[3],
      ) => {
        const { entities } = context;
        const pluginManager = LegendQueryPluginManager.create();
        pluginManager.usePresets([new QueryBuilder_GraphPreset()]).install();
        const applicationStore = TEST__getTestApplicationStore(
          TEST__getTestQueryConfig(),
          LegendQueryPluginManager.create(),
        );
        const graphManagerState = TEST__getTestGraphManagerState(pluginManager);
        await TEST__buildGraphWithEntities(graphManagerState, entities);
        const queryBuilderState = new QueryBuilderState(
          applicationStore,
          graphManagerState,
          new StandardQueryBuilderMode(),
        );
        // do the check using input and output lambda
        const rawLambda = inputLambda ?? lambda;
        queryBuilderState.buildStateFromRawLambda(
          new RawLambda(rawLambda.parameters, rawLambda.body),
        );
        const jsonQuery =
          graphManagerState.graphManager.serializeRawValueSpecification(
            queryBuilderState.getQuery(),
          );
        (expect([lambda]) as TEMPORARRY__JestMatcher).toIncludeSameMembers([
          jsonQuery,
        ]);
      },
    );
  },
);
