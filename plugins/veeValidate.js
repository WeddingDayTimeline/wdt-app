import { extend } from "vee-validate";
import { required, email, required_if } from "vee-validate/dist/rules";

// install the 'required' rule.
extend("required", {
  ...required,
  message: "*required"
});

extend('email', {
    ...email,
    message: '*invalid email address'
});

extend('required_if', {
    ...required_if,
    message: '*one option must be chosen'
});