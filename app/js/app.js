import Menu from './Menu';
import Parallax from './parallax';
import { Datapicker, $datapicker } from './datapicker';
import { openNotification } from './notification';

export const app = {
    _root: {
        dirty: 'dirty',
        files: {},
        hasError: 'has-error',
        hasSuccess: 'has-success'
    },
    init: function () {
        this.setUpListeners();
        Menu();
        Parallax();
        Datapicker();
    },
    setUpListeners: function () {
        $('form').on('submit', app.submitForm);

        $('form input').on('focus', app.onFocusInput);
        $('form textarea').on('focus', app.onFocusInput);

        $('form input').on('input', app.validateInput);
        $('form textarea').on('input', app.validateInput);

        $('form input').on('keydown', app.leaveInputFocus);
        $('form textarea').on('keydown', app.leaveInputFocus);

        $('input[type=file]').on('change', app.prepareUpload);

        $datapicker.on('change', app.validateInput);
    },
    submitForm: function (e) {
        e.stopPropagation(); // Stop stuff happening
        e.preventDefault();
        let valid = true;
        let formData = new FormData();

        $.each($('input'), function ( key, val ) {
            const input = $(val);
            const inputVal = input.val();
            const required = input.attr('required');
            const name = input.attr('id') ? input.attr('id').toLowerCase() : 'undefiend';
            const parent = input.parent();

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

        $.each($('textarea'), function ( key, val ) {
            const input = $(val);
            const inputVal = input.val();
            const required = input.attr('required');
            const parent = input.parent();

            if (inputVal.length === 0 && !!required) {
                app.addErrorClass(parent);
                valid = false;
            } else if (inputVal.length > 0) {
                formData.append(input.attr('id').toLowerCase(), inputVal);
                app.addSuccessClass(parent);
            }
        });

        $.each(Object.keys(app._root.files), function ( key, val ) {
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
                success: function ( data ) {
                    $.each($('input'), function ( key, val ) {
                        const input = $(val);
                        input.val('');
                        app.removeErrorClass(input.parent());
                        app.removeSuccessClass(input.parent());
                    });
                    $.each($('textarea'), function ( key, val ) {
                        const input = $(val);
                        app.removeErrorClass(input.parent());
                        app.removeSuccessClass(input.parent());
                        input.val('');
                    });
                    openNotification('info', data, 'Your application has been accepted. We\'ll contact you, asap.')
                },
                error: function ( err ) {
                    openNotification('warning', 'Something went wrong', 'Try to please a little bit later...')
                }
            });
        }
    },
    onFocusInput: function () {
        $(this)
            .addClass(app._root.dirty)
            .removeClass(app._root.hasError);
    },
    validateForm: function ( form ) {
        const inputs = form.find('input');
        let valid = true;

        $.each(inputs, function ( index, value ) {
            const input = $(value);
            const dirty = input.hasClass(app._root.dirty);
            const val = input.val();
            const parent = input.parent();

            if (val.length === 0 && dirty) {
                app.addErrorClass(parent);
            } else {
                app.removeErrorClass(parent);
            }
        })

        return valid;
    },
    validateInput: function () {
        const input = $(this)
        const parent = input.parent();
        const val = input.val();
        const required = input.attr('required');
        const type = input.attr('type');

        if (val.length > 1) {
            app.addSuccessClass(parent);
        }
        else {
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
    leaveInputFocus: function (e) {
        const input = $(this);
        const parent = input.parent();
        const dirty = input.hasClass(app._root.dirty);
        const val = input.val();
        const required = input.attr('required');
        const type = input.attr('type');

        if (e.keyCode === 9) {
            if (dirty && !!required && val.length < 2) {
                app.addErrorClass(parent);
            } else if (type === 'email') {
                if (!app.validateEmail(val)) {
                    app.addErrorClass(parent);
                }
            }
        } else {

        }
    },
    validateEmail: function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    prepareUpload: function (e) {
        const input = $(this);
        const parent = $(this).parent();
        const file = e.target.files[0];
        const re = /^.*\.(jpg|JPG|txt|TXT|doc|DOC|docx|DOCX|pdf|PDF)$/;

        if (re.test(file.name) && file.size < 4194304) {
            app._root.files[input.attr('id')] = e.target.files[0];
            app.addSuccessClass(parent);
        } else {
            input.val('');
            app.addErrorClass(parent);
            delete app._root.files[input.attr('id')];
        }
    },
    addSuccessClass: function ( elem ) {
        elem.addClass(app._root.hasSuccess).removeClass(app._root.hasError);
    },
    addErrorClass: function ( elem ) {
        elem.addClass(app._root.hasError).removeClass(app._root.hasSuccess);
    },
    removeSuccessClass: function ( elem ) {
        elem.removeClass(app._root.hasSuccess);
    },
    removeErrorClass: function ( elem ) {
        elem.removeClass(app._root.hasError);
    }
}