import { types } from 'mobx-state-tree';

import ParticleEmitter from 'particle-emitter';

import tachyonsConfig from 'particle-emitter/build/examples/tachyons/config';

const cssStringToArray = str => {
  const result = [];
  str.split('\n').forEach(line => {
    const matches = line.match(/^([^{]+){([^}]+)}/);
    if (matches === null) {
      result.push(['', line]);
    } else {
      let [, theClass, theRule] = matches;
      theClass = (theClass || '').trim();
      theRule = (theRule || '').trim();
      result.push([theClass, theRule])
    }
  });
  return result;
};

const ParticleEmitterWrapperModel = types.model('ParticleEmitterWrapper', {
  particleEmitterInstance: types.frozen(),
  includeMediaQueryRules: false,
})
  .views(self => ({
    get json() {
      return self.particleEmitterInstance.getJson()
    },
    get css() {
      return self.particleEmitterInstance.getCss()
    },
  }))
  .views(self => ({
    get responsiveAvailableText() {
      return '/*** Responsive variations available (' + Array.from(this.json.mediaQueries.values()).map(([ key ]) => key).join(', ') + ') ***/\n\n';
    },
    get cssArray() {
      return self.css.split('\n');
    },
    getRuleCss(ruleKey) {
      const result = [];

      const [, ruleValue] = self.json.rules.filter(([key]) => key === ruleKey)[0];

      cssStringToArray(self.particleEmitterInstance.getRuleCss({
        key: ruleKey,
        value: ruleValue,
      })).forEach(classRuleEntry => {
        result.push(classRuleEntry);
      });

      if (ruleValue.repeatForMediaQueries) {
        if (self.includeMediaQueryRules) {
          self.json.mediaQueries.forEach(
            ([mediaQuery]) => {
              cssStringToArray(self.particleEmitterInstance.getRuleCss({
                key: ruleKey,
                value: ruleValue,
                mediaQuery: mediaQuery,
              })).forEach(classRuleEntry => {
                result.push(classRuleEntry);
              });
            }
          );
        } else {
          result.push(['', self.responsiveAvailableText]);
        }
      }

      return result;
    },
  }))
  .views(self => ({
    get rules() {
      const result = [];
      self.json.rules.forEach(
        ([ruleKey]) => result.push([ruleKey, self.getRuleCss(ruleKey)])
      );
      return result;
    },
  }))
  .views(self => ({
    filteredRules(filter) {
      filter = new RegExp(filter);
      return self.rules.filter(([ruleGroup, ruleCss]) => {
        if (ruleGroup.match(filter) !== null) return true;
        let matchFound = false;
        ruleCss.forEach(([theClass, theRule]) => {
          if (!matchFound && (theClass.match(filter) || theRule.match(filter))) {
            matchFound = true;
          }
        });
        return matchFound;
      });
    },
  }))


  .actions(self => ({
    setNewInstance(instance) {
      self.particleEmitterInstance = instance;
    },
    setIncludeMediaQueryRules(value) {
      self.includeMediaQueryRules = !!value;
    },
  }))
;


export default ParticleEmitterWrapperModel.create({
  particleEmitterInstance: new ParticleEmitter(tachyonsConfig),
});
