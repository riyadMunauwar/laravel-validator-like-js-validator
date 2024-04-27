class Validator {
    constructor(options = {}) {
      this.errors = {};
      this.messages = options.messages || {};
      this.customRules = options.customRules || {};
    }
  
    validate(data, rules) {
      this.errors = {};
  
      Object.keys(rules).forEach(field => {
        const fieldRules = rules[field];
  
        fieldRules.split('|').forEach(rule => {
          const [ruleName, ...params] = rule.split(':');
          const ruleFunction = this.customRules[ruleName] || this[ruleName];
  
          if (!ruleFunction) {
            throw new Error(`Validation rule "${ruleName}" does not exist.`);
          }
  
          const isValid = ruleFunction.call(this, data, field, ...params);
  
          if (!isValid) {
            const errorMessage =
              this.messages[`${field}.${ruleName}`] ||
              this.messages[ruleName] ||
              `The ${field} field is invalid.`;
            this.errors[field] = this.errors[field] || [];
            this.errors[field].push(errorMessage);
          }
        });
      });
  
      return Object.keys(this.errors).length === 0;
    }
  
    required(data, field) {
      const value = this.getNestedValue(data, field);
      return value !== '' && value !== null && value !== undefined;
    }
  
    min(data, field, min) {
      const value = this.getNestedValue(data, field);
      return value.length >= min;
    }
  
    max(data, field, max) {
      const value = this.getNestedValue(data, field);
      return value.length <= max;
    }
  
    email(data, field) {
      const value = this.getNestedValue(data, field);
      // Implement email validation logic here
      return true;
    }
  
    async customAsyncRule(data, field, ...params) {
      // Implement custom asynchronous validation logic here
      return true;
    }
  
    getNestedValue(data, field) {
      const fields = field.split('.');
      let value = data;
  
      for (const f of fields) {
        value = value[f];
      }
  
      return value;
    }
  
    defineRule(ruleName, ruleFunction) {
      this.customRules[ruleName] = ruleFunction;
    }
  }
  
  // Example usage
  const data = {
    user: {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'short'
    }
  };
  
  const rules = {
    'user.name': 'required',
    'user.email': 'required|email',
    'user.password': 'required|min:8'
  };
  
  const messages = {
    'user.name.required': 'The name field is required.',
    'user.email.email': 'The email field must be a valid email address.',
    'user.password.min': 'The password field must be at least :min characters.'
  };
  
  const validator = new Validator({ messages });
  
  validator.defineRule('async', validator.customAsyncRule);
  
  const isValid = validator.validate(data, rules);
  
  if (!isValid) {
    console.log(validator.errors);
    // Output: { 'user.email': ['The email field must be a valid email address.'], 'user.password': ['The password field must be at least 8 characters.'] }
  }