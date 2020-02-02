import { extend } from "vee-validate";
import { required, email, required_if, alpha_dash, min } from "vee-validate/dist/rules";

// INSTALL RULES
extend("required", {
  ...required,
  message: "* required"
});

extend('email', {
    ...email,
    message: 'invalid email address'
});

extend('required_if', {
    ...required_if,
    message: 'one option must be chosen'
});

extend('alpha_dash', {
    ...alpha_dash,
    message: 'can only contain (A-Z) (a-z) (0-9) (-) (_)'
});

extend('min', {
    ...min,
    message: `8 characters minimum`
});