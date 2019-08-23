import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import './login-screen.css';
import Logger from './../../logger';
//import Styled from 'styled-components';



class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            register: false,
            registerScreen: false,
            loginForm: {
                email: '',
                password: ''
            },
            registerForm: {
                email: '',
                password: {
                    first: '',
                    second: ''
                },
                name: '',
                surname: ''
            }
        }

        this.enableFormLogin = this.enableFormLogin.bind(this);
        this.enableRegisterLogin = this.enableRegisterLogin.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.formLoginEmailHandler = this.formLoginEmailHandler.bind(this);
        this.formLoginPwHandler = this.formLoginPwHandler.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.formRegisterEmailHandler = this.formRegisterEmailHandler.bind(this);
        this.formRegisterFirstPwHandler = this.formRegisterFirstPwHandler.bind(this);
        this.formRegisterSecondPwHandler = this.formRegisterSecondPwHandler.bind(this);
        this.formRegisterNameHandler = this.formRegisterNameHandler.bind(this);
        this.formRegisterSurnameHandler = this.formRegisterSurnameHandler.bind(this);
    }

    
    enableFormLogin = (event) => {
        this.setState({
            registerScreen: false
        });
    }
    enableRegisterLogin = (event) => {
        this.setState({
            registerScreen: true
        });
    }


    handleLogin = (event) => {
        event.preventDefault();
        Logger.login(() => this.props.login(this.state.loginForm.email));
        this.props.history.push('/');
    }

    formLoginEmailHandler = (event) => {
        this.setState({
            loginForm: {
                email: event.target.value,
                password: this.state.loginForm.password
            }
        });
    }

    formLoginPwHandler = (event) => {
        this.setState({
            loginForm: {
                email: this.state.loginForm.email,
                password: event.target.value
            }
        });
    }

    handleRegister(event) {
        event.preventDefault();
    }

    formRegisterEmailHandler = (event) => {
        this.setState({
            registerForm: {
                email: event.target.value,
                password: this.state.registerForm.password,
                name: this.state.registerForm.name,
                surname: this.state.registerForm.surname
            }
        });
    }

    formRegisterFirstPwHandler = (event) => {
        this.setState({
            registerForm: {
                email: this.state.registerForm.email,
                password: {
                    first: event.target.value,
                    second: this.state.registerForm.password.second
                },
                name: this.state.registerForm.name,
                surname: this.state.registerForm.surname
            }
        });
    }

    formRegisterSecondPwHandler = (event) => {
        this.setState({
            registerForm: {
                email: this.state.registerForm.email,
                password: {
                    first: this.state.registerForm.password.first,
                    second: event.target.value
                },
                name: this.state.registerForm.name,
                surname: this.state.registerForm.surname
            }
        });
    }

    formRegisterNameHandler = (event) => {
        this.setState({
            registerForm: {
                email: this.state.registerForm.email,
                password: this.state.registerForm.password,
                name: event.target.value,
                surname: this.state.registerForm.surname
            }
        });
    }
    
    formRegisterSurnameHandler = (event) => {
        this.setState({
            registerForm: {
                email: this.state.registerForm.email,
                password: this.state.registerForm.password,
                name: this.state.registerForm.name,
                surname: event.target.value
            }
        });
    }

    render() {
        return(
            <div className="login-screen">
                <header>
                    @rusio chat app
                </header>
                <div className="buttons">
                    <button onClick={this.enableFormLogin} className="btn-mode btn-left">Login</button>
                    <button onClick={this.enableRegisterLogin} className="btn-mode btn-right">Register</button>
                </div>
                <div className="forms"> 
                    {
                        (this.state.registerScreen)? 
                        <FormRegister 
                            values={this.state.registerForm}
                            formRegisterEmailHandler = {this.formRegisterEmailHandler}
                            formRegisterFirstPwHandler = {this.formRegisterFirstPwHandler}
                            formRegisterSecondPwHandler = {this.formRegisterSecondPwHandler}
                            formRegisterNameHandler = {this.formRegisterNameHandler}
                            formRegisterSurnameHandler = {this.formRegisterSurnameHandler}
                            handleRegister = {this.handleRegister}
                        />
                        :
                        <FormLogin 
                            values={this.state.loginForm}
                            formLoginEmailHandler = {this.formLoginEmailHandler}
                            formLoginPwHandler = {this.formLoginPwHandler}
                            handleLogin = {this.handleLogin}
                        /> 
                    }           
                </div>
                <footer>
                    Designed by Mateusz Rusak
                </footer>
            </div>
        );
    };
}

const FormLogin = (props) => {
    return (
        <form onSubmit={props.handleLogin}>
            <input onChange={props.formLoginEmailHandler} className="input-field" value={props.values.email} placeholder="Email"/>
            <input type="password" onChange={props.formLoginPwHandler} className="input-field" defaultValue={props.values.password} placeholder="Password"/>
            <br/>
            <input type="submit" value="Login!" className="btn-submit" />
        </form>        
    );
}

const FormRegister = (props) => {
    return (
        <form onSubmit={props.handleRegister}>
            <input onChange={props.formRegisterEmailHandler} className="input-field" value={props.values.email} placeholder="Email"/>
            <input type="password" onChange={props.formRegisterFirstPwHandler} className="input-field" value={props.values.password.first} placeholder="Password" />
            <input type="password" onChange={props.formRegisterSecondPwHandler} className="input-field" value={props.values.password.second} placeholder="Repeat password" />
            <input onChange={props.formRegisterNameHandler} className="input-field" value={props.values.name} placeholder="Name"/>
            <input onChange={props.formRegisterSurnameHandler} className="input-field" value={props.values.surname} placeholder="Surname"/>
            <br/>
            <button type="submit" className="btn-submit">Register!</button>
        </form>
    );
}

export default withRouter(LoginScreen);