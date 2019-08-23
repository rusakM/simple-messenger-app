import React from 'react';
import {Component} from 'react';
import {instanceOf} from 'prop-types';
import { withCookies, Cookies} from 'react-cookie';
import { Route, Switch, Redirect} from 'react-router-dom';
import LoginScreen from './components/login-screen/login-screen';

import './styles.css';


class App extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const { cookies } = props;

        this.state = {
            loggedin: false,
            user: cookies.get('user') || false
        }
        this.logIn = this.logIn.bind(this);
    }

    logIn(user) {
        const { cookies } = this.props;
        let expire = new Date();
        expire.setFullYear(expire.getFullYear() + 1);

        this.setState({
            loggedin: true,
            user: user
        });
        cookies.set('user', user, {patch: '/', expires: expire});
    }

    logOut() {
        const { cookies } = this.props;
        cookies.remove('user');
        this.setState({
            loggedin: false,
            user: false
        });
    }
    

    render() {
        return( 
            <Switch>
                <Route exact path='/login' component={(history) => <LoginScreen login={this.logIn} history={history}/>} />
                
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

export default withCookies(App);