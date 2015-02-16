/** @flow */

var API = require('./API');
var BlockMessageList = require('./BlockMessageList');
var Button = require('./Button');
var Colors = require('./Colors');
var InteractiveStyleMixin = require('./InteractiveStyleMixin');
var KeybindingMixin = require('./KeybindingMixin');
var LabelStore = require('./LabelStore');
var LoginModal = require('./LoginModal');
var MessageActions = require('./MessageActions');
var MessageStore = require('./MessageStore');
var Nav = require('./Nav');
var React = require('react/addons');
var Scroller = require('./Scroller');
var SearchBox = require('./SearchBox');
var Spinner = require('./Spinner');
var DependentStateMixin = require('./DependentStateMixin');
var ThreadActions = require('./ThreadActions');
var ThreadStore = require('./ThreadStore');
var ThreadView = require('./ThreadView');
var _ = require('lodash');
var asap = require('asap');
var Router = require('react-router');

var PropTypes = React.PropTypes;
var PureRenderMixin = React.addons.PureRenderMixin;
var RouteHandler = Router.RouteHandler;

var PAGE_SIZE = 20;

var dummySubscription = {remove() {}};

var App = React.createClass({
  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [
    PureRenderMixin,
    KeybindingMixin,
    DependentStateMixin({
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
      lastMessageInEachThread: {
        method: MessageStore.getByIDs,
        getOptions: (props, state) => {
          var messageIDs = state.threads && state.threads.items.map(
            thread => _.last(thread.messageIDs)
          );
          return {ids: messageIDs};
        },
        shouldFetch: options => !!options.ids,
      },
      selectedThread: {
        method: ThreadStore.getByID,
        getOptions: (props, state) => {
          return {id: props.params.threadID};
        },
        shouldFetch: options => !!options.id,
      },
    }),
    InteractiveStyleMixin({
      logo: ['matchMedia'],
    }),
  ],

  _subscriptions: [dummySubscription],

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

    this.bindKey('k', this._selectNextMessage);
    this.bindKey('j', this._selectPreviousMessage);
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
    };
  },

  _onRequestMoreItems() {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  },

  _onMessageSelected(message: ?Object) {
    if (message && message.isUnread) {
      ThreadActions.markAsRead(message.threadID);
    }
    MessageActions.select(message);
  },

  _onQueryChange(query: string) {
    this.setState({
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  _onQuerySubmit(query: string) {
    this.setState({
      query: query,
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  },

  _selectNextMessage() {
    this._onMessageSelected(this._getNextMessage());
  },

  _getNextMessage(): ?Object {
    var messages = this.state.lastMessageInEachThread;
    if (!messages) {
      return null;
    }

    var selectedMessageIndex = this.props.params.messageID &&
      messages.findIndex(
        msg => msg.id === this.props.params.messageID
      );

    if (!this.props.params.messageID) {
      return messages[0];
    } else if (selectedMessageIndex < 0 || selectedMessageIndex === messages.length) {
      return null;
    } else {
      return messages[selectedMessageIndex + 1];
    }
  },

  _selectPreviousMessage() {
    var messages = this.state.lastMessageInEachThread;
    if (!messages) {
      return;
    }

    var selectedMessageIndex = messages.findIndex(
      msg => msg.id === this.props.params.messageID
    );

    if (!this.props.params.messageID) {
      this._onMessageSelected(messages[0]);
    } else if (selectedMessageIndex < 0 || selectedMessageIndex === 0) {
      this._onMessageSelected(null);
    } else {
      this._onMessageSelected(messages[selectedMessageIndex - 1]);
    }
  },

  _onRefresh() {
    ThreadActions.refresh();
  },

  _onLogoClick() {
    window.location.reload();
  },

  render(): any {
    var selectedThread = this.state.selectedThread;
    return (
      <div style={styles.app}>
        {this.state.isLoading ? <Spinner /> : null}
        <div style={styles.header}>
          <span style={styles.logo} onClick={this._onLogoClick}>
            ☢
            {!this.interactions.logo.matchMedia('(max-width: 800px)') ? (
              <span style={styles.logoName}>{' '}NUCLEARMAIL</span>
            ) : null}
          </span>
          <SearchBox
            style={styles.search}
            query={this.state.queryProgress}
            onQueryChange={this._onQueryChange}
            onQuerySubmit={this._onQuerySubmit}
          />
          <Button style={styles.refresh} onClick={this._onRefresh}>
          ⟳
          </Button>
        </div>
        <Nav
          onQueryChanged={this._onQuerySubmit}
          query={this.state.query}
        />
        <div style={styles.messages}>
          {this.state.threads &&
            this.state.lastMessageInEachThread ? (
            <Scroller
              style={styles.messagesList}
              hasMore={this.state.threads.hasMore}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}>
              <BlockMessageList
                labels={this.state.labels}
                messages={this.state.lastMessageInEachThread}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.props.params.messageID}
              />
              {this.state.threads.hasMore ? (
                <div style={styles.messageLoading}>
                  You{"'"}ve seen {this.state.threads.items.length}.
                  {this.state.threads.items.length >= 100 ? (
                    ' ' + _.sample(pagingMessages)
                  ) : null}
                  {' '}Loading more...
                </div>
              ) : null}
            </Scroller>
          ) : (
            <div style={styles.messagesList} />
          )}
          <div style={styles.threadView}>
            <RouteHandler
              onGoToNextMessage={this._selectNextMessage}
              params={this.props.params}
            />
          </div>
        </div>
        {(!this.state.isAuthorizing && !this.state.isAuthorized) ? (
          <LoginModal />
        ) : null}
      </div>
    );
  }
});

var styles = {
  app: {
    paddingTop: '20px',
  },

  header: {
    display: 'flex',
  },

  logo: {
    color: Colors.accent,
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    marginLeft: '12px',
  },

  logoName: {
    marginRight: '12px',
  },

  search: {
    marginLeft: '12px',
  },

  refresh: {
    marginLeft: '12px',
  },

  messages: {
    bottom: 0,
    display: 'flex',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '104px',
  },

  messagesList: {
    flex: 1,
    height: '100%',
    minWidth: '300px',
    maxWidth: '400px',
  },

  threadView: {
    flex: 2,
    height: '100%',
  },

  messageLoading: {
    textAlign: 'center',
    padding: '20px',
  },
};

var pagingMessages = [
  'Still going?',
  'Now you\'re just getting greedy.',
  '\u266b I still haven\'t found what I\'m lookin\' for. \u266b',
  'I could go on forever.',
  'Perhaps you should narrow the search term?',
  'Look at you go!',
  '\u266b This is the song that never ends \u266b',
  '\u266b Scrollin, scrollin, scrollin through the emails \u266b',
  'Really?',
  'Give up, you\'ll never find it now.',
  'I know it must be here somewhere.',
  'You can do it!',
  'Eventually you\'ll just give up.',
  'Dig dig dig!'
];

module.exports = App;
