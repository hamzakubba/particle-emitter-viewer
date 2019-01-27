import React, { Component } from 'react';
import { observer } from 'mobx-react';

import particleEmitterWrapper from './stores/ParticleEmitterWrapper';

const format = (str, searchFilter) => {
  return str
    .replace(new RegExp(' ', 'g'), '&nbsp;')
    .replace(new RegExp('(' + searchFilter + ')', 'g'), searchFilter ? '<span class="b black bg-light-blue">$1</span>' : '$1')
    .replace(new RegExp('\\n', 'g'), '\n<br />')
    ;
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchFilter: '',
      collapsedRules: ['Normalize.css', 'Border box box-sizing', 'Keep images inside parent', 'Aspect ratios', 'Code', 'Hover+focus skins / text colors', 'Hover+focus background colors', 'Tables'],
      // showMatchesMode: 'withContext', // 'onlyMatches', 'complete'
    };
  }
  render() {
    const { searchFilter, collapsedRules } = this.state;

    const rules = searchFilter
      ? particleEmitterWrapper.filteredRules(searchFilter)
      : particleEmitterWrapper.rules;

    const results = [];

    rules.forEach(([ ruleGroup, ruleCss ]) => {
      let previousClass;
      let currentGroup;
      const htmlGroups = [];
      results.push([ruleGroup, htmlGroups]);
      ruleCss.forEach(([theClass, theRule]) => {
        if (previousClass !== theClass) {
          if (currentGroup) {
            htmlGroups.push([previousClass, currentGroup]);
          }
          currentGroup = [];
          previousClass = theClass;
        }
        currentGroup.push(theRule);
      });
      htmlGroups.push([previousClass, currentGroup]);
    });

    return (
      <div className="bg-white flex flex-column h-100">
        <div className="pa2 bg-gray">
          <div className="pl3 dib">
            <div className="pa2 white">
              Filter:
            </div>
          </div>
          <div className="bg-white dib">
            <input className="pa2 w5 outline-0 b--none bw0" type="text" defaultValue={ searchFilter } onChange={ e => this.setState({ searchFilter: e.target.value.replace(new RegExp('([^a-zA-Z0-9]+)', 'g'), '\\$1') }) } />
          </div>
          <div className="white dib pa2 pl4">
            Responsive variations:
          </div>
          <div className="dib">
            <div
              className="pa2 pointer br2 bg-near-white hover-bg-washed-green"
              onClick={() => particleEmitterWrapper.setIncludeMediaQueryRules(!particleEmitterWrapper.includeMediaQueryRules)}>
              { particleEmitterWrapper.includeMediaQueryRules ? 'Hide' : 'Show' }
            </div>
          </div>
          <div className="dib pa2 fr">
            <a className="white no-underline" href="https://github.com/hamzakubba/particle-emitter-viewer/">Source</a>
          </div>
        </div>
        <div className="overflow-auto">
          <div className="pl4 pv3 f6">
            CSS below is a close approximation of
            { ' ' }
            <a className="green no-underline" href="http://tachyons.io/">Tachyons v4.11.2</a>
            { ' ' }
            CSS, generated using
            { ' ' }
            <a className="green no-underline" href="https://github.com/hamzakubba/particle-emitter/">particle-emitter</a>.
            { ' ' }
            This app's source is available:
            { ' ' }
            <a className="green no-underline" href="https://github.com/hamzakubba/particle-emitter-viewer/">particle-emitter-viewer</a>.
          </div>
          {
            results.map(([ ruleName, htmlGroups ]) => {

              const isCollapsed = (collapsedRules.indexOf(ruleName) > -1);
              const expandGroup = () => {
                collapsedRules.splice(collapsedRules.indexOf(ruleName), 1);
                this.forceUpdate();
              };
              const collapseGroup = () => {
                collapsedRules.push(ruleName);
                this.forceUpdate();
              };
              const onClickGroup = isCollapsed ? expandGroup : collapseGroup;

              let ruleCount = 0;
              htmlGroups.forEach(([ , theGroup ]) =>
                theGroup.forEach(theRule => theRule && theRule !== particleEmitterWrapper.responsiveAvailableText && ruleCount++));

              const formatRules = ruleGroup => format(ruleGroup.join('\n'), searchFilter);

              return (
                <div key={ ruleName }>
                  <div className="pl4 b f2 pv4 b--black bt pointer" onClick={ () => onClickGroup() }>
                    { ruleName } ({ ruleCount })
                    <div className="dib w2 h2 ml3 relative">
                      <div style={{ transition: 'transform .2s' }} className={ 'absolute top-0 left-0 ' + (isCollapsed ? '' : 'rotate-90') }>▶</div>
                    </div>
                  </div>
                  {
                    !isCollapsed
                    && (
                      <div>
                        {
                          htmlGroups.map(([ theClass, ruleGroup ], hgIndex) => (

                            theClass
                              ? (
                                <div className="flex mb2 hover-bg-washed-green" key={ ruleName+hgIndex }>
                                  <div className={ 'pa1 pl6 w-20 ' } style={{ minWidth: '24rem' }}>
                                    <code className="pa1" dangerouslySetInnerHTML={{ __html: format((theClass || ''), searchFilter) }} />
                                  </div>
                                  <div className={ 'pa1 w-80' }>
                                    { theClass && '{ ' }
                                    <code className="mb1 pa1" dangerouslySetInnerHTML={{ __html: formatRules(ruleGroup) }} />
                                    { theClass && ' }' }
                                  </div>
                                </div>
                              ) : (
                                <div className="flex mb2" key={ ruleName+hgIndex }>
                                  <div className={ 'pa1 pl6 w-100' }>
                                    <code className="mb1 pa1" dangerouslySetInnerHTML={{ __html: formatRules(ruleGroup) }} />
                                  </div>
                                </div>
                              )

                          ))
                        }
                      </div>
                    )
                  }
                </div>
              );

            })
          }
          {
            !results.length
            && (
              <div className="pl4 pv4 f3">
                No matches found.
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default observer(App);
