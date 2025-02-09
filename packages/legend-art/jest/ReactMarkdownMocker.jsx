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

import { jest } from '@jest/globals';

/**
 * Since these modules are in ESM, Jest does not yet play well with them so we can mock them out during
 * testing without much harm.
 *
 * See https://github.com/remarkjs/remark/discussions/814
 * See https://github.com/remarkjs/react-markdown/issues/635
 *
 * NOTE: we could do what we do with `react-dnd` which is to include `react-markdown` and `remark-gfm`
 * and some of their dependencies to the list of packages to be transformed by `babel-jest`, but mocking
 * them like this might just be faster. However, usage of `jest.mock` might not be fully supported by
 * Jest ESM
 * See https://github.com/facebook/jest/issues/9430
 * See https://github.com/facebook/jest/pull/10976
 *
 * We're waiting for
 * See https://github.com/finos/legend-studio/issues/502
 */
jest.mock('react-markdown', () => (props) => {
  return <>{props.children}</>;
});

jest.mock('remark-gfm', () => () => {
  // do nothing
});
