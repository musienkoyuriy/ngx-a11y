import { hasNonEmptyAttribute } from '../utils';
import Validator from '../validator';

export default function hasAlt($: any, content: string): Validator {
  return new Validator({
    $template: $,
    content,
    selectors: ['img', 'area'],
    assocAttrs: ['alt'],
    isInvalid: ($elem: Cheerio, attrs?: string[]) => {
      return attrs ? !hasNonEmptyAttribute($elem, attrs) : false;
    },
    warningMessage: (el: any) => {
      const tagName = el.name;
      const purpose = tagName === 'img' ? 'image map' : 'link';
      const message = `The alt attribute of the <${tagName} /> element must state the purpose of the ${purpose}.`;

      return message;
    }
  });
}
