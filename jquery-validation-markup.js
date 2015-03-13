(function(root, $) {

  /**
  * Set some constants used along the validator
  */
  var SUBMIT_BUTTON = '#submit-form',
    EMAIL = {
      input: '#email',
      error: 'Email já cadastrado'
    },
    CPF = {
      input: '#cpf',
      error: 'CPF já cadastrado'
    },
    MASKS = {
      date: '99/99/9999',
      cpf: '999.999.999-99',
      tel: '9999-9999?9',
      cep: '99999-999'
    };

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

    this.valuesToDoubleCheck = {
      email: {
        field: this.$form.find(EMAIL.input),
        initialValue: this.$form.find(EMAIL.input).val()
      },
      cpf: {
        field: this.$form.find(CPF.input),
        initialValue: this.$form.find(CPF.input)
      }
    };

    this.initialize();
  };

  /**
  * Start all common configurations of Class
  *
  * @method initialize
  */
  jvm.prototype.initialize = function() {
    this.validatorCustomMethods();
    this.addListeners();
    this.setMasks();

    this.setValidation();
    this.updateDependencies();
  };

  /**
  * start configuration for masks
  *
  * @method setMasks
  */
  jvm.prototype.setMasks = function() {
    var $toMask = this.$form.find('[data-mask]');
    if($toMask.length) $toMask.each($.proxy(this.setEachMask, this));
  };

  /**
  * set mask for each element that has the data-mask
  *
  * @method setEachMask
  * @param {Number} index the index of element
  * @param {Object} element the element itself
  */
  jvm.prototype.setEachMask = function(index, element) {
    var $el = $(element);
    $el.mask(MASKS[$el.data('mask')]);
  };

  /**
  * Add listeners to the submit button
  *
  * @method addListeners
  */
  jvm.prototype.addListeners = function() {
    this.$form.find(SUBMIT_BUTTON).on('click', $.proxy(this.onSubmitbuttonClick, this));
  };

  /**
  * callback when submit
  *
  * @method onSubmitbuttonClick
  * @param {Object} e the "event" object from clicking a button
  */
  jvm.prototype.onSubmitbuttonClick = function(e) {
    e && e.preventDefault();
    this.$form.submit();
  };

  /**
  * Adds the custom methods to validator plugin
  *
  * @method validatorCustomMethods
  */
  jvm.prototype.validatorCustomMethods = function() {
    $.validator.addMethod('cpf', function(value) {
      return NS.helpers.isCPF(value);
    });

    $.validator.addMethod('lettersonly', function(value, element) {
      return this.optional(element) || /[a-zA-ZáéíóúàâêôãõüçÁÉÍÓÚÀÂÊÔÃÕÜÇ ]/g.test(value);
    });

    $.validator.addMethod('expression', function(value, element) {
      return this.optional(element) || /.+@+.+\..+/i.test(value);
    });

    $.validator.addMethod('datecustom', function(value) {
      var regex = /^((((0?[1-9]|1\d|2[0-8])\/(0?[1-9]|1[0-2]))|((29|30)\/(0?[13456789]|1[0-2]))|(31\/(0?[13578]|1[02])))\/((19|20)?\d\d))$|((29\/0?2\/)((19|20)?(0[48]|[2468][048]|[13579][26])|(20)?00))$/;
      return regex.exec(value);
    });

    $.validator.addMethod('phone', function(value) {
      var phone = value.split('_').join('');
      if (phone.length < 9) {
        return false;
      } else {
        return true;
      }
    });
  };

  /**
   * configuration to update all dependencies
   *
   * @method updateDependencies
   */
  jvm.prototype.updateDependencies = function() {
    var $inputsWithDependencies = this.$form.find('[data-depends]');

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
      dependency = $input.data('depends');

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
    inputConfigs = $input.data('validate');

    if(noConfig) {
      newConfig = false;
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
    var $toValidate = this.$form.find('[data-validate]');
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
    var validationData = $(el).data('validate'),
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
    spanErrosInput = $(containerInput).find('.form-error');

    if (spanErrosInput.length) {
      spanErrosInput.html(message);
    } else {
      containerInput.append('<span class="form-error">' + message + '</span>');
    }
  };

  /**
  * remove all errors in the form
  *
  * @method removeErrors
  */
  jvm.prototype.removeErrors = function() {
    $(this.$form).find('.form-error').remove();
  };

  /**
  * start configuration to check backend
  *
  * @method checkBackend
  */
  jvm.prototype.checkBackend = function() {
    var arrCheck = [];

    for(var index in this.valuesToDoubleCheck) {
      if(this.valuesToDoubleCheck[index].field.length) {
        arrCheck.push(this['check' + index](this.valuesToDoubleCheck[index].field.val()));
      }
    }

    if(arrCheck.length) {
      $.when.apply($, arrCheck).done($.proxy(this.backendCallback, this));
    } else {
      this.formSubmit();
    }
  };

  /**
  * callback to all backend requisitions
  *
  * @method backendCallback
  */
  jvm.prototype.backendCallback = function() {
    var item,
      existCount = 0;

    for(var index in arguments) {
      item = arguments[index];

      if(item.exist) {
        existCount += 1;
        this.addError(item.$el.parent(), item.errorMessage);
      }
    }

    if(!existCount) this.formSubmit();
  };

  /**
  * check if email exist in the backend
  *
  * @method checkemail
  * @param {String} email the email to check
  */
  jvm.prototype.checkemail = function(email) {
    var deferred = $.Deferred();

    nsEmailAjaxService.isEmailExists(email, $.proxy(function(data) {
      var dataToReturn;

      if(this.valuesToDoubleCheck.email.initialValue === email) {
        dataToReturn = {
          exist: false
        };
      } else {
        dataToReturn = {
          exist: data,
          errorMessage: EMAIL.error,
          $el: this.valuesToDoubleCheck.email.field
        };
      }

      deferred.resolve(dataToReturn);
    }, this));

    return deferred.promise();
  };

  /**
  * check if cpf exist in the backend
  *
  * @method checkcpf
  * @param {String} cpf the cpf to check
  */
  jvm.prototype.checkcpf = function(cpf) {
    var deferred = $.Deferred();

    nsCpfAjaxService.isCpfExists(NS.helpers.clearCPF(cpf), $.proxy(function(data) {
      var dataToReturn;

      if(this.valuesToDoubleCheck.cpf.initialValue === cpf) {
        dataToReturn = {
          exist: false
        };
      } else {
        dataToReturn = {
          exist: data,
          errorMessage: CPF.error,
          $el: this.valuesToDoubleCheck.cpf.field
        };
      }

      deferred.resolve(dataToReturn);
    }, this));

    return deferred.promise();
  };

  /**
   * submits the form when all is validated
   *
   * @method formSubmit
   */
  jvm.prototype.formSubmit = function() {
    // this.$form.submit();
    // this prevents an infinite looping
    this.$form[0].submit();
  };

  root.jvm = jvm;
} (window, jQuery));
