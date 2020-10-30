import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as storage from 'src/utils/storage';
import App from './App';
import {store} from './models';
import {getLoginUser} from './utils/userAuth';
import 'antd/dist/antd.css';
import './index.css';
import './mobile.css';

import reportWebVitals from './reportWebVitals';


// // dev 模式开启mock
// if (process.env.NODE_ENV === 'development' || process.env.MOCK === 'true') {
//     require('./mock/index');
//     console.log('current mode is development, mock is enabled');
// }

const currentUser = getLoginUser() || {};

// 存储初始化 区分不同用户存储的数据
storage.init({
    keyPrefix: currentUser.id,
});

ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
