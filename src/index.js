import React from 'react';
import ReactDOM from 'react-dom';
import {CookiesProvider} from 'react-cookie';
import {BrowserRouter} from 'react-router-dom';
import App from './app';
import Store from './middlewares/store'


ReactDOM.render(
    <CookiesProvider>
        <BrowserRouter>
            <App store={Store}/>
        </BrowserRouter>
    </CookiesProvider>
    , document.getElementById('root'));

