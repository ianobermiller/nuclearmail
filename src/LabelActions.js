const ActionType = require('./ActionType');
const LabelAPI = require('./LabelAPI');

export function loadAll() {
  return dispatch => {
    dispatch({type: ActionType.Label.LOAD_ALL_REQUEST});

    LabelAPI.list().then(labels => {
      dispatch({
        type: ActionType.Label.LOAD_ALL_SUCCESS,
        labels: labels,
      });
    }).catch(() => {
      dispatch({
        type: ActionType.Label.LOAD_ALL_FAILURE,
      });
    });
  };
};
