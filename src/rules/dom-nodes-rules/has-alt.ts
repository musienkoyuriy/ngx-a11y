import DOMNodesValidator from '../../dom-nodes-validator';
import { hasNonEmptyAttribute } from '../../utils';
import { RuleData } from './../../models/rule';

export default function hasAlt($: any): DOMNodesValidator {
  return new DOMNodesValidator({
    selector: ['img', 'area'],
    assocAttrs: ['alt'],
    isInvalid: (rule: RuleData) => {
      const { elem, attrs } = rule;
      return attrs ? !hasNonEmptyAttribute($(elem), attrs) : false;
    },
    warningMessage: (el: any) => {
      const tagName = el.name;
      const purpose = tagName === 'img' ? 'image map' : 'link';
      const message = `The alt attribute of the <${tagName} /> element must state the purpose of the ${purpose}.`;

      return message;
    }
  });
}
