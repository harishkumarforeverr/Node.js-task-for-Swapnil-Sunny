// using validator library is  Validatorjs
module.exports = class UserValidator {
  login() {
    // Define rules for varify data
    return {
      password: "required",
      email: "required|email",
    };
  }
  setstatuscreateApp(){
    return {};
}
  addUser() {
    return {
      name: "required",
      password: "required|passwordValidation",
      email: "required|email",
    };
  }

  loginWithOTP() {
    return {
      current_otp: "required",
      password: "required",
      email: "required|email",
    };
  }

  editUser() {
    return {
      name: "required",
    };
  }

  generateOTP() {
    return {
      email: "required"
    };
  }

  verifyOTP() {
    return {
      email: "required",
      otp: "required"
    };
  }

  editPassword() {
    return {
      email: "required",
      password: "required"
    };
  }


  editProfilePassword() {
    return {
      email: "required",
      oldpass: "required",
      newpass: "required",
    };
  }

  getUser() {
    // Define rules for varify data
    return {};
  }
  getActiveroles() {
    // Define rules for varify data
    return {};
  }

  getUserByID(){
    return {
      _id: "required",
    };
  }

  profile(){
    return {
      _id: "required",
    };
  }

  checkDuplicate() {
    return {
      column_name: "required",
      data: "required",
    };
  }
};
