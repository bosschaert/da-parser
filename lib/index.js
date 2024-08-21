/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { Schema } from 'prosemirror-model';
import { schema as baseSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { tableNodes } from 'prosemirror-tables';

function parseLocDOM(locTag) {
  return [{
    tag: locTag,

    // Do we need to add this to the contentElement function?
    // Only parse the content of the node, not the temporary elements
    // const deleteThese = dom.querySelectorAll('[loc-temp-dom]');
    // deleteThese.forEach((e) => e.remove());
    contentElement: (dom) => dom,
  }];
}

function addLocNodes(baseNodes) {
  if (!baseNodes.content.includes('loc_deleted')) {
    baseNodes.content.push('loc_deleted');
    baseNodes.content.push({
      group: 'block',
      content: 'block+',
      parseDOM: parseLocDOM('da-loc-deleted'),
      toDOM: () => ['da-loc-deleted', { contenteditable: false }, 0],
    });
    baseNodes.content.push('loc_added');
    baseNodes.content.push({
      group: 'block',
      content: 'block+',
      parseDOM: parseLocDOM('da-loc-added'),
      toDOM: () => ['da-loc-added', { contenteditable: false }, 0],
    });
  }
  return baseNodes;
}

function addCustomMarks(marks) {
  const sup = {
    parseDOM: [{ tag: 'sup' }, { clearMark: (m) => m.type.name === 'sup' }],
    toDOM() { return ['sup', 0]; },
  };

  const sub = {
    parseDOM: [{ tag: 'sub' }, { clearMark: (m) => m.type.name === 'sub' }],
    toDOM() { return ['sub', 0]; },
  };

  const contextHighlight = { toDOM: () => ['span', { class: 'highlighted-context' }, 0] };

  return marks
    .addToEnd('sup', sup)
    .addToEnd('sub', sub)
    .addToEnd('contextHighlightingMark', contextHighlight);
}

export function getSchema() {
  const { marks, nodes: baseNodes } = baseSchema.spec;
  const withLocNodes = addLocNodes(baseNodes);
  const withListnodes = addListNodes(withLocNodes, 'block+', 'block');
  const nodes = withListnodes.append(tableNodes({ tableGroup: 'block', cellContent: 'block+' }));
  const customMarks = addCustomMarks(marks);
  return new Schema({ nodes, marks: customMarks });
}

export function parserTest() {
  console.log('Im here!');
  return 'just testing';
}
