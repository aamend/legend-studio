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

import { action, makeAutoObservable } from 'mobx';
import {
  getNullableFirstElement,
  guaranteeNonNullable,
  guaranteeType,
  isCamelCase,
  prettyCamelCase,
  prettyCONSTName,
} from '@finos/legend-shared';
import {
  Class,
  type AbstractProperty,
  type Enum,
  type ValueSpecification,
  type PureModel,
  TYPICAL_MULTIPLICITY_TYPE,
  CollectionInstanceValue,
  AbstractPropertyExpression,
  DerivedProperty,
  Enumeration,
  EnumValueExplicitReference,
  EnumValueInstanceValue,
  InstanceValue,
  PrimitiveInstanceValue,
  PRIMITIVE_TYPE,
  VariableExpression,
  getMilestoneTemporalStereotype,
  MILESTONING_STEREOTYPE,
  SimpleFunctionExpression,
  matchFunctionName,
  TYPE_CAST_TOKEN,
  observe_AbstractPropertyExpression,
  GenericTypeExplicitReference,
  GenericType,
  DEFAULT_BUSINESS_DATE_MILESTONING_PARAMETER_NAME,
  DEFAULT_PROCESSING_DATE_MILESTONING_PARAMETER_NAME,
  INTERNAL__PropagatedValue,
  Association,
} from '@finos/legend-graph';
import { generateDefaultValueForPrimitiveType } from './QueryBuilderValueSpecificationBuilderHelper.js';
import type { QueryBuilderState } from './QueryBuilderState.js';
import type { QueryBuilderSetupState } from './QueryBuilderSetupState.js';
import { functionExpression_setParametersValues } from '@finos/legend-application';
import { QUERY_BUILDER_SUPPORTED_FUNCTIONS } from '../QueryBuilder_Const.js';

export const getDerivedPropertyMilestoningSteoreotype = (
  property: DerivedProperty,
  graph: PureModel,
): MILESTONING_STEREOTYPE | undefined => {
  const owner = property._OWNER;
  if (owner instanceof Class) {
    return getMilestoneTemporalStereotype(owner, graph);
  } else if (owner instanceof Association) {
    if (owner._generatedMilestonedProperties.length) {
      const ownerClass =
        owner._generatedMilestonedProperties[0]?.genericType.value.rawType;
      return getMilestoneTemporalStereotype(
        guaranteeType(ownerClass, Class),
        graph,
      );
    }
  }
  return undefined;
};

/**
 * Check if the parameter value of the milestoned property is
 * the same as those specified in global scope, so that we can
 * potentially replace them with propgated value.
 */
const matchMilestoningParameterValue = (
  stereotype: MILESTONING_STEREOTYPE,
  idx: number,
  parameterValue: ValueSpecification,
  querySetupState: QueryBuilderSetupState,
): boolean => {
  const checkIfEquivalent = (
    param1: ValueSpecification | undefined,
    param2: ValueSpecification | undefined,
  ): boolean => {
    if (
      param1 instanceof VariableExpression &&
      param2 instanceof VariableExpression
    ) {
      return param1.name === param2.name;
    } else if (
      param1 instanceof PrimitiveInstanceValue &&
      param2 instanceof PrimitiveInstanceValue
    ) {
      if (
        param1.genericType.value.rawType.name === PRIMITIVE_TYPE.LATESTDATE &&
        param2.genericType.value.rawType.name === PRIMITIVE_TYPE.LATESTDATE
      ) {
        return true;
      }
      return (
        param1.genericType.value.rawType.name ===
          param2.genericType.value.rawType.name &&
        param1.values[0] === param2.values[0]
      );
    }
    return false;
  };
  switch (stereotype) {
    case MILESTONING_STEREOTYPE.BITEMPORAL:
      return (
        (idx === 0 &&
          checkIfEquivalent(parameterValue, querySetupState.processingDate)) ||
        (idx === 1 &&
          checkIfEquivalent(parameterValue, querySetupState.businessDate))
      );
    case MILESTONING_STEREOTYPE.PROCESSING_TEMPORAL:
      return checkIfEquivalent(parameterValue, querySetupState.processingDate);
    case MILESTONING_STEREOTYPE.BUSINESS_TEMPORAL:
      return checkIfEquivalent(parameterValue, querySetupState.businessDate);
    default:
  }
  return false;
};

export const prettyPropertyName = (value: string): string =>
  isCamelCase(value) ? prettyCamelCase(value) : prettyCONSTName(value);

/**
 * Generate a parameter value for the derived property given the index if the property is milestoned.
 *
 * This method considers different scenarios for milestoning and take into account date propagation
 * See https://github.com/finos/legend-studio/pull/891
 */
export const generateMilestonedPropertyParameterValue = (
  derivedPropertyExpressionState: QueryBuilderDerivedPropertyExpressionState,
  idx: number,
): ValueSpecification | undefined => {
  // Milestoning transformations should not be done on actual derived properties.
  if (
    derivedPropertyExpressionState.derivedProperty._OWNER.derivedProperties.includes(
      derivedPropertyExpressionState.derivedProperty,
    )
  ) {
    return undefined;
  }
  const querySetupState =
    derivedPropertyExpressionState.queryBuilderState.querySetupState;
  const temporalSource = getDerivedPropertyMilestoningSteoreotype(
    derivedPropertyExpressionState.derivedProperty,
    derivedPropertyExpressionState.queryBuilderState.graphManagerState.graph,
  );
  const temporalTarget =
    derivedPropertyExpressionState.propertyExpression.func.genericType.value
      .rawType instanceof Class &&
    derivedPropertyExpressionState.propertyExpression.func._OWNER
      ._generatedMilestonedProperties.length !== 0
      ? getMilestoneTemporalStereotype(
          derivedPropertyExpressionState.propertyExpression.func.genericType
            .value.rawType,
          derivedPropertyExpressionState.queryBuilderState.graphManagerState
            .graph,
        )
      : undefined;
  const shouldReturnMilestoningParameter =
    temporalTarget &&
    ((idx < derivedPropertyExpressionState.parameterValues.length &&
      (matchMilestoningParameterValue(
        temporalTarget,
        idx,
        guaranteeNonNullable(
          derivedPropertyExpressionState.parameterValues[idx],
        ),
        derivedPropertyExpressionState.queryBuilderState.querySetupState,
      ) ||
        /**
         * Checks if the given milestoning needs to be overwritten or not.
         * Specially, we would need to rewrite the query if the user passes a single parameter
         * to the `bitemporal` property expression with `processing temporal` source.
         */
        (getDerivedPropertyMilestoningSteoreotype(
          derivedPropertyExpressionState.derivedProperty,
          derivedPropertyExpressionState.queryBuilderState.graphManagerState
            .graph,
        ) === MILESTONING_STEREOTYPE.PROCESSING_TEMPORAL &&
          temporalTarget === MILESTONING_STEREOTYPE.BITEMPORAL &&
          derivedPropertyExpressionState.parameterValues.length === 1))) ||
      idx >= derivedPropertyExpressionState.parameterValues.length);

  if (!shouldReturnMilestoningParameter) {
    return undefined;
  }

  switch (temporalTarget) {
    case MILESTONING_STEREOTYPE.BUSINESS_TEMPORAL: {
      if (!querySetupState.businessDate) {
        querySetupState.setBusinessDate(
          derivedPropertyExpressionState.queryBuilderState.buildMilestoningParameter(
            DEFAULT_BUSINESS_DATE_MILESTONING_PARAMETER_NAME,
          ),
        );
      }
      const parameter = new INTERNAL__PropagatedValue(
        derivedPropertyExpressionState.queryBuilderState.graphManagerState.graph.getTypicalMultiplicity(
          TYPICAL_MULTIPLICITY_TYPE.ONE,
        ),
      );
      parameter.getValue = (): ValueSpecification =>
        guaranteeNonNullable(querySetupState.businessDate);
      return parameter;
    }
    case MILESTONING_STEREOTYPE.BITEMPORAL: {
      if (!querySetupState.processingDate) {
        querySetupState.setProcessingDate(
          derivedPropertyExpressionState.queryBuilderState.buildMilestoningParameter(
            DEFAULT_PROCESSING_DATE_MILESTONING_PARAMETER_NAME,
          ),
        );
      }
      if (!querySetupState.businessDate) {
        querySetupState.setBusinessDate(
          derivedPropertyExpressionState.queryBuilderState.buildMilestoningParameter(
            DEFAULT_BUSINESS_DATE_MILESTONING_PARAMETER_NAME,
          ),
        );
      }
      if (idx === 0) {
        if (
          temporalSource === MILESTONING_STEREOTYPE.PROCESSING_TEMPORAL &&
          derivedPropertyExpressionState.parameterValues.length === 1
        ) {
          return guaranteeType(
            derivedPropertyExpressionState.propertyExpression
              .parametersValues[0],
            AbstractPropertyExpression,
          ).parametersValues[1];
        }
        const parameter = new INTERNAL__PropagatedValue(
          derivedPropertyExpressionState.queryBuilderState.graphManagerState.graph.getTypicalMultiplicity(
            TYPICAL_MULTIPLICITY_TYPE.ONE,
          ),
        );
        parameter.getValue = (): ValueSpecification =>
          guaranteeNonNullable(querySetupState.processingDate);
        return parameter;
      } else {
        if (
          temporalSource === MILESTONING_STEREOTYPE.PROCESSING_TEMPORAL &&
          derivedPropertyExpressionState.parameterValues.length === 1
        ) {
          return derivedPropertyExpressionState.parameterValues[0];
        } else if (
          temporalSource === MILESTONING_STEREOTYPE.BUSINESS_TEMPORAL &&
          derivedPropertyExpressionState.parameterValues.length === 1
        ) {
          return guaranteeType(
            derivedPropertyExpressionState.propertyExpression
              .parametersValues[0],
            AbstractPropertyExpression,
          ).parametersValues[1];
        }
        const parameter = new INTERNAL__PropagatedValue(
          derivedPropertyExpressionState.queryBuilderState.graphManagerState.graph.getTypicalMultiplicity(
            TYPICAL_MULTIPLICITY_TYPE.ONE,
          ),
        );
        parameter.getValue = (): ValueSpecification =>
          guaranteeNonNullable(querySetupState.businessDate);
        return parameter;
      }
    }
    case MILESTONING_STEREOTYPE.PROCESSING_TEMPORAL: {
      if (!querySetupState.processingDate) {
        querySetupState.setProcessingDate(
          derivedPropertyExpressionState.queryBuilderState.buildMilestoningParameter(
            DEFAULT_PROCESSING_DATE_MILESTONING_PARAMETER_NAME,
          ),
        );
      }
      const parameter = new INTERNAL__PropagatedValue(
        derivedPropertyExpressionState.queryBuilderState.graphManagerState.graph.getTypicalMultiplicity(
          TYPICAL_MULTIPLICITY_TYPE.ONE,
        ),
      );
      parameter.getValue = (): ValueSpecification =>
        guaranteeNonNullable(querySetupState.processingDate);
      return parameter;
    }
    default:
      return undefined;
  }
};

export const getPropertyChainName = (
  propertyExpression: AbstractPropertyExpression,
  humanizePropertyName: boolean,
): string => {
  const propertyNameDecorator = humanizePropertyName
    ? prettyPropertyName
    : (val: string): string => val;
  const propertyNameChain = [
    propertyNameDecorator(propertyExpression.func.name),
  ];
  let currentExpression: ValueSpecification | undefined = propertyExpression;
  while (currentExpression instanceof AbstractPropertyExpression) {
    currentExpression = getNullableFirstElement(
      currentExpression.parametersValues,
    );
    if (currentExpression instanceof AbstractPropertyExpression) {
      propertyNameChain.unshift(
        propertyNameDecorator(currentExpression.func.name),
      );
    }
    // Take care of chains of subtype (a pattern that is not useful, but we want to support and rectify)
    // $x.employees->subType(@Person)->subType(@Staff)
    while (
      currentExpression instanceof SimpleFunctionExpression &&
      matchFunctionName(
        currentExpression.functionName,
        QUERY_BUILDER_SUPPORTED_FUNCTIONS.SUBTYPE,
      )
    ) {
      const propertyWithSubtype = `(${TYPE_CAST_TOKEN}${propertyNameDecorator(
        currentExpression.parametersValues.filter(
          (param) => param instanceof InstanceValue,
        )[0]?.genericType?.value.rawType.name ?? '',
      )})${propertyNameDecorator(
        currentExpression.parametersValues[0] instanceof
          AbstractPropertyExpression
          ? currentExpression.parametersValues[0]?.func.name
          : '',
      )}`;
      propertyNameChain.unshift(propertyWithSubtype);
      currentExpression = getNullableFirstElement(
        currentExpression.parametersValues,
      );
    }
  }
  return propertyNameChain.join(humanizePropertyName ? '/' : '.');
};

export const getPropertyPath = (
  propertyExpression: AbstractPropertyExpression,
): string => {
  const propertyNameChain = [propertyExpression.func.name];
  let currentExpression: ValueSpecification | undefined = propertyExpression;
  while (currentExpression instanceof AbstractPropertyExpression) {
    currentExpression = getNullableFirstElement(
      currentExpression.parametersValues,
    );
    if (currentExpression instanceof AbstractPropertyExpression) {
      propertyNameChain.unshift(currentExpression.func.name);
    }
  }
  return propertyNameChain.join('.');
};

export const generateValueSpecificationForParameter = (
  parameter: VariableExpression,
  graph: PureModel,
): ValueSpecification => {
  const genericType = parameter.genericType;
  if (genericType) {
    const type = genericType.value.rawType;
    // Clone the generic type reference and avoid directly using the
    // reference of the parameter so when we edit the value specification
    // we don't accidentally modify the type of the parameter which is constant
    // See https://github.com/finos/legend-studio/issues/1099
    const genericTypeExplicitReference = GenericTypeExplicitReference.create(
      new GenericType(type),
    );
    if (
      (
        [
          PRIMITIVE_TYPE.STRING,
          PRIMITIVE_TYPE.BOOLEAN,
          PRIMITIVE_TYPE.NUMBER,
          PRIMITIVE_TYPE.FLOAT,
          PRIMITIVE_TYPE.DECIMAL,
          PRIMITIVE_TYPE.INTEGER,
          PRIMITIVE_TYPE.DATE,
          PRIMITIVE_TYPE.STRICTDATE,
          PRIMITIVE_TYPE.DATETIME,
          PRIMITIVE_TYPE.LATESTDATE,
        ] as string[]
      ).includes(type.name)
    ) {
      const primitiveInstanceValue = new PrimitiveInstanceValue(
        genericTypeExplicitReference,
        parameter.multiplicity,
      );
      if (type.name !== PRIMITIVE_TYPE.LATESTDATE) {
        primitiveInstanceValue.values = [
          generateDefaultValueForPrimitiveType(type.name as PRIMITIVE_TYPE),
        ];
      }
      return primitiveInstanceValue;
    } else if (type instanceof Enumeration) {
      const enumValueInstanceValue = new EnumValueInstanceValue(
        genericTypeExplicitReference,
        parameter.multiplicity,
      );
      if (type.values.length) {
        const enumValueRef = EnumValueExplicitReference.create(
          type.values[0] as Enum,
        );
        enumValueInstanceValue.values = [enumValueRef];
      }
      return enumValueInstanceValue;
    }
  }
  // for arguments of types we don't support, we will fill them with `[]`
  // which in Pure is equivalent to `null` in other languages
  return new CollectionInstanceValue(
    graph.getTypicalMultiplicity(TYPICAL_MULTIPLICITY_TYPE.ZERO),
  );
};

const fillDerivedPropertyParameterValues = (
  derivedPropertyExpressionState: QueryBuilderDerivedPropertyExpressionState,
): void => {
  const parameterValues: ValueSpecification[] =
    derivedPropertyExpressionState.parameterValues;
  derivedPropertyExpressionState.parameters.forEach((parameter, idx) => {
    // Check if a value is already provided for a parameter
    if (idx < derivedPropertyExpressionState.parameterValues.length) {
      // Here we check if the parameter value matches with the corresponding `businessDate` or `processingDate`
      // NOTE: This will rewrite provided query since if people explicitly specified the parameter values,
      // we will overwrite them.
      parameterValues[idx] =
        generateMilestonedPropertyParameterValue(
          derivedPropertyExpressionState,
          idx,
        ) ?? guaranteeNonNullable(parameterValues[idx]);

      // Otherwise, we will just skip this parameter as value is already provided
      return;
    }
    parameterValues.push(
      generateMilestonedPropertyParameterValue(
        derivedPropertyExpressionState,
        idx,
      ) ??
        generateValueSpecificationForParameter(
          parameter,
          derivedPropertyExpressionState.queryBuilderState.graphManagerState
            .graph,
        ),
    );
  });
  functionExpression_setParametersValues(
    derivedPropertyExpressionState.propertyExpression,
    [
      guaranteeNonNullable(
        derivedPropertyExpressionState.propertyExpression.parametersValues[0],
      ),
      ...parameterValues,
    ],
    derivedPropertyExpressionState.queryBuilderState.observableContext,
  );
};

export class QueryBuilderDerivedPropertyExpressionState {
  queryBuilderState: QueryBuilderState;
  path: string;
  title: string;
  readonly propertyExpression: AbstractPropertyExpression;
  readonly derivedProperty: DerivedProperty;
  readonly parameters: VariableExpression[] = [];

  constructor(
    queryBuilderState: QueryBuilderState,
    propertyExpression: AbstractPropertyExpression,
  ) {
    this.path = getPropertyPath(propertyExpression);
    this.title = getPropertyChainName(propertyExpression, true);
    this.propertyExpression = observe_AbstractPropertyExpression(
      propertyExpression,
      queryBuilderState.observableContext,
    );
    this.queryBuilderState = queryBuilderState;
    this.derivedProperty = guaranteeType(
      propertyExpression.func,
      DerivedProperty,
    );
    // build the parameters of the derived properties
    if (Array.isArray(this.derivedProperty.parameters)) {
      this.parameters = this.derivedProperty.parameters.map((parameter) =>
        guaranteeType(
          this.queryBuilderState.graphManagerState.graphManager.buildValueSpecification(
            parameter,
            this.queryBuilderState.graphManagerState.graph,
          ),
          VariableExpression,
        ),
      );
    }
    fillDerivedPropertyParameterValues(this);
  }

  get property(): AbstractProperty {
    return this.propertyExpression.func;
  }

  get parameterValues(): ValueSpecification[] {
    return this.propertyExpression.parametersValues.slice(1);
  }

  get isValid(): boolean {
    // TODO: more type matching logic here (take into account multiplicity, type, etc.)
    return this.parameterValues.every((paramValue) => {
      if (paramValue instanceof InstanceValue) {
        const isRequired = paramValue.multiplicity.lowerBound >= 1;
        // required and no values provided. LatestDate doesn't have any values so we skip that check for it.
        if (
          isRequired &&
          paramValue.genericType?.value.rawType.name !==
            PRIMITIVE_TYPE.LATESTDATE &&
          !paramValue.values.length
        ) {
          return false;
        }
        // more values than allowed
        if (
          paramValue.multiplicity.upperBound &&
          paramValue.values.length > paramValue.multiplicity.upperBound
        ) {
          return false;
        }
      }
      return true;
    });
  }
}

export class QueryBuilderPropertyExpressionState {
  queryBuilderState: QueryBuilderState;
  path: string;
  title: string;
  readonly propertyExpression: AbstractPropertyExpression;

  isEditingDerivedPropertyExpression = false;
  // Since this property is a chain expression, some link of the chain can be
  // derived property, as such, we need to keep track of the derived properties state in an array
  derivedPropertyExpressionStates: QueryBuilderDerivedPropertyExpressionState[] =
    [];
  /**
   * If at least one property in the chain is of multiplicity greater than 1,
   * the property might have multiple values and can cause row explosions.
   *
   * In other words, saying `$x.b == 1` is not quite accurate if `$x.b` is multi
   * is multi. Instead, we should do something like `$x.b->exists($x1 | $x1 == 1)`
   */
  requiresExistsHandling = false;

  constructor(
    queryBuilderState: QueryBuilderState,
    propertyExpression: AbstractPropertyExpression,
  ) {
    makeAutoObservable<
      QueryBuilderPropertyExpressionState,
      'initDerivedPropertyExpressionStates'
    >(this, {
      queryBuilderState: false,
      setIsEditingDerivedProperty: action,
      initDerivedPropertyExpressionStates: action,
    });

    this.queryBuilderState = queryBuilderState;
    this.propertyExpression = observe_AbstractPropertyExpression(
      propertyExpression,
      queryBuilderState.observableContext,
    );
    this.path = getPropertyPath(propertyExpression);
    this.title = getPropertyChainName(propertyExpression, true);
    this.initDerivedPropertyExpressionStates();
  }

  get isValid(): boolean {
    return this.derivedPropertyExpressionStates.every((e) => e.isValid);
  }

  setIsEditingDerivedProperty(val: boolean): void {
    this.isEditingDerivedPropertyExpression = val;
  }

  private initDerivedPropertyExpressionStates(): void {
    let requiresExistsHandling = false;
    const result: QueryBuilderDerivedPropertyExpressionState[] = [];
    let currentExpression: ValueSpecification | undefined =
      this.propertyExpression;
    while (currentExpression instanceof AbstractPropertyExpression) {
      // Check if the property chain can results in column that have multiple values
      if (
        currentExpression.func.multiplicity.upperBound === undefined ||
        currentExpression.func.multiplicity.upperBound > 1
      ) {
        requiresExistsHandling = true;
      }
      // check if the property is milestoned
      if (
        currentExpression.func.genericType.value.rawType instanceof Class &&
        currentExpression.func._OWNER._generatedMilestonedProperties.length !==
          0
      ) {
        const name = currentExpression.func.name;
        const func =
          currentExpression.func._OWNER._generatedMilestonedProperties.find(
            (e) => e.name === name,
          );
        if (func) {
          currentExpression.func = func;
        }
      }

      // Create states to hold derived properties' parameters and arguments for editing
      if (currentExpression.func instanceof DerivedProperty) {
        const derivedPropertyExpressionState =
          new QueryBuilderDerivedPropertyExpressionState(
            this.queryBuilderState,
            currentExpression,
          );
        result.push(derivedPropertyExpressionState);
      }
      currentExpression = getNullableFirstElement(
        currentExpression.parametersValues,
      );
      // Take care of chains of subtype (a pattern that is not useful, but we want to support and rectify)
      // $x.employees->subType(@Person)->subType(@Staff)
      while (
        currentExpression instanceof SimpleFunctionExpression &&
        matchFunctionName(
          currentExpression.functionName,
          QUERY_BUILDER_SUPPORTED_FUNCTIONS.SUBTYPE,
        )
      ) {
        currentExpression = getNullableFirstElement(
          currentExpression.parametersValues,
        );
      }
    }
    this.requiresExistsHandling = requiresExistsHandling;
    this.derivedPropertyExpressionStates = result.slice().reverse();
  }
}
