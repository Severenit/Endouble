(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Menu;
var $body = $('body');
var $menuOverlay = $('.header__overlay');
var $menuBurger = $('.header__burger-menu');

function Menu() {
    $menuBurger.on('click', function () {
        if (!$menuOverlay.hasClass('active')) {
            $menuOverlay.fadeIn().toggleClass('active');
            $body.css('overflow', 'hidden');
        } else {
            $menuOverlay.fadeOut(function () {
                $menuOverlay.css('display', '');
            }).removeClass('active');
            $body.css('overflow', '');
        }
        $(this).toggleClass("menu-on");
    });
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.app = undefined;

var _Menu = require('./Menu');

var _Menu2 = _interopRequireDefault(_Menu);

var _parallax = require('./parallax');

var _parallax2 = _interopRequireDefault(_parallax);

var _datapicker = require('./datapicker');

var _notification = require('./notification');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = exports.app = {
    _root: {
        dirty: 'dirty',
        files: {},
        hasError: 'has-error',
        hasSuccess: 'has-success'
    },
    init: function init() {
        this.setUpListeners();
        (0, _Menu2.default)();
        (0, _parallax2.default)();
        (0, _datapicker.Datapicker)();
    },
    setUpListeners: function setUpListeners() {
        $('form').on('submit', app.submitForm);

        $('form input').on('focus', app.onFocusInput);
        $('form textarea').on('focus', app.onFocusInput);

        $('form input').on('input', app.validateInput);
        $('form textarea').on('input', app.validateInput);

        $('form input').on('keydown', app.leaveInputFocus);
        $('form textarea').on('keydown', app.leaveInputFocus);

        $('input[type=file]').on('change', app.prepareUpload);

        _datapicker.$datapicker.on('change', app.validateInput);
    },
    submitForm: function submitForm(e) {
        e.stopPropagation(); // Stop stuff happening
        e.preventDefault();
        var valid = true;
        var formData = new FormData();

        $.each($('input'), function (key, val) {
            var input = $(val);
            var inputVal = input.val();
            var required = input.attr('required');
            var name = input.attr('id') ? input.attr('id').toLowerCase() : 'undefiend';
            var parent = input.parent();

            if (input.attr('type') === 'radio' || input.attr('type') === 'checkbox') {
                formData.append(name, input.prop("checked"));
            } else {
                if (inputVal.length === 0 && !!required) {
                    app.addErrorClass(parent);
                    valid = false;
                } else if (inputVal.length > 0) {
                    formData.append(name, inputVal);
                    app.addSuccessClass(parent);
                }
            }
        });

        $.each($('textarea'), function (key, val) {
            var input = $(val);
            var inputVal = input.val();
            var required = input.attr('required');
            var parent = input.parent();

            if (inputVal.length === 0 && !!required) {
                app.addErrorClass(parent);
                valid = false;
            } else if (inputVal.length > 0) {
                formData.append(input.attr('id').toLowerCase(), inputVal);
                app.addSuccessClass(parent);
            }
        });

        $.each(Object.keys(app._root.files), function (key, val) {
            formData.append('uploads[]', app._root.files[val], app._root.files[val].name);
        });

        formData.append('title', 'Apply for the position of Purchasing assistant');

        if (valid) {
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function success(data) {
                    $.each($('input'), function (key, val) {
                        var input = $(val);
                        input.val('');
                        app.removeErrorClass(input.parent());
                        app.removeSuccessClass(input.parent());
                    });
                    $.each($('textarea'), function (key, val) {
                        var input = $(val);
                        app.removeErrorClass(input.parent());
                        app.removeSuccessClass(input.parent());
                        input.val('');
                    });
                    (0, _notification.openNotification)('info', data, 'Your application has been accepted. We\'ll contact you, asap.');
                },
                error: function error(err) {
                    (0, _notification.openNotification)('warning', 'Something went wrong', 'Try to please a little bit later...');
                }
            });
        }
    },
    onFocusInput: function onFocusInput() {
        $(this).addClass(app._root.dirty).removeClass(app._root.hasError);
    },
    validateForm: function validateForm(form) {
        var inputs = form.find('input');
        var valid = true;

        $.each(inputs, function (index, value) {
            var input = $(value);
            var dirty = input.hasClass(app._root.dirty);
            var val = input.val();
            var parent = input.parent();

            if (val.length === 0 && dirty) {
                app.addErrorClass(parent);
            } else {
                app.removeErrorClass(parent);
            }
        });

        return valid;
    },
    validateInput: function validateInput() {
        var input = $(this);
        var parent = input.parent();
        var val = input.val();
        var required = input.attr('required');
        var type = input.attr('type');

        if (val.length > 1) {
            app.addSuccessClass(parent);
        } else {
            app.removeSuccessClass(parent);
        }

        if (type === 'email') {
            if (app.validateEmail(val)) {
                app.addSuccessClass(parent);
            } else {
                app.removeSuccessClass(parent);
            }
        }
    },
    leaveInputFocus: function leaveInputFocus(e) {
        var input = $(this);
        var parent = input.parent();
        var dirty = input.hasClass(app._root.dirty);
        var val = input.val();
        var required = input.attr('required');
        var type = input.attr('type');

        if (e.keyCode === 9) {
            if (dirty && !!required && val.length < 2) {
                app.addErrorClass(parent);
            } else if (type === 'email') {
                if (!app.validateEmail(val)) {
                    app.addErrorClass(parent);
                }
            }
        } else {}
    },
    validateEmail: function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    prepareUpload: function prepareUpload(e) {
        var input = $(this);
        var parent = $(this).parent();
        var file = e.target.files[0];
        var re = /^.*\.(jpg|JPG|txt|TXT|doc|DOC|docx|DOCX|pdf|PDF)$/;

        if (re.test(file.name) && file.size < 4194304) {
            app._root.files[input.attr('id')] = e.target.files[0];
            app.addSuccessClass(parent);
        } else {
            input.val('');
            app.addErrorClass(parent);
            delete app._root.files[input.attr('id')];
        }
    },
    addSuccessClass: function addSuccessClass(elem) {
        elem.addClass(app._root.hasSuccess).removeClass(app._root.hasError);
    },
    addErrorClass: function addErrorClass(elem) {
        elem.addClass(app._root.hasError).removeClass(app._root.hasSuccess);
    },
    removeSuccessClass: function removeSuccessClass(elem) {
        elem.removeClass(app._root.hasSuccess);
    },
    removeErrorClass: function removeErrorClass(elem) {
        elem.removeClass(app._root.hasError);
    }
};

},{"./Menu":1,"./datapicker":3,"./notification":5,"./parallax":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Datapicker = Datapicker;
var $datapicker = exports.$datapicker = $("#Birthday");

function Datapicker() {
    $datapicker.datepicker({
        changeMonth: true,
        changeYear: true
    });
}

},{}],4:[function(require,module,exports){
'use strict';

var _app = require('./app');

_app.app.init();

},{"./app":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.openNotification = openNotification;
exports.closeNotification = closeNotification;
var $notification = $('.notification');

$notification.on('click', '.notification-close', function () {
    closeNotification();
});

function openNotification(type, title, text) {
    $notification.addClass('open').addClass(type).find('.notification-title').text(title).parent().find('.notification-message').text(text);

    setTimecloseNotification();
}

function closeNotification() {
    $notification.removeClass('open').removeClass('info success warning danger');
}

function setTimecloseNotification() {
    setTimeout(function () {
        closeNotification();
    }, 10000);
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = Parallax;
var $parallax = $('.parallax__header');
var $parallaxBG = $parallax.find('.parallax__bg');

function Parallax() {
    $(window).on('scroll', function () {
        var _scrollTop = $(this).scrollTop();
        if (_scrollTop < $parallax.height()) {
            $parallaxBG.css({
                transform: 'translate3d(0px,' + $(window).scrollTop() * 0.2 + 'px,0px) scale(1.2)'
            });
        } else {
            return true;
        }
    });
}

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvTWVudS5qcyIsImFwcC9qcy9hcHAuanMiLCJhcHAvanMvZGF0YXBpY2tlci5qcyIsImFwcC9qcy9tYWluLmpzIiwiYXBwL2pzL25vdGlmaWNhdGlvbi5qcyIsImFwcC9qcy9wYXJhbGxheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLElBQU0sUUFBUSxFQUFkLEFBQWMsQUFBRTtBQUNoQixJQUFNLGVBQWUsRUFBckIsQUFBcUIsQUFBRTtBQUN2QixJQUFNLGNBQWMsRUFBcEIsQUFBb0IsQUFBRSxBQUV0Qjs7QUFBZSxTQUFBLEFBQVMsT0FBTyxBQUMzQjtnQkFBQSxBQUFZLEdBQVosQUFBZSxTQUFTLFlBQVUsQUFDOUI7WUFBRyxDQUFDLGFBQUEsQUFBYSxTQUFqQixBQUFJLEFBQXNCLFdBQVcsQUFDakM7eUJBQUEsQUFBYSxTQUFiLEFBQXNCLFlBQXRCLEFBQWtDLEFBQ2xDO2tCQUFBLEFBQU0sSUFBTixBQUFVLFlBQVYsQUFBc0IsQUFDekI7QUFIRCxlQUdPLEFBQ0g7eUJBQUEsQUFBYSxRQUFRLFlBQVksQUFDN0I7NkJBQUEsQUFBYSxJQUFiLEFBQWlCLFdBQWpCLEFBQTRCLEFBQy9CO0FBRkQsZUFBQSxBQUVHLFlBRkgsQUFFZSxBQUNmO2tCQUFBLEFBQU0sSUFBTixBQUFVLFlBQVYsQUFBc0IsQUFDekI7QUFDRDtVQUFBLEFBQUUsTUFBRixBQUFRLFlBQVIsQUFBb0IsQUFDdkI7QUFYRCxBQVlIOzs7Ozs7Ozs7OztBQ2pCRCxBQUFPLEFBQVU7Ozs7QUFDakIsQUFBTyxBQUFjOzs7O0FBQ3JCLEFBQVMsQUFBWSxBQUFtQjs7QUFDeEMsQUFBUyxBQUF3QixBQUVqQzs7OztBQUFPLElBQU07O2VBQ0YsQUFDSSxBQUNQO2VBRkcsQUFFSSxBQUNQO2tCQUhHLEFBR08sQUFDVjtvQkFMVyxBQUNSLEFBSVMsQUFFaEI7QUFOTyxBQUNIO1VB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LEFBQWUsQUFFbkM7O0FBQWUsU0FBQSxBQUFTLFdBQVcsQUFDL0I7TUFBQSxBQUFFLFFBQUYsQUFBVSxHQUFWLEFBQWEsVUFBVSxZQUFZLEFBQy9CO1lBQUksYUFBYSxFQUFBLEFBQUUsTUFBbkIsQUFBaUIsQUFBUSxBQUN6QjtZQUFJLGFBQWEsVUFBakIsQUFBaUIsQUFBVSxVQUFVLEFBQ2pDO3dCQUFBLEFBQVk7MkJBQ0cscUJBQXFCLEVBQUEsQUFBRSxRQUFGLEFBQVUsY0FBL0IsQUFBNkMsTUFENUQsQUFBZ0IsQUFDa0QsQUFFckU7QUFIbUIsQUFDWjtBQUZSLGVBSU8sQUFDSDttQkFBQSxBQUFPLEFBQ1Y7QUFDSjtBQVRELEFBVUgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgJGJvZHkgPSAkKCdib2R5Jyk7XG5jb25zdCAkbWVudU92ZXJsYXkgPSAkKCcuaGVhZGVyX19vdmVybGF5Jyk7XG5jb25zdCAkbWVudUJ1cmdlciA9ICQoJy5oZWFkZXJfX2J1cmdlci1tZW51Jyk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1lbnUoKSB7XG4gICAgJG1lbnVCdXJnZXIub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoISRtZW51T3ZlcmxheS5oYXNDbGFzcygnYWN0aXZlJykpIHtcbiAgICAgICAgICAgICRtZW51T3ZlcmxheS5mYWRlSW4oKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkYm9keS5jc3MoJ292ZXJmbG93JywgJ2hpZGRlbicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJG1lbnVPdmVybGF5LmZhZGVPdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRtZW51T3ZlcmxheS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgICAgICAgICB9KS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkYm9keS5jc3MoJ292ZXJmbG93JywgJycpO1xuICAgICAgICB9XG4gICAgICAgICQodGhpcykudG9nZ2xlQ2xhc3MoXCJtZW51LW9uXCIpO1xuICAgIH0pO1xufSIsImltcG9ydCBNZW51IGZyb20gJy4vTWVudSc7XG5pbXBvcnQgUGFyYWxsYXggZnJvbSAnLi9wYXJhbGxheCc7XG5pbXBvcnQgeyBEYXRhcGlja2VyLCAkZGF0YXBpY2tlciB9IGZyb20gJy4vZGF0YXBpY2tlcic7XG5pbXBvcnQgeyBvcGVuTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xuXG5leHBvcnQgY29uc3QgYXBwID0ge1xuICAgIF9yb290OiB7XG4gICAgICAgIGRpcnR5OiAnZGlydHknLFxuICAgICAgICBmaWxlczoge30sXG4gICAgICAgIGhhc0Vycm9yOiAnaGFzLWVycm9yJyxcbiAgICAgICAgaGFzU3VjY2VzczogJ2hhcy1zdWNjZXNzJ1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFVwTGlzdGVuZXJzKCk7XG4gICAgICAgIE1lbnUoKTtcbiAgICAgICAgUGFyYWxsYXgoKTtcbiAgICAgICAgRGF0YXBpY2tlcigpO1xuICAgIH0sXG4gICAgc2V0VXBMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnZm9ybScpLm9uKCdzdWJtaXQnLCBhcHAuc3VibWl0Rm9ybSk7XG5cbiAgICAgICAgJCgnZm9ybSBpbnB1dCcpLm9uKCdmb2N1cycsIGFwcC5vbkZvY3VzSW5wdXQpO1xuICAgICAgICAkKCdmb3JtIHRleHRhcmVhJykub24oJ2ZvY3VzJywgYXBwLm9uRm9jdXNJbnB1dCk7XG5cbiAgICAgICAgJCgnZm9ybSBpbnB1dCcpLm9uKCdpbnB1dCcsIGFwcC52YWxpZGF0ZUlucHV0KTtcbiAgICAgICAgJCgnZm9ybSB0ZXh0YXJlYScpLm9uKCdpbnB1dCcsIGFwcC52YWxpZGF0ZUlucHV0KTtcblxuICAgICAgICAkKCdmb3JtIGlucHV0Jykub24oJ2tleWRvd24nLCBhcHAubGVhdmVJbnB1dEZvY3VzKTtcbiAgICAgICAgJCgnZm9ybSB0ZXh0YXJlYScpLm9uKCdrZXlkb3duJywgYXBwLmxlYXZlSW5wdXRGb2N1cyk7XG5cbiAgICAgICAgJCgnaW5wdXRbdHlwZT1maWxlXScpLm9uKCdjaGFuZ2UnLCBhcHAucHJlcGFyZVVwbG9hZCk7XG5cbiAgICAgICAgJGRhdGFwaWNrZXIub24oJ2NoYW5nZScsIGFwcC52YWxpZGF0ZUlucHV0KTtcbiAgICB9LFxuICAgIHN1Ym1pdEZvcm06IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7IC8vIFN0b3Agc3R1ZmYgaGFwcGVuaW5nXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgbGV0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgICAgJC5lYWNoKCQoJ2lucHV0JyksIGZ1bmN0aW9uICgga2V5LCB2YWwgKSB7XG4gICAgICAgICAgICBjb25zdCBpbnB1dCA9ICQodmFsKTtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0VmFsID0gaW5wdXQudmFsKCk7XG4gICAgICAgICAgICBjb25zdCByZXF1aXJlZCA9IGlucHV0LmF0dHIoJ3JlcXVpcmVkJyk7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gaW5wdXQuYXR0cignaWQnKSA/IGlucHV0LmF0dHIoJ2lkJykudG9Mb3dlckNhc2UoKSA6ICd1bmRlZmllbmQnO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gaW5wdXQucGFyZW50KCk7XG5cbiAgICAgICAgICAgIGlmIChpbnB1dC5hdHRyKCd0eXBlJykgPT09ICdyYWRpbycgfHwgaW5wdXQuYXR0cigndHlwZScpID09PSAnY2hlY2tib3gnKSB7XG4gICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKG5hbWUsIGlucHV0LnByb3AoXCJjaGVja2VkXCIpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlucHV0VmFsLmxlbmd0aCA9PT0gMCAmJiAhIXJlcXVpcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5hZGRFcnJvckNsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbnB1dFZhbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChuYW1lLCBpbnB1dFZhbCk7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5hZGRTdWNjZXNzQ2xhc3MocGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQuZWFjaCgkKCd0ZXh0YXJlYScpLCBmdW5jdGlvbiAoIGtleSwgdmFsICkge1xuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSAkKHZhbCk7XG4gICAgICAgICAgICBjb25zdCBpbnB1dFZhbCA9IGlucHV0LnZhbCgpO1xuICAgICAgICAgICAgY29uc3QgcmVxdWlyZWQgPSBpbnB1dC5hdHRyKCdyZXF1aXJlZCcpO1xuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gaW5wdXQucGFyZW50KCk7XG5cbiAgICAgICAgICAgIGlmIChpbnB1dFZhbC5sZW5ndGggPT09IDAgJiYgISFyZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgIGFwcC5hZGRFcnJvckNsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5wdXRWYWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChpbnB1dC5hdHRyKCdpZCcpLnRvTG93ZXJDYXNlKCksIGlucHV0VmFsKTtcbiAgICAgICAgICAgICAgICBhcHAuYWRkU3VjY2Vzc0NsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQuZWFjaChPYmplY3Qua2V5cyhhcHAuX3Jvb3QuZmlsZXMpLCBmdW5jdGlvbiAoIGtleSwgdmFsICkge1xuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCd1cGxvYWRzW10nLCBhcHAuX3Jvb3QuZmlsZXNbdmFsXSwgYXBwLl9yb290LmZpbGVzW3ZhbF0ubmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgndGl0bGUnLCAnQXBwbHkgZm9yIHRoZSBwb3NpdGlvbiBvZiBQdXJjaGFzaW5nIGFzc2lzdGFudCcpO1xuXG4gICAgICAgIGlmICh2YWxpZCkge1xuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvdXBsb2FkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YTogZm9ybURhdGEsXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgICAgICAgICAgICAgICQuZWFjaCgkKCdpbnB1dCcpLCBmdW5jdGlvbiAoIGtleSwgdmFsICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSAkKHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWwoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnJlbW92ZUVycm9yQ2xhc3MoaW5wdXQucGFyZW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnJlbW92ZVN1Y2Nlc3NDbGFzcyhpbnB1dC5wYXJlbnQoKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAkLmVhY2goJCgndGV4dGFyZWEnKSwgZnVuY3Rpb24gKCBrZXksIHZhbCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gJCh2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnJlbW92ZUVycm9yQ2xhc3MoaW5wdXQucGFyZW50KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnJlbW92ZVN1Y2Nlc3NDbGFzcyhpbnB1dC5wYXJlbnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dC52YWwoJycpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgb3Blbk5vdGlmaWNhdGlvbignaW5mbycsIGRhdGEsICdZb3VyIGFwcGxpY2F0aW9uIGhhcyBiZWVuIGFjY2VwdGVkLiBXZVxcJ2xsIGNvbnRhY3QgeW91LCBhc2FwLicpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKCBlcnIgKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZW5Ob3RpZmljYXRpb24oJ3dhcm5pbmcnLCAnU29tZXRoaW5nIHdlbnQgd3JvbmcnLCAnVHJ5IHRvIHBsZWFzZSBhIGxpdHRsZSBiaXQgbGF0ZXIuLi4nKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBvbkZvY3VzSW5wdXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKVxuICAgICAgICAgICAgLmFkZENsYXNzKGFwcC5fcm9vdC5kaXJ0eSlcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhhcHAuX3Jvb3QuaGFzRXJyb3IpO1xuICAgIH0sXG4gICAgdmFsaWRhdGVGb3JtOiBmdW5jdGlvbiAoIGZvcm0gKSB7XG4gICAgICAgIGNvbnN0IGlucHV0cyA9IGZvcm0uZmluZCgnaW5wdXQnKTtcbiAgICAgICAgbGV0IHZhbGlkID0gdHJ1ZTtcblxuICAgICAgICAkLmVhY2goaW5wdXRzLCBmdW5jdGlvbiAoIGluZGV4LCB2YWx1ZSApIHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gJCh2YWx1ZSk7XG4gICAgICAgICAgICBjb25zdCBkaXJ0eSA9IGlucHV0Lmhhc0NsYXNzKGFwcC5fcm9vdC5kaXJ0eSk7XG4gICAgICAgICAgICBjb25zdCB2YWwgPSBpbnB1dC52YWwoKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IGlucHV0LnBhcmVudCgpO1xuXG4gICAgICAgICAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCAmJiBkaXJ0eSkge1xuICAgICAgICAgICAgICAgIGFwcC5hZGRFcnJvckNsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFwcC5yZW1vdmVFcnJvckNsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgIH0sXG4gICAgdmFsaWRhdGVJbnB1dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBpbnB1dCA9ICQodGhpcylcbiAgICAgICAgY29uc3QgcGFyZW50ID0gaW5wdXQucGFyZW50KCk7XG4gICAgICAgIGNvbnN0IHZhbCA9IGlucHV0LnZhbCgpO1xuICAgICAgICBjb25zdCByZXF1aXJlZCA9IGlucHV0LmF0dHIoJ3JlcXVpcmVkJyk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBpbnB1dC5hdHRyKCd0eXBlJyk7XG5cbiAgICAgICAgaWYgKHZhbC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBhcHAuYWRkU3VjY2Vzc0NsYXNzKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhcHAucmVtb3ZlU3VjY2Vzc0NsYXNzKHBhcmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSA9PT0gJ2VtYWlsJykge1xuICAgICAgICAgICAgaWYgKGFwcC52YWxpZGF0ZUVtYWlsKHZhbCkpIHtcbiAgICAgICAgICAgICAgICBhcHAuYWRkU3VjY2Vzc0NsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFwcC5yZW1vdmVTdWNjZXNzQ2xhc3MocGFyZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgbGVhdmVJbnB1dEZvY3VzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zdCBpbnB1dCA9ICQodGhpcyk7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGlucHV0LnBhcmVudCgpO1xuICAgICAgICBjb25zdCBkaXJ0eSA9IGlucHV0Lmhhc0NsYXNzKGFwcC5fcm9vdC5kaXJ0eSk7XG4gICAgICAgIGNvbnN0IHZhbCA9IGlucHV0LnZhbCgpO1xuICAgICAgICBjb25zdCByZXF1aXJlZCA9IGlucHV0LmF0dHIoJ3JlcXVpcmVkJyk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBpbnB1dC5hdHRyKCd0eXBlJyk7XG5cbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gOSkge1xuICAgICAgICAgICAgaWYgKGRpcnR5ICYmICEhcmVxdWlyZWQgJiYgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICBhcHAuYWRkRXJyb3JDbGFzcyhwYXJlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZW1haWwnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhcHAudmFsaWRhdGVFbWFpbCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5hZGRFcnJvckNsYXNzKHBhcmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgIH1cbiAgICB9LFxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICAgIGNvbnN0IHJlID0gL14oKFtePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSsoXFwuW148PigpXFxbXFxdXFxcXC4sOzpcXHNAXCJdKykqKXwoXCIuK1wiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG4gICAgICAgIHJldHVybiByZS50ZXN0KGVtYWlsKTtcbiAgICB9LFxuICAgIHByZXBhcmVVcGxvYWQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnN0IGlucHV0ID0gJCh0aGlzKTtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICBjb25zdCByZSA9IC9eLipcXC4oanBnfEpQR3x0eHR8VFhUfGRvY3xET0N8ZG9jeHxET0NYfHBkZnxQREYpJC87XG5cbiAgICAgICAgaWYgKHJlLnRlc3QoZmlsZS5uYW1lKSAmJiBmaWxlLnNpemUgPCA0MTk0MzA0KSB7XG4gICAgICAgICAgICBhcHAuX3Jvb3QuZmlsZXNbaW5wdXQuYXR0cignaWQnKV0gPSBlLnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgIGFwcC5hZGRTdWNjZXNzQ2xhc3MocGFyZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0LnZhbCgnJyk7XG4gICAgICAgICAgICBhcHAuYWRkRXJyb3JDbGFzcyhwYXJlbnQpO1xuICAgICAgICAgICAgZGVsZXRlIGFwcC5fcm9vdC5maWxlc1tpbnB1dC5hdHRyKCdpZCcpXTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYWRkU3VjY2Vzc0NsYXNzOiBmdW5jdGlvbiAoIGVsZW0gKSB7XG4gICAgICAgIGVsZW0uYWRkQ2xhc3MoYXBwLl9yb290Lmhhc1N1Y2Nlc3MpLnJlbW92ZUNsYXNzKGFwcC5fcm9vdC5oYXNFcnJvcik7XG4gICAgfSxcbiAgICBhZGRFcnJvckNsYXNzOiBmdW5jdGlvbiAoIGVsZW0gKSB7XG4gICAgICAgIGVsZW0uYWRkQ2xhc3MoYXBwLl9yb290Lmhhc0Vycm9yKS5yZW1vdmVDbGFzcyhhcHAuX3Jvb3QuaGFzU3VjY2Vzcyk7XG4gICAgfSxcbiAgICByZW1vdmVTdWNjZXNzQ2xhc3M6IGZ1bmN0aW9uICggZWxlbSApIHtcbiAgICAgICAgZWxlbS5yZW1vdmVDbGFzcyhhcHAuX3Jvb3QuaGFzU3VjY2Vzcyk7XG4gICAgfSxcbiAgICByZW1vdmVFcnJvckNsYXNzOiBmdW5jdGlvbiAoIGVsZW0gKSB7XG4gICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoYXBwLl9yb290Lmhhc0Vycm9yKTtcbiAgICB9XG59IiwiZXhwb3J0IGNvbnN0ICRkYXRhcGlja2VyID0gJCggXCIjQmlydGhkYXlcIiApO1xuXG5leHBvcnQgZnVuY3Rpb24gRGF0YXBpY2tlcigpIHtcbiAgICAkZGF0YXBpY2tlci5kYXRlcGlja2VyKHtcbiAgICAgICAgY2hhbmdlTW9udGg6IHRydWUsXG4gICAgICAgIGNoYW5nZVllYXI6IHRydWVcbiAgICB9KTtcbn1cbiIsImltcG9ydCB7IGFwcCB9IGZyb20gJy4vYXBwJztcblxuYXBwLmluaXQoKTtcbiIsImNvbnN0ICRub3RpZmljYXRpb24gPSAkKCcubm90aWZpY2F0aW9uJyk7XG5cbiRub3RpZmljYXRpb24ub24oJ2NsaWNrJywgJy5ub3RpZmljYXRpb24tY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgY2xvc2VOb3RpZmljYXRpb24oKTtcbn0pXG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuTm90aWZpY2F0aW9uKHR5cGUsIHRpdGxlLCB0ZXh0KSB7XG4gICAgJG5vdGlmaWNhdGlvblxuICAgICAgICAuYWRkQ2xhc3MoJ29wZW4nKVxuICAgICAgICAuYWRkQ2xhc3ModHlwZSlcbiAgICAgICAgLmZpbmQoJy5ub3RpZmljYXRpb24tdGl0bGUnKVxuICAgICAgICAudGV4dCh0aXRsZSlcbiAgICAgICAgLnBhcmVudCgpXG4gICAgICAgIC5maW5kKCcubm90aWZpY2F0aW9uLW1lc3NhZ2UnKVxuICAgICAgICAudGV4dCh0ZXh0KTtcblxuICAgIHNldFRpbWVjbG9zZU5vdGlmaWNhdGlvbigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xvc2VOb3RpZmljYXRpb24oKSB7XG4gICAgJG5vdGlmaWNhdGlvbi5yZW1vdmVDbGFzcygnb3BlbicpLnJlbW92ZUNsYXNzKCdpbmZvIHN1Y2Nlc3Mgd2FybmluZyBkYW5nZXInKTtcbn1cblxuZnVuY3Rpb24gc2V0VGltZWNsb3NlTm90aWZpY2F0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBjbG9zZU5vdGlmaWNhdGlvbigpO1xuICAgIH0sIDEwMDAwKTtcbn1cbiIsImNvbnN0ICRwYXJhbGxheCA9ICQoJy5wYXJhbGxheF9faGVhZGVyJyk7XG5jb25zdCAkcGFyYWxsYXhCRyA9ICRwYXJhbGxheC5maW5kKCcucGFyYWxsYXhfX2JnJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFBhcmFsbGF4KCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3Njcm9sbFRvcCA9ICQodGhpcykuc2Nyb2xsVG9wKCk7XG4gICAgICAgIGlmIChfc2Nyb2xsVG9wIDwgJHBhcmFsbGF4LmhlaWdodCgpKSB7XG4gICAgICAgICAgICAkcGFyYWxsYXhCRy5jc3Moe1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDBweCwnICsgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICogMC4yICsgJ3B4LDBweCkgc2NhbGUoMS4yKSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuIl19
