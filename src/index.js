import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import StoreContext from './contexts/storeContext'
import store from './store';
import * as serviceWorker from './serviceWorker';
import { ConfigProvider } from 'antd';
// import 'antd/dist/antd.css';
import 'antd/dist/reset.css';
import './assets/style/index.css';
import './assets/style/App.css';

ReactDOM.render(
    <StoreContext.Provider value={store}>
        <ConfigProvider theme={{ cssVar: {
            key: 'my-app-key', // 设置一个唯一的 key
          },}}>
            <App />
        </ConfigProvider>
    </StoreContext.Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();