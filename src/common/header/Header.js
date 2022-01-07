/* react imports */
import React, { Component } from 'react';
import Modal from 'react-modal';

/* material imports */
import { makeStyles } from '@material-ui/core/styles';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelpertext from "@material-ui/core/FormHelperText";
import Snackbar from '@material-ui/core/Snackbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

/* package imports */
import axios from "axios";

/* project imports */
import "./header.scss";
import AppUtilities from "../scripts/common.js";

/* custom styles */
const modalStyles = makeStyles({
  customTabs: {
    width: "50%"
  }
});

/* app icon */
const HeaderAppIcon = () => {
  return (
    <FastfoodIcon className="appIcon" />
  );
};

/* header search */
const HeaderSearch = (props) => {
  let { searchHandler } = props;
  return (
    <Input
      onChange={(event) => { searchHandler(event.target.value); }}
      placeholder="Search by Restaurant Name"
      className="appSearch"
      startAdornment={<SearchIcon className="headerSearchIcon" />}
      fullWidth={true}
    />
  );
};

/* login form */
class LoginFormComponent extends Component {
  /* constructor */
  constructor() {
    super();
    this.state = {
      userContactNumber: "",
      userPassword: "",
      contactErrorStatus: "hide",
      passwordErrorStatus: "hide",
      apiError: "hide",
      apiMessage: "Example of some error message"
    };
  };

  /* form reset handler */
  formResetHandler() {
    this.setState({
      userContactNumber: "",
      userPassword: "",
      contactErrorStatus: "hide",
      passwordErrorStatus: "hide",
      apiError: "hide",
    });
  };

  /* hide api error */
  formHideApiError() {
    this.setState({ apiError: "hide" });
  }

  /* show api error with message */
  formShowApiError(message) {
    this.setState({ apiError: "show", apiMessage: message });
  }

  /* login form elements on change handler */
  formOnChangeHandler(event) {
    let name = event.target.name;
    let value = event.target.value;
    let $this = this;
    let { state } = $this;

    /* update */
    state[name] = value;
    this.setState({ ...state });
  };

  /* login form submit handler */
  formSubmitHandler(event) {
    event.preventDefault();
    let $this = this;
    let loginForm = { ...$this.state };
    loginForm.apiError = "hide";
    let { userContactNumber, userPassword } = loginForm;
    let formStatus = {
      contact: false,
      password: false
    };

    if (userContactNumber !== "" && AppUtilities.isValidContactNumber(userContactNumber)) {
      formStatus.contact = true;
      loginForm.contactErrorStatus = "hide";
    }
    else {
      formStatus.contact = false;
      loginForm.contactErrorStatus = "show";
    }

    if (userPassword !== "" && AppUtilities.isValidPassword(userPassword)) {
      formStatus.password = true;
      loginForm.passwordErrorStatus = "hide";
    }
    else {
      formStatus.password = false;
      loginForm.passwordErrorStatus = "show";
    }

    /* set state as needed */
    $this.setState({ ...loginForm });

    if (formStatus.contact === true && formStatus.password === true) {
      $this.props.showSnackbar("Processsing. Please Wait...", function () {
        /* jut to show a transition from 'not logged in' to 'logged in' */
        setTimeout(function () {
          let signInUrl = "http://localhost:8080/api/customer/login";
          let requestConfig = {
            url: signInUrl,
            headers: {
              authorization: "Basic " + btoa(userContactNumber + ":" + userPassword),
              'Content-Type': 'application/json;charset=UTF-8',
            },
            method: "post",
            data: {}
          };
          axios(requestConfig).then(function (response) {
            if (response.statusText === "OK" || response.status === 200) {
              $this.props.performLogin(response, function () {
                /* close the modal and perform other details */
                $this.props.modalCloser();
                $this.props.showSnackbar("Logged In Successfully!");
                setTimeout(function () {
                  $this.formResetHandler();
                }, 1500);
              });
            }
          })
            .catch(function (error) {
              console.log(error.response);
              $this.formShowApiError(error.response.data.message);
            });
        }, 2000);
      });
    }
    else {
      console.log("error");
    }
  };

  /* render */
  render() {
    let $this = this;
    return (
      <form className="loginForm" onSubmit={$this.formSubmitHandler.bind($this)} noValidate autoComplete="off">
        <FormControl required centered="true" fullWidth={true}>
          <InputLabel htmlFor="userContactNumber">Contact Number</InputLabel>
          <Input value={$this.state.userContactNumber} name="userContactNumber" id="userContactNumber" type="text" onChange={$this.formOnChangeHandler.bind($this)} />
          <FormHelpertext className={$this.state.contactErrorStatus}><span className="red">Invalid Contact</span></FormHelpertext>
        </FormControl>
        <br />
        <br />
        <FormControl required centered="true" fullWidth={true}>
          <InputLabel htmlFor="userPassword">Password</InputLabel>
          <Input value={$this.state.userPassword} name="userPassword" id="userPassword" type="password" onChange={$this.formOnChangeHandler.bind($this)} />
          <FormHelpertext className={$this.state.passwordErrorStatus}><span className="red">Required</span></FormHelpertext>
        </FormControl>
        <br />
        <br />
        <FormHelpertext className={$this.state.apiError}><span className="red">{$this.state.apiMessage}</span></FormHelpertext>
        <Button variant="contained" color="primary" className="loginButton" type="submit">
          Login
        </Button>
      </form>
    );
  };
};

/* sign up form */
class SignUpFormComponent extends Component {
  /* constructor */
  constructor() {
    super();
    this.state = {
      userFirstName: "",
      userLastName: "",
      userEmail: "",
      userPassword: "",
      userContact: "",
      firstNameErrorStatus: "hide",
      emailErrorStatus: "hide",
      passwordErrorStatus: "hide",
      contactErrorStatus: "hide",
      apiError: "hide",
      apiMessage: "Example of some error message"
    };

    this.formHideApiError = this.formHideApiError.bind(this);
    this.formShowApiError = this.formShowApiError.bind(this);
  };

  /* form on submit handler */
  formOnSubmitHandler(event) {
    event.preventDefault();
    let $this = this;

    let formStatus = {
      firstName: false,
      email: false,
      password: false,
      contact: false
    };
    let { userFirstName: firstName, userLastName: lastName, userEmail: email, userPassword: password, userContact: contact } = $this.state;
    let updatedState = { ...$this.state };
    updatedState.apiError = "hide";

    if (firstName !== "") {
      updatedState.firstNameErrorStatus = "hide";
      formStatus.firstName = true;
    }
    else {
      updatedState.firstNameErrorStatus = "show";
      formStatus.firstName = false;
    }

    if (email !== "" && AppUtilities.isValidEmail(email)) {
      updatedState.emailErrorStatus = "hide";
      formStatus.email = true;
    }
    else {
      updatedState.emailErrorStatus = "show";
      formStatus.email = false;
    }

    if (password !== "" && AppUtilities.isValidPassword(password)) {
      updatedState.passwordErrorStatus = "hide";
      formStatus.password = true;
    }
    else {
      updatedState.passwordErrorStatus = "show";
      formStatus.password = false;
    }

    if (contact !== "" && AppUtilities.isValidContactNumber(contact)) {
      updatedState.contactErrorStatus = "hide";
      formStatus.contact = true;
    }
    else {
      updatedState.contactErrorStatus = "show";
      formStatus.contact = false;
    }

    /* perform neccessary updates */
    $this.setState({ ...updatedState });

    if (formStatus.firstName === true && formStatus.email === true && formStatus.password === true && formStatus.contact === true) {
      $this.props.showSnackbar("Processsing. Please Wait...", function () {
        /* smooth transition */
        setTimeout(function () {
          let signUpUrl = "http://localhost:8080/api/customer/signup";
          let requestConfig = {
            url: signUpUrl,
            method: "post",
            data: {
              "contact_number": contact,
              "email_address": email,
              "first_name": firstName,
              "last_name": (lastName === "") ? null : lastName,
              "password": password
            }
          };
          axios(requestConfig).then(function (response) {
            if (response.statusText === "OK" || response.status === 201) {
              $this.props.changeTabHandler("0");
              $this.props.showSnackbar("Registered successfully! Please login now!", function () {
                setTimeout(function () {
                  $this.formResetHandler();
                }, 1500);
              });
            }
          })
            .catch(function (error) {
              if ("response" in error && "data" in error.response) {
                $this.formShowApiError(error.response.data.message);
              }
            });
        }, 2500);
      });
    }
    else {
      console.log("error");
    }
  };

  /* login form reset handler */
  formResetHandler() {
    this.setState({
      userFirstName: "",
      userLastName: "",
      userEmail: "",
      userPassword: "",
      userContact: "",
      firstNameErrorStatus: "hide",
      lastNameErrorStatus: "hide",
      emailErrorStatus: "hide",
      passwordErrorStatus: "hide",
      contactErrorStatus: "hide",
      apiError: "hide",
      apiMessage: "Example of some error message"
    });
  };

  /* hide api error */
  formHideApiError() {
    let $this = this;
    $this.setState({ apiError: "hide" });
  }

  /* show api error with message */
  formShowApiError(message) {
    let $this = this;
    $this.setState({ apiError: "show", apiMessage: message });
  }

  /* form elements on change handler */
  formOnChangeHandler(event) {
    let name = event.target.name;
    let value = event.target.value;
    let $this = this;
    let { state } = $this;

    /* update */
    state[name] = value;
    this.setState({ ...state });
  };

  /* render */
  render() {
    let $this = this;

    return (
      <form className="signUpForm" noValidate autoComplete="off" onSubmit={$this.formOnSubmitHandler.bind($this)}>
        <FormControl required centered="true" fullWidth={true}>
          <InputLabel htmlFor="userFirstName">First Name</InputLabel>
          <Input value={$this.state.userFirstName} name="userFirstName" id="userFirstName" type="text" onChange={$this.formOnChangeHandler.bind($this)} />
          <FormHelpertext className={$this.state.firstNameErrorStatus}><span className="red">Required</span></FormHelpertext>
        </FormControl>
        <br />
        <br />
        <FormControl centered="true" fullWidth={true}>
          <InputLabel htmlFor="userLastName">Last Name</InputLabel>
          <Input value={$this.state.userLastName} name="userLastName" id="userLastName" type="text" onChange={$this.formOnChangeHandler.bind($this)} />
        </FormControl>
        <br />
        <br />
        <FormControl required centered="true" fullWidth={true}>
          <InputLabel htmlFor="userEmail">Email Address</InputLabel>
          <Input value={$this.state.userEmail} name="userEmail" id="userEmail" type="text" onChange={$this.formOnChangeHandler.bind($this)} />
          <FormHelpertext className={$this.state.emailErrorStatus}><span className="red">Invalid Email</span></FormHelpertext>
        </FormControl>
        <br />
        <br />
        <FormControl required centered="true" fullWidth={true}>
          <InputLabel htmlFor="userPassword">Password</InputLabel>
          <Input value={$this.state.userPassword} name="userPassword" id="userPassword" type="password" onChange={$this.formOnChangeHandler.bind($this)} />
          <FormHelpertext className={$this.state.passwordErrorStatus}><span className="red">
            Password must contain at least one capital letter, one small letter, one number, and one special character
          </span></FormHelpertext>
        </FormControl>
        <br />
        <br />
        <FormControl required centered="true" fullWidth={true}>
          <InputLabel htmlFor="userContact">Contact No</InputLabel>
          <Input value={$this.state.userContact} name="userContact" id="userContact" type="text" onChange={$this.formOnChangeHandler.bind($this)} />
          <FormHelpertext className={$this.state.contactErrorStatus}><span className="red">Contact No. must contain only numbers and must be 10 digits long</span></FormHelpertext>
        </FormControl>
        <br />
        <br />

        <FormHelpertext className={$this.state.apiError}><span className="red">{$this.state.apiMessage}</span></FormHelpertext>
        <Button variant="contained" color="primary" className="signUpButton" type="submit">
          Sign Up
        </Button>
      </form>
    );
  };
};

/* header modal section */
const HeaderModalSection = (props) => {
  let classes = modalStyles();
  let { tabIndexValue, tabIndexOnChange, modalIsOpen, showSnackbar, changeTabHandler, modalCloser,
    performLogin } = props;
  return (
    <Modal
      isOpen={modalIsOpen}
      ariaHideApp={false}
      onRequestClose={modalCloser}
      className="appHeaderModal"
    >
      <TabContext value={tabIndexValue}>
        <TabList onChange={(event, newValue) => { tabIndexOnChange(newValue) }}>
          <Tab label="Login" value="0" className={classes.customTabs} />
          <Tab label="Sign Up" value="1" className={classes.customTabs} />
        </TabList>
        <TabPanel value="0">
          <LoginFormComponent showSnackbar={showSnackbar} modalCloser={modalCloser} performLogin={performLogin} />
        </TabPanel>
        <TabPanel value="1">
          <SignUpFormComponent showSnackbar={showSnackbar} changeTabHandler={changeTabHandler} />
        </TabPanel>
      </TabContext>
    </Modal>
  );
};

/* login button */
const HeaderLoginButton = (props) => {
  let { onClickHandler, isLoggedIn, loggedInName: userFirstName, showLogoutPopup, logoutPopupConfig,
    performLogout, hideLogoutPopup } = props;

  if (!isLoggedIn) {
    return (
      <Button variant="contained" startIcon={<AccountCircleIcon />} onClick={onClickHandler}>Login</Button>
    );
  }
  else {
    return (
      <React.Fragment>
        <Button variant="contained" className="logoutButton" startIcon={<AccountCircleIcon />}
          onClick={(event) => { showLogoutPopup(event.currentTarget) }}>{userFirstName}</Button>
        <Menu
          anchorEl={logoutPopupConfig.anchorElement}
          keepMounted
          open={logoutPopupConfig.isOpen}
          onClose={hideLogoutPopup}
        >
          <MenuItem onClick={performLogout}>Logout</MenuItem>
        </Menu>
      </React.Fragment>
    );
  }
};

/* main */
class Header extends Component {
  constructor() {
    super();
    this.state = {
      activeTab: "0",
      modalIsOpen: false,
      isLoggedIn: false,
      loggedInUserName: "",
      logoutPopup: {
        anchorElement: null,
        isOpen: false
      },
      snackbar: {
        show: false,
        message: ""
      }
    };
  }

  /* component will mount - based on the props sent from the top level food application component, necesary 
     action will be taken */
  UNSAFE_componentWillMount() {
    let $this = this;
    if ("fetchRestaurants" in $this.props) {
      $this.props.fetchRestaurants();
    }

    /* checks to see the session storage for the access token 'foodapptoken' */
    $this.ifLoggedInThenMakeUpdatesToSession.bind(this)();
  }

  ifLoggedInThenMakeUpdatesToSession() {
    let $this = this;
    let accessToken = window.sessionStorage.getItem('foodapptoken');
    let userName = window.sessionStorage.getItem("appusername");
    if (accessToken) {
      $this.setState({ isLoggedIn: true, loggedInUserName: userName });
    }
  }

  /* popup menu setting the anchor element */
  showLogoutPopup(element) {
    let $this = this;
    $this.setState({ logoutPopup: { anchorElement: element, isOpen: true } });
  };

  /* popup menu close for logout button */
  hideLogoutPopup() {
    let $this = this;
    $this.setState({ logoutPopup: { anchorElement: null, isOpen: false } });
  }

  /* tabs on change handler */
  tabsOnChangeHandler(tabIndexToShow) {
    this.setState({ activeTab: tabIndexToShow });
  }

  /* on click handler */
  onClickHandler(event) {
    let $this = this;
    $this.modalOpener();
  }

  /* snackbar closer */
  snackbarCloser() {
    this.setState({ snackbar: { ...this.state.snackbar, show: false } });
  }

  /* snackbar show */
  snackbarShower(messageString, callback) {
    let $this = this;
    $this.setState({ snackbar: { message: messageString, show: true } });
    setTimeout(function () {
      $this.snackbarCloser();
    }, 4000);
    if (typeof callback === "function") {
      callback();
    }
  }

  /* open modal */
  modalCloser() {
    this.setState({ modalIsOpen: false });
  };

  /* close modal */
  modalOpener() {
    this.setState({ modalIsOpen: true });
  };

  /* set logged in = true */
  performSessionLogin(response, callback) {
    /* set the session storage key & access token based on the response from server */
    sessionStorage.setItem("foodapptoken", response.headers["access-token"]);
    sessionStorage.setItem("appusername", response.data.first_name);

    /* update the state */
    this.setState({ isLoggedIn: true, loggedInUserName: response.data.first_name }, function () {
      if (typeof callback === "function") {
        callback();
      }
    });
  }

  /* set logged in = false (ie. logged out) */
  performSessionLogout(callback) {
    let $this = this;
    let requestConfig = {
      url: "http://localhost:8080/api/customer/logout",
      method: "post",
      responseType: "json",
      headers: {
        "authorization": "Bearer " + window.sessionStorage.getItem("foodapptoken"),
        'Content-Type': 'application/json;charset=UTF-8',
      },
      data: {}
    };

    /* perform the request */
    axios(requestConfig).then(function (response) {
      if (response.statusText === "OK" || response.status === 200) {
        $this.snackbarShower("Logged Out Sucessfully!", function () {
          /* remove the respective session storage token from the browser */
          sessionStorage.removeItem("foodapptoken");
          sessionStorage.removeItem("appusername");
          $this.hideLogoutPopup();

          /* update the state */
          $this.setState({ isLoggedIn: false, loggedInUserName: "" }, function () {
            if (typeof callback === "function") {
              callback();
            }
          });
        });
      }
    })
      .catch(function (error) {
        console.log(error.response);
        $this.snackbarShower("Sorry. Try Again?");
      });
  }

  /* render */
  render() {
    let $this = this;
    let { routerProps } = $this.props.routerProps;
    return (
      <React.Fragment>
        {/* nav section */}
        <nav>
          <div className="customRow">
            <div className="segment">
              <HeaderAppIcon />
            </div>
            <div className="segment">
              {/* search feature only applicable in the home page and other pages will not be rendered */}
              {
                routerProps.location.pathname === "/" &&
                <HeaderSearch searchHandler={$this.props.searchRestaurantsByName} />
              }
              {/* search feature only applicable in the home page and other pages will not be rendered */}
            </div>
            <div className="segment">
              <HeaderLoginButton
                onClickHandler={this.onClickHandler.bind(this)}
                isLoggedIn={this.state.isLoggedIn} loggedInName={this.state.loggedInUserName}
                showLogoutPopup={this.showLogoutPopup.bind(this)}
                hideLogoutPopup={this.hideLogoutPopup.bind(this)}
                logoutPopupConfig={this.state.logoutPopup}
                performLogout={this.performSessionLogout.bind(this)}
              />
            </div>
          </div>
        </nav>

        {/* modal section */}
        <HeaderModalSection
          modalIsOpen={this.state.modalIsOpen}
          modalCloser={this.modalCloser.bind(this)}
          tabIndexValue={this.state.activeTab}
          tabIndexOnChange={this.tabsOnChangeHandler.bind(this)}
          showSnackbar={this.snackbarShower.bind(this)}
          changeTabHandler={this.tabsOnChangeHandler.bind(this)}
          performLogin={this.performSessionLogin.bind(this)}
        />

        {/* snackbar */}
        <Snackbar message={this.state.snackbar.message} open={this.state.snackbar.show} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} onClose={this.snackbarCloser.bind(this)} />
      </React.Fragment>
    );
  }
}
export default Header;
