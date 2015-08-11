var ActionType = require('./ActionType');
var LabelAPI = require('./LabelAPI');

export function loadAll() {
  return dispatch => {
    LabelAPI.list().then(labels => {
      dispatch({
        type: ActionType.Label.LOAD_ALL_COMPLETED,
        labels: labels,
      });
    }).catch(() => {
      dispatch({
        type: ActionType.Label.LOAD_ALL_FAILED,
      });
    });
  };
};
