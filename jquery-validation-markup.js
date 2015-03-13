(function(root, $) {

  /**
  * This class validates a form, according to the
  * data in the HTML field
  *
  * @class jvm
  * @constructor
  * @param {String} form The ID/Class of the form
  */
  var jvm = function(form) {
    this.$form = $(form);

    this.initialize();
  };

  /**
  * Start all common configurations of Class
  *
  * @method initialize
  */
  jvm.prototype.initialize = function() {
    this.setValidation();
    this.updateDependencies();
  };

  /**
   * configuration to update all dependencies
   *
   * @method updateDependencies
   */
  jvm.prototype.updateDependencies = function() {
    var $inputsWithDependencies = this.$form.find('[data-jvm-depends]');

    $inputsWithDependencies.each($.proxy(this.getDependencyData, this));
  };

  /**
   * validates the dependency to configure the input
   *
   * @method  getDependencyData
   * @param  {Number} index the index of input
   * @param  {Object} input the reference to the input in the DOM
   */
  jvm.prototype.getDependencyData = function(index, input) {
    var $input = $(input),
      dependency = $input.data('jvm-depends');

    for(var index in dependency) {
      if(this.$form.find(index)[0].value !== dependency[index]) {
        this.updateInputValidation($input, true);
        return;
      }
    };

    this.updateInputValidation($input);
  };

  /**
   * switch the dependency accordint to parameters
   *
   * @method  updateInputValidation
   *
   * @param  {Object} $input the jQuery reference to the input beeing configured
   * @param  {Boolean} bool the flag of the configuration
   */
  jvm.prototype.updateInputValidation = function($input, noConfig) {
    var newConfig = {
      messages: {}
    },
    inputConfigs = $input.data('jvm-validate');

    if(noConfig) {
      $input.rules('remove');
      return;
    } else {
      for(var index in inputConfigs) {
        newConfig[index] = inputConfigs[index][0];
        newConfig.messages[index] = inputConfigs[index][1];
      }
    }

    $input.rules('add', newConfig);
  };

  /**
  * Start setting the validator configurations
  *
  * @method setValidation
  */
  jvm.prototype.setValidation = function() {
    var $toValidate = this.$form.find('[data-jvm-validate]');
    this.rules = {};
    this.messages = {};

    // sets rules and messages
    $toValidate.each($.proxy(this.getValidationData, this));

    $(this.$form).validate({
      rules: this.rules,
      messages: this.messages,
      showErrors: $.proxy(this.showErrors, this),
      submitHandler: $.proxy(this.checkBackend, this)
    });
  };

  /**
  * Get the configuration from each input
  *
  * @method getValidationData
  * @param {Number} index The index of the element
  * @param {Object} el The element itself
  */
  jvm.prototype.getValidationData = function(index, el) {
    var validationData = $(el).data('jvm-validate'),
      field = el.name;

    this.rules[field] = {};
    this.messages[field] = {};

    for(var index in validationData) {
      this.rules[field][index] = validationData[index][0];
      this.messages[field][index] = validationData[index][1];
    }
  };

  /**
  * set configuration for all errors
  *
  * @method showErrors
  * @param {Object} errorMap
  * @param {Array} errorList an array with all errors
  */
  jvm.prototype.showErrors = function(errorMap, errorList) {
    if (errorList.length === 0) this.removeErrors();

    for (var i = 0, l = errorList.length; i < l; i += 1) {
      var containerInput = $(errorList[i].element).parent();
      this.addError(containerInput, errorList[i].message);
    }
  };

  /**
  * add each error into the DOM
  *
  * @method addError
  * @param {Object} containerInput the jQuery reference to the elemnt
  * @param {String} message the error message
  */
  jvm.prototype.addError = function(containerInput, message) {
    spanErrosInput = $(containerInput).find('.jvm-error');

    if (spanErrosInput.length) {
      spanErrosInput.html(message);
    } else {
      containerInput.append('<span class="jvm-error">' + message + '</span>');
    }
  };

  /**
  * remove all errors in the form
  *
  * @method removeErrors
  */
  jvm.prototype.removeErrors = function() {
    $(this.$form).find('.jvm-error').remove();
  };

  /**
   * submits the form when all is validated
   *
   * @method formSubmit
   */
  jvm.prototype.formSubmit = function() {
    // this prevents an infinite looping
    this.$form[0].submit();
  };

  root.jvm = jvm;
} (window, jQuery));
