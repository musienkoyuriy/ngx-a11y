'use strict';

const Validator = require('../validator');

function altAttribute($, content) {
  return new Validator({
    $template: $,
    content: content,
    selectors: ['img', 'area'],
    isInvalid: function(selector) {
      return !selector.attr('alt');
    },
    warningMessage: function(el) {
      const tagName = el[0].name;
      const purpose = tagName === 'img' ? 'image map' : 'link';
      const message = `The alt attribute of the <${tagName} /> tag must state the purpose of the ${purpose}.`;
    
      return message;
    }
  });
}

module.exports = altAttribute;