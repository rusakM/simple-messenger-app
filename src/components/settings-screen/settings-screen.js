import React, { Component, createRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import md5 from "md5";
import {
  faArrowLeft,
  faCogs,
  faCamera,
  faTimes,
  faTrash,
  faSave,
  faUnlockAlt,
  faDoorOpen,
  faClipboardCheck,
  faArrowRight,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import "./settings-screen.css";
//import store from "./../../middlewares/store";
import { links, headers } from "./../../middlewares/config";
import Avatar from "./../../assets/avatar.png";

//let Store = new store();

class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileErrorClasses: "alert-panel",
      photoResetBtnClasses: "hidden",
      photoDeleteBtnClasses: "",
      photoSaveBtnClasses: "hidden",
      isChangingPhoto: false,
      isDeletingPhoto: false,
      isEnabledChangePasswordButton: true,
      userData: {},
      changePasswordClasses: "hidden",
      newPasswordClasses: "hidden",
      disableAccountClasses: "hidden",
      passwordChangedPopupClasses: "hidden",
      passwordField: "",
      newPasswordField: "",
      isPasswordCorrect: true,
      isPasswordTooShort: false
    };

    this.photoRef = createRef();
    this.fileRef = createRef();
  }

  componentDidMount() {
    this.fetchUserData(this.props.user);
  }

  fetchUserData = user => {
    // let json = {
    //   email: "rusakkk@live.com",
    //   name: "Mateusz",
    //   surname: "Rusak",
    //   password: "d90cc3ca2fc880f52c662d2dac3440a0",
    //   photo: 1
    // };
    fetch(`${links.api}/fetchUserData/?userId=${user}`, {
      method: "get",
      mode: "cors",
      credentials: "same-origin",
      headers
    })
      .then(response => response.json())
      .then(userData => {
        this.setState({
          photoDeleteBtnClasses: userData.photo === 1 ? "" : "hidden",
          userData
        });
      });
  };

  closeSettings = () => {
    this.props.history.push("/");
  };

  fileHandler = event => {
    event.preventDefault();
    if (event.target.files[0].type !== "image/jpeg") {
      this.setState({
        fileErrorClasses: "alert-panel alert-panel-show",
        isChangingPhoto: false
      });
    } else {
      this.setState({
        isChangingPhoto: true,
        photoResetBtnClasses: "",
        photoSaveBtnClasses: "",
        photoDeleteBtnClasses: "hidden"
      });
      this.photoRef.current.src = URL.createObjectURL(
        this.fileRef.current.files[0]
      );
    }
  };

  openFileDialog = event => {
    event.preventDefault();
    this.fileRef.current.click();
  };

  resetPhoto = (photoLink = false) => {
    const link = `${links.cdn}/photo/${this.props.user}`;
    if (photoLink === false) {
      this.photoRef.current.src = link;
    } else {
      this.photoRef.current.src = photoLink;
    }
    this.fileRef.current.value = "";
    this.setState({
      isChangingPhoto: false,
      isDeletingPhoto: false,
      photoResetBtnClasses: "hidden",
      photoSaveBtnClasses: "hidden",
      photoDeleteBtnClasses: ""
    });
  };

  deletePhoto = () => {
    if (this.state.userData.photo === 1) {
      this.setState({
        photoSaveBtnClasses: "",
        photoResetBtnClasses: "",
        photoDeleteBtnClasses: "hidden",
        isDeletingPhoto: true,
        isChangingPhoto: false
      });
      this.photoRef.current.src = Avatar;
    }
  };

  savePhoto = () => {
    if (!this.state.isChangingPhoto && !this.state.isDeletingPhoto) {
      return;
    }
    if (this.state.isChangingPhoto) {
      let form = new FormData();
      form.append("userId", this.props.user);
      form.append("photo", this.fileRef.current.files[0]);

      fetch(`${links.cdn}/savePhoto`, {
        method: "post",
        mode: "cors",
        credentials: "same-origin",
        headers: {
          Origin: links.origin,
          Accept: headers.Accept
        },
        body: form
      }).then(() => {
        const photo = this.fileRef.current.files[0];
        this.resetPhoto(URL.createObjectURL(photo));
        let { userData } = this.state;
        userData.photo = 1;
        this.setState({
          userData,
          photoDeleteBtnClasses: ""
        });
      });
    } else if (this.state.isDeletingPhoto) {
      fetch(`${links.cdn}/deletePhoto/?userId=${this.props.user}`, {
        method: "get",
        mode: "cors",
        credentials: "same-origin",
        headers
      }).then(() => {
        this.resetPhoto(Avatar);
        const { userData } = this.state;
        userData.photo = 0;
        this.setState({
          userData,
          photoDeleteBtnClasses: "hidden"
        });
      });
    }
  };

  openPasswordChanger = () => {
    this.setState({
      changePasswordClasses: "settings-screen-popup show-settings-screen-popup"
    });
  };

  passwordChangerInputHandler = event => {
    this.setState({
      passwordField: event.target.value
    });
  };

  closePasswordChanger = () => {
    this.setState({
      changePasswordClasses: "hidden",
      passwordField: ""
    });
  };

  checkPassword = () => {
    if (md5(this.state.passwordField) === this.state.userData.password) {
      this.setState({
        isPasswordCorrect: true
      });
      this.closePasswordChanger();
      this.openNewPassword();
    } else {
      this.setState({
        isPasswordCorrect: false
      });
    }
  };

  openNewPassword = () => {
    this.setState({
      newPasswordClasses: "settings-screen-popup show-settings-screen-popup"
    });
  };

  newPasswordInputHandler = event => {
    this.setState({
      newPasswordField: event.target.value
    });
  };

  closeNewPasswordPopup = () => {
    this.setState({
      newPasswordClasses: "hidden",
      newPasswordField: ""
    });
  };

  checkNewPassword = () => {
    if (this.state.newPasswordField.length >= 8) {
      return true;
    }
    return false;
  };

  saveNewPassword = () => {
    if (!this.checkNewPassword) {
      this.setState({
        isPasswordTooShort: true
      });
    } else {
      let { userData, newPasswordField } = this.state;
      const newPass = md5(newPasswordField);
      fetch(`${links.api}/changePassword`, {
        method: "post",
        mode: "cors",
        credentials: "same-origin",
        headers,
        body: `userId=${this.props.user}&password=${newPass}`
      }).then(() => {
        userData.password = md5(newPasswordField);
        this.setState({
          userData,
          newPasswordField: ""
        });
        this.closeNewPasswordPopup();
        this.openPasswordChangedPopup();
      });
    }
  };

  openPasswordChangedPopup = () => {
    this.setState({
      passwordChangedPopupClasses:
        "settings-screen-popup show-settings-screen-popup"
    });
  };

  closePasswordChangedPopup = () => {
    this.setState({
      passwordChangedPopupClasses: "hidden"
    });
  };

  disableAccountPopupOpen = () => {
    this.setState({
      disableAccountClasses:
        "settings-screen-popup disable-account show-settings-screen-popup"
    });
  };

  disableAccountConfirm = () => {
    fetch(`${links.api}/disableAccount/?userId=${this.props.user}`, {
      methos: "post",
      mode: "cors",
      credentials: "same-origin",
      headers
    }).then(() => {
      this.props.logout();
    });
  };

  disableAccountPopupClose = () => {
    this.setState({
      disableAccountClasses: "hidden"
    });
  };

  render() {
    return (
      <div className="settings-screen">
        <header className="chat-header">
          <button className="btn-go-back" onClick={this.closeSettings}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h5>
            <FontAwesomeIcon icon={faCogs} />
            Settings
          </h5>
        </header>
        <div className="settings-container">
          <div className="photo-container">
            <img
              src={`${links.cdn}/photo/${this.props.user}`}
              className="user-photo-settings"
              ref={this.photoRef}
              alt={this.state.userData.name + " " + this.state.userData.surname}
            />
            <input
              type="file"
              ref={this.fileRef}
              hidden
              onChange={this.fileHandler}
            />
            <div className="settings-screen-buttons">
              <p className="open-file-btn" onClick={this.openFileDialog}>
                <FontAwesomeIcon icon={faCamera} />
              </p>
              <p
                className={this.state.photoResetBtnClasses}
                onClick={() => this.resetPhoto(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </p>
              <p
                onClick={this.deletePhoto}
                className={this.state.photoDeleteBtnClasses}
              >
                <FontAwesomeIcon icon={faTrash} />
              </p>
              <p
                className={this.state.photoSaveBtnClasses}
                onClick={this.savePhoto}
              >
                <FontAwesomeIcon icon={faSave} />
              </p>
            </div>
          </div>
          <div className="user-name">
            <p>{`${this.state.userData.name} ${this.state.userData.surname}`}</p>
          </div>
          <div className="settings-screen-btn">
            <p
              onClick={this.openPasswordChanger}
              className="change-password-btn"
            >
              Change password
              <FontAwesomeIcon icon={faUnlockAlt} />
            </p>
          </div>
          <div className="settings-screen-btn">
            <p
              onClick={this.disableAccountPopupOpen}
              className="disable-account-btn"
            >
              Disable account
              <FontAwesomeIcon icon={faDoorOpen} />
            </p>
          </div>
        </div>
        <ChangePassword
          classes={this.state.changePasswordClasses}
          handlepassword={this.passwordChangerInputHandler}
          password={this.state.passwordField}
          close={this.closePasswordChanger}
          check={this.checkPassword}
          iscorrect={this.state.isPasswordCorrect}
        />
        <NewPassword
          classes={this.state.newPasswordClasses}
          handlepassword={this.newPasswordInputHandler}
          password={this.state.newPasswordField}
          close={this.closeNewPasswordPopup}
          save={this.saveNewPassword}
          iscorrect={this.state.isPasswordTooShort}
        />
        <PasswordChanged
          classes={this.state.passwordChangedPopupClasses}
          close={this.closePasswordChangedPopup}
        />
        <DisableAccount
          classes={this.state.disableAccountClasses}
          disable={this.disableAccountConfirm}
          close={this.disableAccountPopupClose}
        />
      </div>
    );
  }
}

const ChangePassword = props => {
  const { classes, password, handlepassword, close, check, iscorrect } = props;
  let incorrectPasswordClasses = "incorrect-password hidden";
  if (!iscorrect) {
    incorrectPasswordClasses = "incorrect-password";
  }

  return (
    <aside className={classes}>
      <div className="popup-content">
        <p className="popup-icon">
          <FontAwesomeIcon icon={faUnlockAlt} />
        </p>
        <div>
          <p className="popup-header">Enter your current password</p>
          <IncorrectPassword classes={incorrectPasswordClasses} />
          <input
            type="password"
            className="input-field password"
            value={password}
            onChange={handlepassword}
            autoComplete="off"
            name="pass"
          />
        </div>
      </div>
      <p className="popup-ok-btn" onClick={check}>
        Next <FontAwesomeIcon icon={faArrowRight} />
      </p>
      <p className="popup-close-btn" onClick={close}>
        <FontAwesomeIcon icon={faTimes} />
      </p>
    </aside>
  );
};

const NewPassword = props => {
  const { classes, handlepassword, close, save, iscorrect, password } = props;

  let isPasswordTooShortClasses = "incorrect-password hidden";
  if (iscorrect) {
    isPasswordTooShortClasses = "incorrect-pasword";
  }

  return (
    <aside className={classes}>
      <div className="popup-content">
        <p className="popup-icon">
          <FontAwesomeIcon icon={faClipboardCheck} />
        </p>
        <div>
          <p className="popup-header">Enter new password</p>
          <PasswordTooShort classes={isPasswordTooShortClasses} />
          <input
            type="password"
            className="input-field password"
            onChange={handlepassword}
            value={password}
          />
        </div>
      </div>
      <p className="popup-ok-btn" onClick={save}>
        Confirm
      </p>
      <p onClick={close} className="popup-close-btn">
        <FontAwesomeIcon icon={faTimes} />
      </p>
    </aside>
  );
};

const PasswordChanged = props => {
  const { classes, close } = props;

  return (
    <aside className={classes}>
      <div className="popup-content">
        <p className="popup-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </p>
        <p className="popup-header">Password changed!</p>
      </div>
      <p onClick={close} className="popup-ok-btn">
        Confirm
      </p>
    </aside>
  );
};

const DisableAccount = props => {
  const { classes, disable, close } = props;

  return (
    <aside className={classes}>
      <div className="popup-content">
        <p className="popup-icon icon-disable">
          <FontAwesomeIcon icon={faDoorOpen} />
        </p>
        <div className="popup-header">
          Are you sure to disable your account?
        </div>
      </div>
      <div className="popup-buttons">
        <p className="popup-ok-btn btn-disable" onClick={disable}>
          Yes
        </p>
        <p className="popup-ok-btn" onClick={close}>
          No
        </p>
      </div>
    </aside>
  );
};

const IncorrectPassword = props => {
  return (
    <p className={props.classes}>Given password is incorrect, try again</p>
  );
};

const PasswordTooShort = props => {
  return (
    <p className={props.classes}>
      Your password must be at least 8 characters long
    </p>
  );
};

export default SettingsScreen;
