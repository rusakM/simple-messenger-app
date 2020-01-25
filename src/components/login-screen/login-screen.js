import React, { Component } from 'react';
import './login-screen.css';
import Logger from '../../middlewares/logger';
import { headers, links } from './../../middlewares/config';




class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
                surname: '',
            },
            loginStatus: 0,
            alertPanel: {
                classes: 'alert-panel',
                message: ''
            },
            buttons: {
                left: 'btn-mode btn-left btn-active',
                right: 'btn-mode btn-right'
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
        this.alertClose = this.alertClose.bind(this);
    }

    
    enableFormLogin = (event) => {
        this.setState({
            registerScreen: false,
            buttons: {
                left: 'btn-mode btn-left btn-active',
                right: 'btn-mode btn-right'
            }
        });
    }
    enableRegisterLogin = (event) => {
        this.setState({
            registerScreen: true,
            buttons: {
                left: 'btn-mode btn-left',
                right: 'btn-mode btn-right btn-active'
            }
        });
    }


    handleLogin = (event) => {
        event.preventDefault();
        let {email, password} = this.state.loginForm;

        fetch(`${links.api}/login`, {
            method: 'POST',
            mode: "cors",
            credentials: "same-origin",
            headers,
            body: `email=${email}&password=${password}`
        }).then(response => response.json())
        .then(json => {
            switch(parseInt(json.loginStatus)) {
                case -1:
                    this.setState({
                        alertPanel: {
                            classes: 'alert-panel alert-panel-show',
                            message: 'Incorrect login or password. Try again'
                        }
                    });
                    break;
                case 0:
                    this.setState({
                        alertPanel: {
                            classes: 'alert-panel alert-panel-show',
                            message: 'You account is not activated. Check your mailbox'
                        }
                    });
                    break;
                case 1:
                    Logger.login(() => this.props.login(json.user));
                    this.props.history.push('/');
                    break;
                default:
                    break;
            }
        });  
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
        if(this.state.registerForm.password.first !== this.state.registerForm.password.second) {
            this.setState({
                alertPanel: {
                    classes: 'alert-panel alert-panel-show',
                    message: 'Please type passwords again'
                }
            });
            return;
        }
        if(this.state.registerForm.password.first.length < 8) {
            this.setState({
                alertPanel: {
                    classes: 'alert-panel alert-panel-show',
                    message: 'Your password must be at least 8 characters long'
                }
            });
        }
        let {email, password, name, surname} = this.state.registerForm;
        fetch(`${links.api}/register`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'same-origin',
            headers,
            body: `email=${email}&password=${password.first}&name=${name}&surname=${surname}`
        }).then(response => response.json())
        .then(json => {
            switch(json.registerStatus) {
                case 0:
                    this.setState({
                        alertPanel: {
                            classes: 'alert-panel alert-panel-show',
                            message: 'An account already exists with your address email. Try again'
                        }
                    });
                    break;
                case 1:
                    this.setState({
                        alertPanel: {
                            classes: 'alert-panel alert-panel-show',
                            message: 'You will receive email message to verify your account. Check youe mailbox'
                        }
                    });
                    break;
                default:
                    break;
                }
            }
        );
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

    alertClose() {
        this.setState({
            alertPanel: {
                classes: 'alert-panel alert-panel-hide',
                message: ''
            }
        })
    }

    render() {
        return(
            <div className="login-screen">
                <header className="header-login-screen">
                    @rusio chat app
                </header>
                <div className="buttons">
                    <button onClick={this.enableFormLogin} className={this.state.buttons.left}>Login</button>
                    <button onClick={this.enableRegisterLogin} className={this.state.buttons.right}>Register</button>
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
                <AlertPanel 
                    classes={this.state.alertPanel.classes}
                    close={this.alertClose}
                    message={this.state.alertPanel.message}
                /> 
                <footer className="footer-login-screen">
                    Designed by Mateusz Rusak
                </footer>
            </div>
        );
    };
}

const FormLogin = (props) => {
    return (
        <form onSubmit={props.handleLogin}>
            <input onChange={props.formLoginEmailHandler} className="input-field" value={props.values.email} placeholder="Email" required/>
            <input type="password" onChange={props.formLoginPwHandler} className="input-field" defaultValue={props.values.password} placeholder="Password" required/>
            <br/>
            <input type="submit" value="Login!" className="btn-submit" />
        </form>        
    );
}

const FormRegister = (props) => {
    return (
        <form onSubmit={props.handleRegister}>
            <input onChange={props.formRegisterEmailHandler} className="input-field" value={props.values.email} placeholder="Email" required/>
            <input type="password" onChange={props.formRegisterFirstPwHandler} className="input-field" value={props.values.password.first} placeholder="Password" required/>
            <input type="password" onChange={props.formRegisterSecondPwHandler} className="input-field" value={props.values.password.second} placeholder="Repeat password" required/>
            <input onChange={props.formRegisterNameHandler} className="input-field" value={props.values.name} placeholder="Name" required/>
            <input onChange={props.formRegisterSurnameHandler} className="input-field" value={props.values.surname} placeholder="Surname" required/>
            <br/>
            <button type="submit" className="btn-submit">Register!</button>
        </form>
    );
}

const AlertPanel = (props) => {
    return (
        <aside className={props.classes}>
            <p className="message">{props.message}</p>
            <button onClick={props.close} className="btn-submit btn-confirm">Ok</button>
        </aside>
    );
}

export default LoginScreen;