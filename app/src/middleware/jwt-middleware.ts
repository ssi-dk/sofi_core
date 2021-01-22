import { actionTypes } from "redux-query";
import { getAccessToken } from "auth/environment";

const { MUTATE_ASYNC, REQUEST_ASYNC } = actionTypes;

export const jwtMiddleware = (store) => (next) => (action) => {
  if (
    action &&
    (action.type === MUTATE_ASYNC || action.type === REQUEST_ASYNC)
  ) {
    // This is a redux-query action so add the JWT header
    const options = action.options || {};
    const headers = options.headers || {};
    const jwt = getAccessToken();
    const updatedAction = {
      ...action,
      options: {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${jwt}`,
        },
      },
    };

    // Let the action continue, but now with the JWT header.
    next(updatedAction);
  } else {
    // This isn't a redux-query action so just let it pass through
    next(action);
  }
};
