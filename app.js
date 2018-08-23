import {html} from './lib/html.js';
import {RJElement} from './lib/elements.js';

customElements.define('rj-tabs', class extends RJElement {
  getStyle() {
    return `
      <style>
      .rj-tabs {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
      }
      
      .rj-tabs-tab {
          border-bottom: 2px solid transparent;
          color: #888;
          display: block;
          flex: 1;
          padding: 12px;
          text-align: center;
          text-decoration: none;
          text-transform: uppercase;
          transition: all 0.3s;
      }
      
      .rj-tabs-tab[data-is-active="true"] {
          border-color: #f03232;
          color: #f03232;
      }
      </style>
    `;
  }

  render() {
    return html(
      'div',
      {
        class: 'rj-tabs'
      },
      () => this.props.tabs.map((tab) => {
        return html(
          'div',
          {
            class: 'rj-tabs-tab',
            'data-is-active': () => this.props.activeTab === tab,
            'on-click': () => this.props.onSetTab(tab)
          },
          tab
        );
      })
    )(this);
  }
});

customElements.define('rj-contents', class extends RJElement {
  getStyle() {
    return `
      <style>
      .rj-contents {
          overflow: hidden;
      }
      
      .rj-contents-inner {
          display: flex;
          transition: all 0.3s;
          width: 200%;
      }
      
      .rj-contents[data-active-tab="0"] .rj-contents-inner {
          transform: translateX(0);
      }
      
      .rj-contents[data-active-tab="1"] .rj-contents-inner {
          transform: translateX(-50%);
      }
      
      .rj-contents[data-active-tab="0"] [data-tab="0"],
      .rj-contents[data-active-tab="1"] [data-tab="1"] {
          height: 0;
      }
      
      .rj-contents-tab {
          flex: 1;
          padding: 20px;
          text-transform: capitalize;
      }
      </style>
    `;
  }

  render() {
    return html(
      'div',
      {
        class: 'rj-contents',
        'data-active-tab': () => this.props.tabs.indexOf(this.props.activeTab)
      },
      [

        html(
          'div',
          {
            class: 'rj-contents-inner'
          },
          () => this.props.tabs.map((tab) => {
            return html(
              'div',
              {
                class: 'rj-contents-tab',
                'data-tab': this.props.tabs.indexOf(tab),
              },
              `${tab} content`
            );
          })
        )

      ]
    )(this);
  }
});

customElements.define('rj-app', class extends RJElement {
  constructor() {
    super();

    this.props.activeTab = 'valid';
    this.props.tabs = ['valid', 'expired'];
  }

  render() {
    return html(
      'div',
      {
        class: 'rj-app'
      },
      [

        html(
          'rj-tabs',
          {
            'props-activeTab': () => this.props.activeTab,
            'props-onSetTab': (tab) => this.props.activeTab = tab,
            'props-tabs': () => this.props.tabs,
          }
        ),

        html(
          'rj-contents',
          {
            'props-activeTab': () => this.props.activeTab,
            'props-tabs': () => this.props.tabs,
          }
        ),

      ]
    )(this);
  }
});
