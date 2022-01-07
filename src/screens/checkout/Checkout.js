/* react imports */
import React, { Component } from "react";

/* project imports */
import "./Checkout.scss";
import Header from '../../common/header/Header';

/* material ui */
import Grid from "@material-ui/core/Grid";
import Snackbar from '@material-ui/core/Snackbar';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from "@material-ui/core/Button";
import { FormControl, InputLabel, Input, Select, AppBar } from "@material-ui/core";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import GridList from '@material-ui/core/GridList';
import { GridListTile } from '@material-ui/core';
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircle from '@material-ui/icons/CheckCircle';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from "@material-ui/core/Divider";
import { CardActions } from "@material-ui/core";

const customStyles = muiBaseTheme => ({
  root: {
    width: "100%"
  }, button: {
    marginTop: muiBaseTheme.spacing(),
    marginRight: muiBaseTheme.spacing()
  }, step: {
    marginBottom: muiBaseTheme.spacing(5)
  },
  iconContainer: {
    transform: "scale(2)",
    marginRight: muiBaseTheme.spacing(5)
  }
})
//To toggle between steps: Delivery and Payment
function getSteps() {
  return ["Delivery", "Payment"];
}
//Applying Tab display style
function TabContainer(props) {
  return (
    <Typography component={'div'} variant={'body2'} style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}
class Checkout extends Component {
  constructor() {
    super();
    this.state = {
      value: 0,
      activeStep: 0,
      dataAddress: [],
      selected: 0,
      dataPayments: [],
      paymentMethod: "",
      dataStates: [],
      flatBldNo: "",
      flatBldNoRequired: 'dispNone',
      locality: "",
      localityRequired: 'dispNone',
      city: "",
      cityRequired: 'dispNone',
      pincode: "",
      pincodeRequired: 'dispNone',
      pincodeLengthRequired: 'dispNone',
      stateRequired: 'dispNone',
      saveAddressSuccess: false,
      saveAddressError: 'dispNone',
      saveAddressErrorMsg: '',
      checkOutAddressRequired: 'dispNone',
      selAddress: "",
      chcartItems: [],
      totalCartItemsValue: "",
      resDetails: null,
      onNewAddress: false,
      changeOption: "dispNone",
      selectedState: 0
    };
  }

  //To toggle between "Existing Address" and "New Address" tabs
  tabChangeHandler = (event, value) => {
    this.setState({ value })
  };
  //Handling and storing change of payment method value
  handleChange = (event) => {
    this.setState({ paymentMethod: event.target.value })
    sessionStorage.setItem("paymentMethod", event.target.value);
  }
  onExistingAddressTab = () => {
    this.setState({ onNewAddress: false });
  }
  onNewAddressTab = () => {
    this.setState({ onNewAddress: true });
  }
  handleNext = () => {
    console.log("dev");
    if (this.state.onNewAddress === true) {
      //do nothing
    } else {
      if (this.state.activeStep === 1) {
        if (this.state.paymentMethod === "") {
          this.setState({ saveOrderResponse: "Please select payment method" })
          this.openMessageHandler(); return;
        }
        this.setState(state => ({
          activeStep: this.state.activeStep + 1,
          changeOption: "dispText"
        }));
      } else {
        console.log(this.state.selected);
        if (this.state.selected === null || this.state.selected === 0) {
          this.setState({ saveOrderResponse: "Please select Address" })
          this.openMessageHandler();
          return;
        }
        this.setState(state => ({
          activeStep: this.state.activeStep + 1,
          changeOption: "dispNone"
        }));
      }
    }
  };
  //Called to back one step Payment to Delivery
  handleBack = () => {
    this.setState(state => ({
      activeStep: this.state.activeStep - 1
    }));
  };
  //Getting all saved addresses for a customer
  getAddresses(baseURL, access_token) {
    let data = null;
    let xhrAddresses = new XMLHttpRequest();
    access_token = sessionStorage.getItem("foodapptoken");
    let that = this;

    xhrAddresses.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        let address = JSON.parse(xhrAddresses.response);
        that.setState({ dataAddress: address });
      }
    })
    xhrAddresses.open("GET", baseURL + "address/customer");
    xhrAddresses.setRequestHeader("authorization", "Bearer " + access_token); //sessionStorage.getItem('access-token')
    xhrAddresses.setRequestHeader("Cache-Control", "no-cache");
    xhrAddresses.send(data);
  }

  //Get all available payment methods
  getPaymentMethods(baseURL) {
    let data = null;
    let xhrPayments = new XMLHttpRequest();
    let that = this;
    xhrPayments.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        let paymentMethods = JSON.parse(xhrPayments.response);
        that.setState({ dataPayments: paymentMethods });
      }
    })
    xhrPayments.open("GET", baseURL + "/payment");
    xhrPayments.setRequestHeader("Accept", "application/json;charset=UTF-8");
    xhrPayments.send(data);
  }
  //Get all available state values for the dropdown
  getStates() {
    const that = this;
    let xhrAddresses = new XMLHttpRequest();
    xhrAddresses.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        let address = JSON.parse(xhrAddresses.response);
        that.setState({ dataStates: address.states });
      }
    })
    xhrAddresses.open("GET", this.props.baseUrl + "states");
    xhrAddresses.setRequestHeader("Cache-Control", "no-cache");
    xhrAddresses.send();
  }
  //Set component state values from props passed from Details page
  UNSAFE_componentWillMount() {
    try {
      var access_token = sessionStorage.getItem("foodapptoken");
      console.log(this.props.history.location.state.chcartItems.ItemList);
      this.setState({ chcartItems: this.props.history.location.state.chcartItems });
      this.setState({ totalCartItemsValue: this.props.history.location.state.totalCartItemsValue });
      this.setState({ resDetails: JSON.parse(sessionStorage.getItem("restaurantDetails")) });
      this.getAddresses(this.props.baseUrl, access_token);
      this.getPaymentMethods(this.props.baseUrl);
      this.getStates();
    } catch {
      this.mounted = false;
      this.props.history.push("/");
    }
  }
  //Capturing input field values in state for processing
  flatBldNoChangeHandler = (e) => {
    this.setState({ flatBldNo: e.target.value })
  }

  localityChangeHandler = (e) => {
    this.setState({ locality: e.target.value })
  }

  cityChangeHandler = (e) => {
    this.setState({ city: e.target.value })
  }

  pinCodeChangeHandler = (e) => {
    this.setState({ pincode: e.target.value })
  }
  //Also when user clicks on the same address - This deselects the address
  onAddressClick = (address) => {
    if (address.id === this.state.selected) {
      sessionStorage.setItem("selected", null);
      sessionStorage.setItem("selAddress", null);
      this.setState(state => ({
        selected: null,
        selAddress: null
      }));
    } else {
      sessionStorage.setItem("selected", address.id);
      sessionStorage.setItem("selAddress", JSON.stringify(address));
      this.setState(state => ({
        selected: address.id,
        selAddress: address
      }));

    }

  };
  //Opening snack bar
  openMessageHandler = () => {
    this.setState({ snackBarOpen: true })
  }
  handleReset = () => {
    this.setState({
      activeStep: 0
    });
  };
  //Closing snack bar
  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ snackBarOpen: false })
  }
  //Placing order after entering all required values:Delivery and Payment details
  //Triggered from "Place Order" button
  checkoutHandler = () => {

    if (sessionStorage.getItem("selAddress") === "null" || sessionStorage.getItem("selAddress") === null) {
      this.setState({ saveOrderResponse: "Please select Address" })
      this.openMessageHandler();
      return;
    } else if (this.state.paymentMethod === "") {
      this.setState({ saveOrderResponse: "Please select payment method" })
      this.openMessageHandler();
      return;
    }

    //When order is placed,  checkout with order id 
    let orders = this.state.chcartItems.itemList;
    let dataCheckout = JSON.stringify({
      "address_id": sessionStorage.getItem("selected"),
      "bill": this.state.totalCartItemsValue,
      "coupon_id": "",
      "discount": 0,
      "item_quantities":
        orders.map(item => (
          {
            "item_id": item.item.id,
            "price": item.item.price,
            "quantity": item.quantity
          }))
      ,
      "payment_id": sessionStorage.getItem("paymentMethod"),
      "restaurant_id": JSON.parse(sessionStorage.getItem("restaurantDetails")).id
    });
    let that = this;
    let access_token = sessionStorage.getItem("foodapptoken");
    let xhrCheckout = new XMLHttpRequest();
    xhrCheckout.addEventListener('error', function () {
      let response = 'Unable to place your order! Please try again!';
      that.setState({ saveOrderResponse: response });
      that.openMessageHandler();
    })
    xhrCheckout.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        let checkoutResponse = JSON.parse(this.response);
        let response = checkoutResponse.status + "! Your order ID is " + checkoutResponse.id;
        that.setState({ saveOrderResponse: response });
        that.openMessageHandler();
      }
    })

    xhrCheckout.open("POST", this.props.baseUrl + "order");
    xhrCheckout.setRequestHeader("Authorization", "Bearer " + access_token);
    xhrCheckout.setRequestHeader("Content-Type", "application/json");
    xhrCheckout.setRequestHeader("Cache-Control", "no-cache");
    xhrCheckout.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhrCheckout.send(dataCheckout);
  }
  //Called to save new address entered by user
  addressClickHandler = () => {
    this.setState({ saveAddressError: "dispNone" })
    //Validating that no fields are empty
    //If empty, "required" text is displayed
    this.state.flatBldNo === "" ? this.setState({ flatBldNoRequired: "dispBlock" }) : this.setState({ flatBldNoRequired: "dispNone" });
    this.state.locality === "" ? this.setState({ localityRequired: "dispBlock" }) : this.setState({ localityRequired: "dispNone" });
    this.state.city === "" ? this.setState({ cityRequired: "dispBlock" }) : this.setState({ cityRequired: "dispNone" });
    this.state.pincode === "" ? this.setState({ pincodeRequired: "dispBlock" }) : this.setState({ pincodeRequired: "dispNone" });
    (((this.state.pincode.length === 6) && this.state.pincode.match(/^\d{4}$|^\d{6}$/)) || this.state.pincode === "") ? this.setState({ pincodeLengthRequired: "dispNone" }) : this.setState({ pincodeLengthRequired: "dispBlock" });

    (this.state.selectedState === 0 || this.state.selectedState === "") ? this.setState({ stateRequired: "dispBlock" }) : this.setState({ stateRequired: "dispNone" });
    console.log(typeof this.state.pincode.length);
    if (this.state.flatBldNo === "" || this.state.locality === "" || this.state.city === "" || this.state.pincode === "" || this.state.selected === "") { return }

    //Forming parameters to pass in the API Url
    let dataAddress = JSON.stringify({
      "city": this.state.city,
      "flat_building_name": this.state.flatBldNo,
      "locality": this.state.locality,
      "pincode": this.state.pincode,
      "state_uuid": this.state.selectedState
    })

    let that = this;
    let access_token = sessionStorage.getItem("foodapptoken");
    let xhrSaveAddress = new XMLHttpRequest();
    xhrSaveAddress.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        let saveAddressResponse = JSON.parse(this.response);
        if (saveAddressResponse.code === 'SAR-002' || saveAddressResponse.code === 'SAR-002') {
          that.setState({ saveAddressError: "dispBlock" });
          that.setState({ saveAddressErrorMsg: "Pincode must contain only numbers and must be 6 digits long" });
        } else {
          that.setState({ saveAddressSuccess: true });
          window.location.reload();
        }
      }
    })

    xhrSaveAddress.open("POST", this.props.baseUrl + "address");
    xhrSaveAddress.setRequestHeader("authorization", "Bearer " + access_token);
    xhrSaveAddress.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhrSaveAddress.send(dataAddress);
  }
  onStateChange = (event) => {
    console.log(event.target.value);
    this.setState({ selectedState: event.target.value })
  };

  getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div>
            <AppBar position={"static"}>
              <Tabs value={this.state.value} onChange={this.tabChangeHandler}>
                <Tab onClick={this.onExistingAddressTab} label="Existing Address" />
                <Tab onClick={this.onNewAddressTab} label="New Address" />
              </Tabs>
            </AppBar>
            {this.state.value === 0 &&

              <TabContainer>
                {this.state.dataAddress.addresses === null ?
                  <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                  >
                    <Grid container spacing={5}>
                      <GridList cellHeight={"auto"} className="gridListMain">
                        <GridListTile style={{ width: "100%", marginTop: "4%" }} >
                          <p className="noAddress">There are no saved addresses! You can save an address using the "New Address" tab or using your "Profile" Menu</p>
                        </GridListTile>
                      </GridList>
                    </Grid>
                  </Grid> :
                  <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                  >
                    <Grid container spacing={5}>
                      <GridList cellHeight={"auto"} className="gridListMain">
                        {(this.state.dataAddress.addresses || []).map((exisAddress, index) => {
                          return (<GridListTile className={exisAddress.id === this.state.selected ? "selectedAddress" : "gridListTile"} key={exisAddress.id} id={exisAddress.id} style={{ padding: '5px' }}>
                            <div className="addressCardsParent">
                              <Card className={this.props.card} key={exisAddress.id} >
                                <CardContent className="addressCard">
                                  <span className="addressContent">{exisAddress.flat_building_name}</span>
                                  <span className="addressContent">{exisAddress.locality}</span>
                                  <span className="addressContent">{exisAddress.city}</span>
                                  <span className="addressContent">{exisAddress.state.state_name}</span>
                                  <span className="addressContent">{exisAddress.pincode}</span>
                                  <IconButton className="selectAddresscircle" aria-label="Select Address" onClick={() => this.onAddressClick(exisAddress)}>
                                    {exisAddress.id === this.state.selected ? <CheckCircle style={{ color: "green" }} /> : <CheckCircle style={{ color: "#999999" }} />}
                                  </IconButton>
                                </CardContent>
                              </Card>
                            </div>
                          </GridListTile>
                          );
                        })}
                      </GridList>
                    </Grid>
                  </Grid>}
              </TabContainer>}
            {this.state.value === 1 &&
              <TabContainer>
                <div className="newAddressForm">
                  <FormControl required className={this.props.formControl}>
                    <InputLabel htmlFor="FltBldNo">Flat/Build No.</InputLabel>
                    <Input
                      id="FlatBldNo"
                      type="text"
                      onChange={this.flatBldNoChangeHandler}
                    />
                    <FormHelperText className={this.state.flatBldNoRequired}><span className="red">required</span></FormHelperText>
                  </FormControl><br /><br />
                  <FormControl required className={this.props.formControl}>
                    <InputLabel htmlFor="Locality">Locality</InputLabel>
                    <Input
                      id="Locality"
                      type="text"
                      onChange={this.localityChangeHandler}
                    />
                    <FormHelperText className={this.state.localityRequired}><span className="red">required</span></FormHelperText>
                  </FormControl><br /><br />
                  <FormControl required className={this.props.formControl}>
                    <InputLabel htmlFor="city">City</InputLabel>
                    <Input
                      id="City"
                      type="text"
                      onChange={this.cityChangeHandler}
                    />
                    <FormHelperText className={this.state.cityRequired}><span className="red">required</span></FormHelperText>
                  </FormControl><br /><br />
                  <FormControl required className={this.props.formControl}>
                    <InputLabel htmlFor="State" shrink>State</InputLabel>
                    <Select
                      value={this.state.selectedState}
                      onChange={this.onStateChange}
                      input={<Input name="state" id="state" />}
                      style={{ width: '200px' }}
                      placeholder="Select State"
                    >
                      <MenuItem selected value="0">
                        Select State
                      </MenuItem>
                      {this.state.dataStates.map((state, i) => (
                        <MenuItem key={"state_" + state.id + "_" + i} value={state.id}>
                          {state.state_name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText className={this.state.stateRequired}><span className="red">required</span></FormHelperText>
                  </FormControl><br /><br />
                  <FormControl required className={this.props.formControl}>
                    <InputLabel htmlFor="Pincode">Pin Code</InputLabel>
                    <Input
                      id="Pincode"
                      type="text"
                      onChange={this.pinCodeChangeHandler}
                    />
                    <FormHelperText className={this.state.pincodeRequired}><span className="red">required</span></FormHelperText>
                    <FormHelperText className={this.state.pincodeLengthRequired}><span className="red">Pincode must contain only numbers and must be 6 digits long</span></FormHelperText>
                  </FormControl><br /><br />
                  <FormControl className={this.props.formControl}>
                    <Typography variant="subtitle1" color="error" className={this.state.saveAddressError} align="left">{this.state.saveAddressErrorMsg}</Typography>
                  </FormControl><br /><br />
                  <Button variant="contained" color="secondary" onClick={this.addressClickHandler} className="saveAddressButton">
                    SAVE ADDRESS
                  </Button>
                </div>
              </TabContainer>
            }
          </div>
        );
      case 1:
        return (
          <div>
            <FormControl component="fieldset" >
              <FormLabel component="legend">Select Mode of Payment</FormLabel>
              <RadioGroup
                aria-label="Payment Method"
                name="payment"
                value={this.state.paymentMethod}
                onChange={this.handleChange}
              >
                {this.state.dataPayments.paymentMethods.map((payMethod, index) => (
                  <FormControlLabel value={payMethod.id} control={<Radio />} label={payMethod.payment_name} key={index} />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
        )
      default:
        return "Unknown step";
    }
  }

  render() {
    {
      if (sessionStorage.getItem("foodapptoken") === null || sessionStorage.getItem("restaurantDetails") === null) {
        this.props.history.push("/");
        return "";
      }
    }
    const { classes } = this.props;
    const { activeStep } = this.state;
    const steps = getSteps();
    let $this = this;
    let headerProps = {
      routerProps: $this.props
    };
    return (
      <React.Fragment>
        <Header
          routerProps={headerProps}
        />
        <Grid container spacing={2} className="gridParent">
          <Grid item xs={12} md={8} className="gridItem">
            <div className={classes.root}>
              <Stepper activeStep={activeStep} orientation="vertical" className="gridStepper">
                {steps.map(label => {
                  return (
                    <Step key={label} className={classes.step}>
                      <StepLabel classes={{ iconContainer: classes.iconContainer }}>
                        <h1>{label}</h1>
                      </StepLabel>
                      <StepContent>
                        <Typography component={'div'}>{this.getStepContent(activeStep)}</Typography>
                        <div>
                          <div>
                            <Button className="backButton" disabled={activeStep === 0} onClick={this.handleBack} >
                              Back
                            </Button>
                            <Button className="primaryButton" variant="contained" color="primary" onClick={this.handleNext} >
                              {activeStep === steps.length - 1 ? "Finish" : "Next"}
                            </Button>
                          </div>
                        </div>
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
              <div className={this.state.changeOption} style={{ fontSize: "1.0em" }}>View the summary and place your order now!<br />
                <div>
                  <Button style={{ fontSize: "20px", marginLeft: "2%" }} onClick={this.handleReset} className={classes.button}>
                    CHANGE
                  </Button>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} md={4} className="gridItem">
            <Card className="summaryCard">
              <CardHeader className="summaryHeader" style={{ fontWeight: "bolder" }} title="Summary" titleTypographyProps={{ variant: 'h4' }} />
              <span className="restaurantName">{this.state.resDetails.restaurant_name}</span>
              <CardContent className="orderDetatilsRoot">
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  {this.props.history.location.state.chcartItems.itemList.map((item, index) => {
                    return (
                      <Grid className="orderGrid" container item xs={12} spacing={1} key={index}>
                        <Grid item xs={1}>
                          {item.item.item_type === 'VEG' ? <i
                            className="fa fa-stop-circle-o"
                            style={{
                              color: "green",
                              width: "1",
                              height: "1",
                            }}
                            aria-hidden="true"
                          ></i> : <i
                            className="fa fa-stop-circle-o"
                            style={{ color: "red" }}
                            aria-hidden="true"
                          ></i>}
                        </Grid>
                        <Grid item xs={6} className="itemName">
                          <span>{item.item.item_name}</span>
                        </Grid>
                        <Grid item xs={1}>
                          {item.quantity}
                        </Grid>
                        <Grid item xs={1}>
                        </Grid>
                        <Grid item xs={2}>
                          <i className="fa fa-inr"></i><span>{item.item.price}</span>
                        </Grid>
                      </Grid>);
                  })
                  }
                  <Grid container item xs={12}>
                    <Grid className="tileContainer" item xs={11} >
                      <Divider className={this.props.divider} variant="middle" />
                      <br />
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} >
                    <Grid item xs={5}>
                      <Typography style={{ marginLeft: "14%", fontSize: "0.8em", fontWeight: "bold" }} >
                        Net Amount
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography style={{ marginLeft: "3%", fontSize: "100%", fontWeight: "bold" }}>
                        <i style={{ color: "grey" }} className="fa fa-inr"></i><span>  {this.props.history.location.state.totalCartItemsValue}</span>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions >
                <Button className="placeOrderButton" variant="contained" color="primary" onClick={this.checkoutHandler}>
                  Place Order
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.snackBarOpen}
          autoHideDuration={3000}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.saveOrderResponse}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </React.Fragment>
    );
  }
}
export default withStyles(customStyles)(Checkout);
