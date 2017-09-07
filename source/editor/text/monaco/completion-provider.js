
function CompletionProvider(monaco, schemaNode) {

  function getLastOpenedTag(text) {
    // get all tags inside of the content
    var tags = text.match(/<\/*(?=\S*)([a-zA-Z-]+)/g);
    if (!tags) {
      return undefined;
    }
    // we need to know which tags are closed
    var closingTags = [];
    for (var i = tags.length - 1; i >= 0; i--) {
      if (tags[i].indexOf('</') === 0) {
        closingTags.push(tags[i].substring('</'.length));
      }
      else {
        // get the last position of the tag
        var tagPosition = text.lastIndexOf(tags[i]);
        var tag = tags[i].substring('<'.length);
        var closingBracketIdx = text.indexOf('/>', tagPosition);
        // if the tag wasn't closed
        if (closingBracketIdx === -1) {
          // if there are no closing tags or the current tag wasn't closed
          if (!closingTags.length || closingTags[closingTags.length - 1] !== tag) {
            // we found our tag, but let's get the information if we are looking for
            // a child element or an attribute
            text = text.substring(tagPosition);
            var openedTag = text.indexOf('<') > text.indexOf('>');
            var contentSearch = openedTag && /="[^"]*$/.test(text)
            return {
              tagName: tag,
              isAttributeSearch: openedTag && !contentSearch,
              isContentSearch: contentSearch,
              text: text
            };
          }
          // remove the last closed tag
          closingTags.splice(closingTags.length - 1, 1);
        }
        // remove the last checked tag and continue processing the rest of the content
        text = text.substring(0, tagPosition);
      }
    }
  }

  function findElements(parent, elementName, maxDepth, currentDepth) {
    if (maxDepth <= currentDepth) {
      return null;
    }
    if (!parent) {
      parent = schemaNode.allowedRootElements.pages;
    }
    if (currentDepth === undefined) {
      currentDepth = 1;
    }
    var allowedElements = parent.getAllowedElements();
    if (elementName in allowedElements) {
      return allowedElements[elementName];
    } else {
      for (var element in allowedElements) {
        var result = findElements(allowedElements[element], elementName, maxDepth, currentDepth++);
        if (result) {
          return result;
        }
      }
    }

  }

  function getAreaInfo(text) {
    // opening for strings, comments and CDATA
    var items = ['"', '\'', '<!--', '<![CDATA['];
    var isCompletionAvailable = true;
    // remove all comments, strings and CDATA
    text = text.replace(/"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g, '');
    for (var i = 0; i < items.length; i++) {
      var itemIdx = text.indexOf(items[i]);
      if (itemIdx > -1) {
        // we are inside one of unavailable areas, so we remote that area
        // from our clear text
        text = text.substring(0, itemIdx);
        // and the completion is not available
        isCompletionAvailable = false;
      }
    }
    return {
      isCompletionAvailable: isCompletionAvailable,
      clearedText: text
    };
  }

  // function findAttributes(elements) {
  //   var attrs = [];
  //   for (var i = 0; i < elements.length; i++) {
  //     Object.getOwnPropertyNames(elements[i].allowedAttributes).forEach(attrs.push);
  //   }
  //   return attrs;
  // }

  function isItemAvailable(itemName, maxOccurs, items) {
    // the default for 'maxOccurs' is 1
    maxOccurs = maxOccurs || '1';
    // the element can appere infinite times, so it is available
    if (maxOccurs && maxOccurs === 'unbounded') {
      return true;
    }
    // count how many times the element appeared
    var count = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i] === itemName) {
        count++;
      }
    }
    // if it didn't appear yet, or it can appear again, then it
    // is available, otherwise it't not
    return count === 0 || parseInt(maxOccurs) > count;
  }

  function getAvailableElements(monaco, element, usedItems) {
    var availableItems = [];
    var children = element.getAllowedElements();

    console.log(children);
    // if there are no such elements, then there are no suggestions
    if (!children) {
      return [];
    }
    Object.getOwnPropertyNames(children).forEach(function(name) {
      // get all element attributes
      var childElem = children[name];
      // the element is a suggestion if it's available
      if (isItemAvailable(childElem.name, childElem.getBounds().max, usedItems)) {
        // mark it as a 'field', and get the documentation
        availableItems.push({
          label: childElem.name,
          kind: monaco.languages.CompletionItemKind.Field,
          detail: childElem.type,
          documentation: childElem.getDocumentation()
        });
      }
    });
    // return the suggestions we found
    return availableItems;
  }

  function getAvailableAttributes(monaco, element, usedChildTags) {
    var availableItems = [];
    // get all attributes for the element
    var attrs = element.allowedAttributes;
    Object.getOwnPropertyNames(attrs).forEach(function(name) { // jshint ignore:line
      var attr = attrs[name];
      // accept it in a suggestion list only the attribute is not used yet
      if (usedChildTags.indexOf(attr.name) === -1) {
        // mark it as a 'property', and get it's documentation
        availableItems.push({
          label: attr.name,
          kind: monaco.languages.CompletionItemKind.Property,
          detail: attr.getTypeString(),
          documentation: attr.getDocumentation()
        });
      }
    });

    // return the elements we found
    return availableItems;
  }

  this.getProvider = function() {
    return {
      triggerCharacters: ['<'],
      provideCompletionItems: function (model, position) {
        // get editor content before the pointer
        var textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        // get content info - are we inside of the area where we don't want suggestions, what is the content without those areas
        var areaUntilPositionInfo = getAreaInfo(textUntilPosition); // isCompletionAvailable, clearedText
        // if we don't want any suggestions, return empty array
        if (!areaUntilPositionInfo.isCompletionAvailable) {
          return [];
        }
        // if we want suggestions, inside of which tag are we?
        var lastOpenedTag = getLastOpenedTag(areaUntilPositionInfo.clearedText);
        // get opened tags to see what tag we should look for in the XSD schema
        var openedTags = [];
        // get the elements/attributes that are already mentioned in the element we're in
        var usedItems = [];
        var isAttributeSearch = lastOpenedTag && lastOpenedTag.isAttributeSearch;
        var isContentSearch = lastOpenedTag && lastOpenedTag.isContentSearch;
        // no need to calculate the position in the XSD schema if we are in the root element
        if (lastOpenedTag) {
          // parse the content (not cleared text) into an xml document
          var xmlDoc = stringToXml(textUntilPosition);
          var lastChild = xmlDoc.lastElementChild;
          var i;
          var lastFound = false;
          while (lastChild) {
            openedTags.push(lastChild.tagName);
            // if we found our last opened tag
            if (lastChild.tagName === lastOpenedTag.tagName) {
              lastFound = true;
              // if we are looking for attributes, then used items should
              // be the attributes we already used
              if (lastOpenedTag.isAttributeSearch) {
                var attrs = lastChild.attributes;
                for (i = 0; i < attrs.length; i++) {
                  usedItems.push(attrs[i].nodeName);
                }
              }
              else {
                // if we are looking for child elements, then used items
                // should be the elements that were already used
                var children = lastChild.children;
                for (i = 0; i < children.length; i++) {
                  usedItems.push(children[i].tagName);
                }
              }
              break;
            }
            // we haven't found the last opened tag yet, so we move to
            // the next element
            lastChild = lastChild.lastElementChild;
          }
          if (!lastFound) {
            // fallback -> parse string
            console.log(lastOpenedTag.text);
            if (isAttributeSearch) {
              var parts = lastOpenedTag.text.split(" ");
              // skip tag name
              parts.shift();
              parts.forEach(function(entry) {
                usedItems.push(entry.split("=").shift());
              });
            }
          }
        }
        // find the last opened tag in the schema to see what elements/attributes it can have
        var searchedElement = openedTags[openedTags.length-1];
        var currentItem = findElements(schemaNode.allowedRootElements.pages, searchedElement, openedTags.length);
        var res = [];

        // return available elements/attributes if the tag exists in the schema, or an empty
        // array if it doesn't
        if (isContentSearch) {
          // TODO
        }
        else if (isAttributeSearch) {
          // get attributes completions
          res = currentItem ? getAvailableAttributes(monaco, currentItem, usedItems) : [];
        }
        else {
          // get elements completions
          res = currentItem ? getAvailableElements(monaco, currentItem, usedItems) : [];
        }
        return res;
      }
    };
  };
}