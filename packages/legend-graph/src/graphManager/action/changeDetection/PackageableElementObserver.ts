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

import type {
  PackageableElement,
  PackageableElementVisitor,
} from '../../../models/metamodels/pure/packageableElements/PackageableElement.js';
import type { Profile } from '../../../models/metamodels/pure/packageableElements/domain/Profile.js';
import type { Enumeration } from '../../../models/metamodels/pure/packageableElements/domain/Enumeration.js';
import type { Measure } from '../../../models/metamodels/pure/packageableElements/domain/Measure.js';
import type { Class } from '../../../models/metamodels/pure/packageableElements/domain/Class.js';
import type { Association } from '../../../models/metamodels/pure/packageableElements/domain/Association.js';
import type { ConcreteFunctionDefinition } from '../../../models/metamodels/pure/packageableElements/domain/ConcreteFunctionDefinition.js';
import type { FlatData } from '../../../models/metamodels/pure/packageableElements/store/flatData/model/FlatData.js';
import type { Database } from '../../../models/metamodels/pure/packageableElements/store/relational/model/Database.js';
import type { Mapping } from '../../../models/metamodels/pure/packageableElements/mapping/Mapping.js';
import type { Service } from '../../../models/metamodels/pure/packageableElements/service/Service.js';
import type { PackageableRuntime } from '../../../models/metamodels/pure/packageableElements/runtime/PackageableRuntime.js';
import type { PackageableConnection } from '../../../models/metamodels/pure/packageableElements/connection/PackageableConnection.js';
import type { FileGenerationSpecification } from '../../../models/metamodels/pure/packageableElements/fileGeneration/FileGenerationSpecification.js';
import type { GenerationSpecification } from '../../../models/metamodels/pure/packageableElements/generationSpecification/GenerationSpecification.js';
import type { Package } from '../../../models/metamodels/pure/packageableElements/domain/Package.js';
import type { PrimitiveType } from '../../../models/metamodels/pure/packageableElements/domain/PrimitiveType.js';
import type { SectionIndex } from '../../../models/metamodels/pure/packageableElements/section/SectionIndex.js';
import {
  observe_Association,
  observe_Class,
  observe_ConcreteFunctionDefinition,
  observe_Enumeration,
  observe_Measure,
  observe_Package,
  observe_Profile,
  observe_SectionIndex,
} from './DomainObserverHelper.js';
import {
  type ObserverContext,
  skipObservedWithContext,
} from './CoreObserverHelper.js';
import {
  observe_FileGenerationSpecification,
  observe_GenerationSpecification,
} from './DSLGenerationSpecification_ObserverHelper.js';
import {
  observe_Mapping,
  observe_PackageableConnection,
  observe_PackageableRuntime,
} from './DSLMapping_ObserverHelper.js';
import { observe_Service } from './DSLService_ObserverHelper.js';
import { observe_FlatData } from './StoreFlatData_ObserverHelper.js';
import { observe_Database } from './StoreRelational_ObserverHelper.js';
import type { DataElement } from '../../../models/metamodels/pure/packageableElements/data/DataElement.js';
import { observe_DataElement } from './DSLData_ObserverHelper.js';

class PackageableElementObserver implements PackageableElementVisitor<void> {
  observerContext: ObserverContext;

  constructor(observerContext: ObserverContext) {
    this.observerContext = observerContext;
  }

  visit_PackageableElement(element: PackageableElement): void {
    const extraElementObservers = this.observerContext.plugins.flatMap(
      (plugin) => plugin.getExtraElementObservers?.() ?? [],
    );
    for (const observer of extraElementObservers) {
      const observedElement = observer(element, this.observerContext);
      if (observedElement) {
        return;
      }
    }
  }

  visit_Package(element: Package): void {
    observe_Package(element, this.observerContext);
  }

  visit_SectionIndex(element: SectionIndex): void {
    observe_SectionIndex(element);
  }

  visit_PrimitiveType(element: PrimitiveType): void {
    return;
  }

  visit_Profile(element: Profile): void {
    observe_Profile(element);
  }

  visit_Enumeration(element: Enumeration): void {
    observe_Enumeration(element);
  }

  visit_Measure(element: Measure): void {
    observe_Measure(element);
  }

  visit_Class(element: Class): void {
    observe_Class(element);
  }

  visit_Association(element: Association): void {
    observe_Association(element);
  }

  visit_ConcreteFunctionDefinition(element: ConcreteFunctionDefinition): void {
    observe_ConcreteFunctionDefinition(element);
  }

  visit_FlatData(element: FlatData): void {
    observe_FlatData(element);
  }

  visit_Database(element: Database): void {
    observe_Database(element, this.observerContext);
  }

  visit_Mapping(element: Mapping): void {
    observe_Mapping(element, this.observerContext);
  }

  visit_Service(element: Service): void {
    observe_Service(element, this.observerContext);
  }

  visit_PackageableRuntime(element: PackageableRuntime): void {
    observe_PackageableRuntime(element, this.observerContext);
  }

  visit_PackageableConnection(element: PackageableConnection): void {
    observe_PackageableConnection(element, this.observerContext);
  }

  visit_FileGenerationSpecification(
    element: FileGenerationSpecification,
  ): void {
    observe_FileGenerationSpecification(element);
  }

  visit_GenerationSpecification(element: GenerationSpecification): void {
    observe_GenerationSpecification(element);
  }

  visit_DataElement(element: DataElement): void {
    observe_DataElement(element, this.observerContext);
  }
}

export const observe_PackageableElement = skipObservedWithContext(
  (
    packageableElement: PackageableElement,
    context: ObserverContext,
  ): PackageableElement => {
    packageableElement.accept_PackageableElementVisitor(
      new PackageableElementObserver(context),
    );
    return packageableElement;
  },
);
