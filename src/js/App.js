/** @jsx React.DOM */

require('es6-shim');

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var Colors = require('./Colors');
var LabelStore = require('./LabelStore');
var MessageStore = require('./MessageStore');
var React = require('react');
var Scroller = require('./Scroller');
var SearchBox = require('./SearchBox');
var StoreToStateMixin = require('./StoreToStateMixin');
var StyleMixin = require('./StyleMixin');
var ThreadActions = require('./ThreadActions');
var ThreadStore = require('./ThreadStore');
var ThreadView = require('./ThreadView');
var _ = require('lodash');
var asap = require('asap');
var moment = require('moment');

var PureRenderMixin = React.addons.PureRenderMixin;

var PAGE_SIZE = 20;

moment.locale('en', {
  calendar : {
    lastDay : 'MMM D',
    sameDay : 'LT',
    nextDay : 'MMM D',
    lastWeek : 'MMM D',
    nextWeek : 'MMM D',
    sameElse : 'L'
  }
});

// Expose React for the dev tools
window.React = React;

var App = React.createClass({
  mixins: [
    PureRenderMixin,
    StoreToStateMixin({
      labels: {
        method: LabelStore.getLabels,
      },
      threads: {
        method: ThreadStore.list,
        getOptions: (props, state) => ({
          query: state.query,
          maxResultCount: state.maxResultCount,
        }),
      },
      lastMessages: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => {
          var messageIDs = state.threads.result && state.threads.result.items.map(
            thread => _.last(thread.messageIDs)
          );
          return {ids: messageIDs};
        },
        shouldFetch: options => !!options.ids,
      },
    }),
    StyleMixin({
      app: {
        paddingTop: '20px',
      },

      logo: {
        color: Colors.accent,
        float: 'left',
        fontSize: '24px',
        fontWeight: 'bold',
        lineHeight: '32px',
        margin: '0 12px',
      },

      search: {
        float: 'left',
        marginLeft: '12px',
      },

      refresh: {
        float: 'left',
        marginLeft: '12px',
      },

      loginOverlay: {
        background: 'rgba(255, 255, 255, .9)',
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      },

      loginDialog: {
        background: 'white',
        boxShadow: '0 0 20px 0 rgba(0, 0, 0, .5)',
        left: '50%',
        padding: '40px',
        position: 'absolute',
        textAlign: 'center',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
      },

      loginTitle: {
        color: Colors.accent,
        fontSize: '24px',
        marginBottom: '24px',
      },

      loginDescription: {
        marginBottom: '24px',
      },

      messages: {
        bottom: 0,
        display: 'flex',
        left: 0,
        position: 'absolute',
        right: 0,
        top: '73px',
      },

      messagesList: {
        flex: 1,
        minWidth: '300px',
        maxWidth: '400px',
        // overflow: 'auto',
      },

      threadView: {
        flex: 2,
      },

      spinner: {
        left: 0,
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 10000,

        ':after': {
          animation: 'pulse 3s ease 0s infinite',
          background: Colors.accent,
          content: ' ',
          display: 'block',
          height: '4px',
          margin: '0 auto',
        },
      },
    })
  ],

  componentDidMount() {
    this._subscriptions = [];
    this._subscriptions.push(API.subscribe('start', () => {
      if (!this.state.isLoading) {
        asap(() => this.setState({isLoading: true}));
      }
    }));
    this._subscriptions.push(API.subscribe('allStopped', () => {
      // run outside of this context in case the api call was synchronous
      asap(() => this.setState({isLoading: false}));
    }));
    this._subscriptions.push(API.subscribe('isAuthorized', isAuthorized => {
      this.setState({isAuthorizing: false, isAuthorized});
    }));
  },

  componentWillUnmount() {
    this._subscriptions.forEach(s => s.remove());
  },

  getInitialState() {
    return {
      isAuthorizing: true,
      isAuthorized: false,
      isLoading: true,
      maxResultCount: PAGE_SIZE,
      query: 'in:inbox',
      queryProgress: 'in:inbox',
      selectedMessageID: null,
    };
  },

  _onRequestMoreItems() {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  },

  _onMessageSelected(message) {
    ThreadActions.markAsRead(message.threadID);

    this.setState({
      selectedMessageID: message.id,
      selectedThreadID: message.threadID,
    });
  },

  _onQueryChange(query) {
    this.setState({
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  _onQuerySubmit(query) {
    this.setState({
      query: query,
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  _onLoginClick() {
    API.login();
  },

  _onThreadClosed() {
    var messages = this.state.lastMessages.result;

    var selectedMessageIndex = messages.findIndex(
      msg => msg.id === this.state.selectedMessageID
    );

    if (selectedMessageIndex < 0 || selectedMessageIndex === messages.length) {
      this.setState({selectedMessageID: null, selectedThreadID: null});
    } else {
      this._onMessageSelected(messages[selectedMessageIndex + 1]);
    }
  },

  _onRefresh() {
    ThreadActions.refresh();
  },

  _onLogoClick() {
    window.location.reload();
  },

  render() {
    var selectedThread = this.state.selectedThreadID && _.find(
      this.state.threads.result.items,
      {id: this.state.selectedThreadID}
    );
    return (
      <div className={this.styles.app}>
        {this.state.isLoading && <div className={this.styles.spinner} />}
        <div className={this.styles.header}>
          <span className={this.styles.logo} onClick={this._onLogoClick}>
            ☢ NUCLEARMAIL
          </span>
          <SearchBox
            className={this.styles.search}
            query={this.state.queryProgress}
            onQueryChange={this._onQueryChange}
            onQuerySubmit={this._onQuerySubmit}
          />
          <button className={this.styles.refresh} onClick={this._onRefresh}>
          ⟳
          </button>
        </div>
        <div className={this.styles.messages}>
          {this.state.lastMessages.result ? (
            <Scroller
              className={this.styles.messagesList}
              hasMore={this.state.threads.result.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}>
              <BlockMessageList
                labels={this.state.labels.result}
                messages={this.state.lastMessages.result}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.state.selectedMessageID}
              />
            </Scroller>
          ) : (
            <div className={this.styles.messagesList} />
          )}
          <div className={this.styles.threadView}>
            {selectedThread ? (
              <ThreadView
                thread={selectedThread}
                selectedMessageID={this.state.selectedMessageID}
                onThreadClosed={this._onThreadClosed}
              />
            ) : null}
          </div>
        </div>
        {(!this.state.isAuthorizing && !this.state.isAuthorized) ? (
          <div className={this.styles.loginOverlay}>
            <div className={this.styles.loginDialog}>
              <h1 className={this.styles.loginTitle}>
                ☢ NUCLEARMAIL
              </h1>
              <p className={this.styles.loginDescription}>
                NuclearMail is an experiment of writing a webmail client using React and the Flux architecture. It runs completely in the browser and uses the Gmail REST API.
              </p>
              <button onClick={this._onLoginClick}>
                Login with Google
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);

