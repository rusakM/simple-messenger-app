import React, { Component } from 'react';
import './login-screen.css';


class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            screen: 0,
            login: '',
            password: ''
        }
        this.toggleMode = this.toggleMode.bind(this);
    }

    toggleMode(event) {

    }

    render() {
        return(
            <div className="login-screen">
                <header>
                    @rusio chat app
                </header>
                <div className="buttons">
                    <button onClick={this.toggleMode} className="btn-mode">Login</button>
                    <button onClick={this.toggleMode} className="btn-mode">Register</button>
                </div>
                <div className="forms">
                    <form action="" onSubmit={this.props.loggerService}>
                        <input type="text" onChange={this.loginHandler} className="input-field" value={this.state.login} />
                        <input type="password" onChange={this.pwHandler} className="input-field" value={this.state.password} />
                        <input type="submit" value="Login!" className="btn-submit" />
                    </form>
                </div>
                
            </div>
        );
    };
}

export default LoginScreen;