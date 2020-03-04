import { extend } from "vee-validate";
import { required, email, required_if, alpha_dash, min, regex, is } from "vee-validate/dist/rules";

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

extend('regex', {
    ...regex,
    message: `Password must be atleast 8 characters and contain (1) lowercase letter, (1) uppercase letter, and (1) number`
});

extend('is', {
    ...is,
    message: `Passwords must match`
});