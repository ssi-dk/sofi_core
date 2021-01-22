//import "./wdyr";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Provider as ReduxQueryProvider } from "redux-query-react";
import { ConnectedRouter } from "connected-react-router";
import store, { getQueries, history } from "app/store";

function render() {
  const App = require("./app/app").default;
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <ReduxQueryProvider queriesSelector={getQueries}>
          <App />
        </ReduxQueryProvider>
      </ConnectedRouter>
    </Provider>,
    document.getElementById("root")
  );
}

render();

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./app/app", render);
}
