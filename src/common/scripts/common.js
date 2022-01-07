/**
  * some common scripts for the application with some
  * useful utilty functions 
  **/

const Utilities = {
  isValidContactNumber(value) {
    return /^\d+$/.test(value) && value.length === 10;
  },
  isValidPassword(value) {
    let pwdTest = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/;
    return value.length >= 8 && pwdTest.test(value);
  },
  isValidEmail(value) {
    let re = /\S+@\S+\.\S+/;
    return re.test(value);
  }
};

export default Utilities;
