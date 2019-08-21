import React from 'react';
import ReactDOM from 'react-dom';
import {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import LoginScreen from './components/login-screen/login-screen';

import './styles.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedin: false
        }
    }

    render() {
        return( 
            <Route exact path='/login' component={LoginScreen} />
        );

    }
}

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));

