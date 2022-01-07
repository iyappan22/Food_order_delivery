/* react imports */
import React, { Component } from "react";

/* material ui imports */
import CloseIcon from "@material-ui/icons/Close";
import Snackbar from "@material-ui/core/Snackbar";
import { IconButton } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import AddIcon from "@material-ui/icons/Add";
import { Card, CardContent } from "@material-ui/core";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import RemoveIcon from "@material-ui/icons/Remove";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";

/* project imports */
import "../../assets/font-awesome-4.7.0/css/font-awesome.min.css";
import Header from "../../common/header/Header.js";
import "./Details.scss";

class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resData: [],
      locality: "",
      city: "",
      sum: "0.00",
      snackBarOpen: false,
      cartItems: {
        restaurant: null,
        itemList: [],
        totalPrice: 0,
        totalItemCount: 0,
      },
    };
    this.apiURL = "http://localhost:8080/api/";
  }

  UNSAFE_componentWillMount() {
    //API call to get restaurant details by restaurant ID
    let xhr_resDetails = new XMLHttpRequest();
    let dataRes = null;
    //Getting and splitting current url to get restaurant ID
    let temp = this.props.location.pathname;
    let resId = temp.split("/")[2];
    let that = this;
    xhr_resDetails.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        const data = JSON.parse(this.responseText);
        that.setState({
          resData: data,
          locality: data.address.locality,
          city: data.address.city,
        });
      }
    });
    xhr_resDetails.open("GET", this.apiURL + "restaurant/" + resId);
    xhr_resDetails.setRequestHeader("Cache-Control", "no-cache");
    xhr_resDetails.send(dataRes);
  }

  //Add items to cart from the Category wise list
  addToCart = (item, category) => {
    //Calling snack bar to display message
    this.snackBarHandler("Item added to cart!");
    const myCartItem = this.state.cartItems || {
      restaurant: this.state.resData,
      itemList: [],
      totalPrice: 0,
      totalItemCount: 0,
    };
    let findIndex = null;
    //If the item is new, not already added into the list, then insert newly
    let findItem = myCartItem.itemList.find((cartItem, index) => {
      if (cartItem.item.id === item.id) {
        findIndex = index;
        return cartItem;
      }
      return undefined;
    });
    // If item already exists, only increment item quantiyt and price
    if (findItem !== undefined) {
      findItem.quantity = findItem.quantity + 1;
      findItem.totalItemPrice = findItem.totalItemPrice + item.price;
      myCartItem.itemList[findIndex] = findItem;
      findIndex = null;
      myCartItem.totalPrice = myCartItem.totalPrice + item.price;
      myCartItem.totalItemCount = myCartItem.totalItemCount + 1;
    } else {
      // If not already added then creating temp object and doing other calculations
      const cartItem = {
        quantity: 1,
        categoryName: category.category_name,
        categoryId: category.id,
        item: item,
        totalItemPrice: item.price,
      };
      myCartItem.totalPrice = myCartItem.totalPrice + item.price;
      myCartItem.totalItemCount = myCartItem.totalItemCount + 1;
      // Push items to cart
      myCartItem.itemList.push(cartItem);
    }

    // Finally updating our myCartItem state
    this.setState({ cartItems: myCartItem });
  };

  // Removing item from cart
  removeAnItemFromCart = (removeCartItem, index) => {
    const myCartItem = this.state.cartItems;
    // Match item based on index
    let findItem = myCartItem.itemList[index];
    // Update matched item based on index
    findItem.quantity = findItem.quantity - 1;
    findItem.totalItemPrice = findItem.totalItemPrice - findItem.item.price;
    myCartItem.totalPrice = myCartItem.totalPrice - findItem.item.price;
    myCartItem.totalItemCount = myCartItem.totalItemCount - 1;

    // Remove that item from cart - if the  quantity goes to or less than 0
    if (findItem.quantity <= 0) {
      myCartItem.itemList.splice(index, 1);
      this.snackBarHandler("Item removed from cart!");
    } else {
      myCartItem.itemList[index] = findItem;
      this.snackBarHandler("Item quantity decreased by 1!");
    }
    this.setState({ cartItems: myCartItem });
  };

  //Adding item from My Cart
  addAnItemFromCart = (addCartItem, index) => {
    this.snackBarHandler("Item quantity increased by 1!");
    const myCartItem = this.state.cartItems;
    let findItem = myCartItem.itemList[index];
    if (findItem !== undefined) {
      findItem.quantity = findItem.quantity + 1;
      findItem.totalItemPrice = findItem.totalItemPrice + findItem.item.price;
      myCartItem.totalPrice = myCartItem.totalPrice + findItem.item.price;
      myCartItem.totalItemCount = myCartItem.totalItemCount + 1;
    }
    myCartItem.itemList[index] = findItem;
    this.setState({ cartItems: myCartItem });
  };

  //Logout action from drop down menu on profile icon
  loginredirect = () => {
    sessionStorage.clear();
    this.props.history.push({
      pathname: "/",
    });
  };

  //SnackBar handler both open and close function
  snackBarHandler = (message) => {
    this.setState({ snackBarOpen: false });
    this.setState({ snackBarMessage: message });
    this.setState({ snackBarOpen: true });
  };

  //Checkout button
  //Passess the selected items and restaurant details to Checkout page
  checkOutCart = (e) => {
    const myCartItem = this.state.cartItems;
    if (myCartItem.itemList.length <= 0) {
      this.snackBarHandler("Please add an item to your cart!");
      return;
    } else {
      if (sessionStorage.getItem("foodapptoken") === null) {
        this.snackBarHandler("Please login first!");
        return;
      } else {
        sessionStorage.setItem(
          "restaurantDetails",
          JSON.stringify(this.state.resData)
        );
        //Redirecting to Checkout page
        this.props.history.push({
          pathname: "/checkout",
          state: {
            chcartItems: this.state.cartItems,
            totalCartItemsValue: this.state.cartItems.totalPrice,
          },
        });
      }
    }
  };

  render() {
    let $this = this;
    let headerProps = {
      routerProps: $this.props
    };
    return (
      <div className="mainDiv">
        {/* header */}
        <Header 
          routerProps={headerProps}
        />

        {/* main jumbotron section */}
        <div className="jumbotronSection">
          <div className="customRow topRow">
            <div className="segment image">
              {/* main image */}
              <img id="imageDisplay" className="img-responsive" alt={this.state.resData.restaurant_name} src={this.state.resData.photo_URL}/>
            </div>
            <div className="segment details">
              {/* heading, location and categories list */}
              <h1>{this.state.resData.restaurant_name}</h1>
              <span className="locationText">{this.state.locality}-{this.state.city}</span>
              <ul className="categoriesList">
                {(this.state.resData.categories || []).map((category, index) => {
                    return (
                      <li key={category.id}>
                        {category.category_name}
                        {index === this.state.resData.categories.length - 1 ? null : ","}
                      </li>
                    );
                  }
                )}
              </ul>

              {/* average rating and pricing for two section */}
              <div className="customRow">
                <div className="block rating">
                  <span className="ratingValue">
                    <i className="fa fa-star"></i>
                    {this.state.resData.customer_rating}
                  </span> 
                  <span className="ratingText">
                    Average Rating By <br/>{this.state.resData.number_customers_rated} Customers
                  </span>
                </div>
                <div className="block cost">
                  <span className="ratingValue">
                    <i className="fa fa-inr"></i>
                    {this.state.resData.average_price}
                  </span>
                  <span className="ratingText">
                    Average cost for <br/>Two People
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* food options, ordering and cart section */}
        <div className="orderSection">
          <div className="customRow topRow">
            {/* menu */}
            <div className="segment">
              {
                (this.state.resData.categories || []).map((category, index) => {
                  return (
                    <div className="menuGroup" key={category.id}>
                      <h2>{category.category_name}</h2> 
                      <Divider />

                      {/* items list */}
                      {
                        category.item_list.map((item, index) => {
                          return (
                            <div className="customRow itemRow" key={index}>
                              <div className="name">
                                {
                                  (item.item_type === "VEG") 
                                  ? 
                                  <i className="fa fa-circle"
                                    style={{
                                      color: "green",
                                      width: "1",
                                      height: "1",
                                    }}
                                    aria-hidden="true"
                                  ></i>
                                  : 
                                  <i
                                    className="fa fa-circle"
                                    style={{ color: "red" }}
                                    aria-hidden="true"
                                  ></i>
                                }
                                {item.item_name}
                              </div>
                              <div className="price">
                                <i className="fa fa-inr"></i> {item.price}
                              </div>
                              <div className="add">
                                <IconButton
                                  className="addButton"
                                  onClick={this.addToCart.bind(
                                    this,
                                    item,
                                    category
                                  )}
                                >
                                  <AddIcon />
                                </IconButton>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  );
                })
              }
            </div>
            {/* cart */}
            <div className="segment">
              <Card className="cardRoot">
                <CardContent className="cardContentRoot">
                  {/* heading */}
                  <Badge className="hideBadgeonModal"
                    badgeContent={
                      this.state.cartItems.totalItemCount === 0
                        ? "0"
                        : this.state.cartItems.totalItemCount
                    }
                    color="primary"
                  >
                    <ShoppingCartIcon />
                  </Badge>
                  <h3>My Cart</h3>

                  {/* items */}
                  {
                    (this.state.cartItems.itemList || []).map((cartItem, index) => {
                      return (
                        <div className="customRow cartItems" key={index + "c"}>
                          <div className="block name">
                            {
                              (cartItem.item.item_type === "VEG") ?
                              <i className="fa fa-stop-circle-o"
                                style={{
                                  color: "green",
                                  width: "1",
                                  height: "1",
                                }}
                                aria-hidden="true"
                              ></i>
                              :
                              <i
                                className="fa fa-stop-circle-o"
                                style={{ color: "red" }}
                                aria-hidden="true"
                              ></i>
                            }
                            {cartItem.item.item_name}
                          </div>
                          <div className="block quantity">
                            <IconButton
                              aria-label="Remove Item"
                              className="controls"
                              onClick={this.removeAnItemFromCart.bind(
                                this,
                                cartItem,
                                index
                              )}
                            >
                              <RemoveIcon
                                style={{
                                  fontSize: 22,
                                  fontWeight: "bold",
                                  fill: "black",
                                }}
                              />
                            </IconButton>
                            {cartItem.quantity}
                            <IconButton
                              aria-label="Add Item"
                              className="controls"
                              onClick={this.addAnItemFromCart.bind(
                                this,
                                cartItem,
                                index
                              )}
                            >
                              <AddIcon
                                style={{
                                  fontSize: 22,
                                  fontWeight: "bold",
                                  fill: "black",
                                }}
                              />
                            </IconButton>
                          </div>
                          <div className="block price">
                            <i className="fa fa-inr"></i>
                            {cartItem.totalItemPrice}
                          </div>
                        </div>
                      );
                    })
                  }

                  {/* total amount */}
                  <div className="customRow total">
                    <div className="block">
                      <span className="totalText">Total Amount</span>
                    </div>
                    <div className="block">
                        <i className="fa fa-inr"></i>
                        <span> {this.state.cartItems.totalPrice}</span>
                    </div>
                  </div>

                  {/* button */}
                  <Button variant="contained" color="primary" className="checkoutButton" onClick={this.checkOutCart.bind(this)}>
                    Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Snackbar
          key={"snack"}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          autoHideDuration={3000}
          open={this.state.snackBarOpen}
          onClose={() => this.setState({ snackBarOpen: false })}
          message={<span id="message-id">{this.state.snackBarMessage}</span>}
          action={
            <IconButton color="inherit">
              <CloseIcon />
            </IconButton>
          }
        />
      </div>
    );
  }
}
export default Details;

