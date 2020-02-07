import React from "react";
import { Component } from "react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import LoginScreen from "./components/login-screen/login-screen";
import MainScreen from "./components/main-screen/main-screen";
import ChatScreen from "./components/chat-screen/chat-screen";
import SettingsScreen from "./components/settings-screen/settings-screen";
import { links, headers } from "./middlewares/config";

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;

    this.state = {
      loggedin: cookies.get("user") ? true : false,
      user: cookies.get("user") || false
    };
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
    this.cookiesRemover = this.cookiesRemover.bind(this);
  }

  logIn(user) {
    const { cookies } = this.props;
    let expire = new Date();
    expire.setFullYear(expire.getFullYear() + 1);

    this.setState({
      loggedin: true,
      user: user
    });
    cookies.set("user", user, { patch: "/", expires: expire });
  }

  cookiesRemover() {
    const { cookies } = this.props;
    cookies.remove("user");
  }

  logOut() {
    this.cookiesRemover();
    fetch(`${links.api}/logout`, {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers,
      body: `user=${this.state.user}`
    }).then(() => {
      this.setState({
        loggedin: false,
        user: false
      });
      this.props.history.push("/login");
    });
  }

  render() {
    return (
      <Switch>
        <Route
          exact
          path="/login"
          component={() => (
            <LoginScreen
              login={this.logIn}
              history={this.props.history}
              cookiesremover={this.cookiesRemover}
            />
          )}
        />
        <Route
          exact
          path="/"
          component={() => (
            <MainScreen
              user={this.state.user}
              history={this.props.history}
              logout={this.logOut}
            />
          )}
        />
        <Route
          path="/chat"
          component={() => (
            <ChatScreen user={this.state.user} history={this.props.history} />
          )}
        />
        <Route
          path="/settings"
          component={() => (
            <SettingsScreen
              user={this.state.user}
              history={this.props.history}
              logout={this.logOut}
            />
          )}
        />
        {!this.state.loggedin ? (
          <Redirect from="/" to="/login" />
        ) : (
          <Redirect from="/" to={this.props.history.location.pathname} />
        )}
      </Switch>
    );
  }
}

export default withCookies(withRouter(App));
