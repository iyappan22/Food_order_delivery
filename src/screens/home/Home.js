/* react imports */
import React, { Component } from "react";
import { Link } from "react-router-dom";

/* mateiral ui imports */
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';

/* font awesome imports */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faRupeeSign } from '@fortawesome/free-solid-svg-icons'

/* project imports */
import "./Home.scss";
import Header from "../../common/header/Header.js";

const ListOfRestaurants = (props) => {
  let { restaurants } = props;
  return (
    <div className="restaurantsContainer">
      {
        restaurants.map(function (obj, index) {
          return (
            <Card className="restaurantCard" key={obj.id}>
              <Link to={"/restaurant/" + obj.id} style={{ color: "#000000", textDecoration: "none" }}>
                <CardMedia image={obj.photo_URL} title={obj.restaurant_name} className="cardMediaHolder" />
                <CardContent className="cardContent">
                  {/* name */}
                  <h2>{obj.restaurant_name}</h2>

                  {/* category list */}
                  <ul className="categoryList">
                    {
                      obj.categories.split(", ").map(function (tag, index) {
                        return (
                          <li key={obj.id + "-category" + index}>{tag}</li>
                        );
                      })
                    }
                  </ul>

                  {/* footer section */}
                  <div className="footer customRow">
                    <div className="segment">
                      <span className="ratingElement">
                        <FontAwesomeIcon className="starIcon" icon={faStar} />
                        <span className="content">
                          {obj.customer_rating} ({obj.number_customers_rated})
                        </span>
                      </span>
                    </div>
                    <div className="segment">
                      <FontAwesomeIcon className="starIcon" icon={faRupeeSign} />
                      {obj.average_price} for Two
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          )
        })
      }
    </div>
  );
};

class Home extends Component {
  /* render */
  render() {
    let $this = this;
    let headerProps = {
      routerProps: $this.props
    };
    return (
      <React.Fragment>
        {/* header */}
        <Header
          routerProps={headerProps}
          fetchRestaurants={$this.props.fetchRestaurants}
          searchRestaurantsByName={$this.props.searchRestaurantsByName}
        />
        {/* template the data here */}
        {
          "restaurants" in $this.props && $this.props.restaurants.length > 0 ?
            <ListOfRestaurants restaurants={$this.props.restaurants} />
            : <p>No restaurant with the given name</p>
        }
      </React.Fragment>
    );
  }
}
export default Home
