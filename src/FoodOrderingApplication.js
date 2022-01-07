/* react imports */
import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

/* package imports */
import axios from "axios";

/* project imports */
import Home from "./screens/home/Home.js";
import Checkout from "./screens/checkout/Checkout.js";
import Details from "./screens/details/Details";

class FoodOrderingApplication extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      template: []
    };
    this.baseUrl = "http://localhost:8080/api/";
    this.searchApi = null;
  }

  /* fetches the restaurant data before the app is loaded and rendered */
  fetchRestaurants() {
    let $this = this;
    let url = "http://localhost:8080/api/restaurant";
    let requestConfig = {
      url: url,
      method: "get",
      responseType: "json"
    };
    axios(requestConfig).then(function (response) {
      if (response.statusText === "OK" || response.status === 200) {
        $this.setState({ data: response.data.restaurants, template: response.data.restaurants });
      }
    })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
  };

  /* helps to perform the necessary search on the set of restaurant data and filter */
  searchRestaurantsByName(name) {
    let $this = this;
    clearTimeout($this.searchApi);
    $this.searchApi = null;
    $this.searchApi = setTimeout(function () {
      $this.performSearchApi(name);
    }, 500);
  }

  performSearchApi(name) {
    let $this = this;
    if (name === "") {
      $this.fetchRestaurants();
    }
    else {
      let requestConfig = {
        url: "http://localhost:8080/api/restaurant/name/" + name,
        method: "get",
        responseType: "json"
      };
      axios(requestConfig).then(function (response) {
        console.log(response);
        if (response.statusText === "OK" || response.status === 200) {
          let searchResults = (response.data.restaurants !== null) ? response.data.restaurants : [];
          $this.setState({ template: searchResults });
        }
        else {
          $this.setState({ template: [] });
        }
      })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          console.log(error.config);
          $this.setState({ template: [] });
        });
    }
  };

  /* render */
  render() {
    let $this = this;
    let arrayOfRestaurantsToRender = $this.state.template;
    return <React.Fragment>
      <Router>
        <div className="main-container">
          {/* home */}
          <Route exact path="/" render={(props) => <Home {...props} baseUrl={this.baseUrl} restaurants={arrayOfRestaurantsToRender} fetchRestaurants={$this.fetchRestaurants.bind($this)} searchRestaurantsByName={$this.searchRestaurantsByName.bind($this)} />} />

          {/* details */}
          <Route exact path="/restaurant/:id" render={(props) => <Details {...props} baseUrl={this.baseUrl} />} />

          {/* checkout */}
          <Route exact path="/checkout" render={(props) => <Checkout {...props} baseUrl={this.baseUrl} />} />
        </div>
      </Router>
    </React.Fragment>;
  }
}
export default FoodOrderingApplication;
