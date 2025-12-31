import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import StoreContext from './contexts/storeContext'
import store from './store';
import * as serviceWorker from './serviceWorker';

import 'antd/dist/reset.css';
import './assets/style/varibles.css';
import './assets/style/index.css';
import './assets/style/App.css';

ReactDOM.render(
    <StoreContext.Provider value={store}>
        <App />
    </StoreContext.Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();