import React from 'react';
import ReactDOM from 'react-dom';
import {Component} from 'react';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import LoginScreen from './components/login-screen/login-screen';

import './styles.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedin: true
        }
        this.loggedinChange = this.loggedinChange.bind(this);
    }

    loggedinChange() {
        this.setState({
            loggedin: !this.state.loggedin
        });
    }
    

    render() {
        return( 
            <Switch>
                <Route exact path='/login' component={(history) => <LoginScreen loggedinChange={this.loggedinChange} history={history}/>} />

                {
                    (!this.state.loggedin) ?
                        <Redirect from='/' to='/login' />
                        :
                        <Redirect from='/' to='/' />
                }
            </Switch>

        );

    }
}

ReactDOM.render(<BrowserRouter><App /></BrowserRouter>, document.getElementById('root'));

