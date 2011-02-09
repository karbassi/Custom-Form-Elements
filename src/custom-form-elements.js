/*
Custom Form Elements v0.9

http://github.com/karbassi/Custom-Form-Elements

Written by Ali Karbassi (karbassi.com)

Requires jQuery v1.4.2+

Note:
    - Call once your document is loaded.
    - The sprite order from top to bottom is: unchecked, unchecked-clicked, checked, checked-clicked.
    - 'checkboxHeight' and 'radioHeight' should all be set to 1/4th the sprite height.
    - 'selectWidth' is the width of the select box image.
    - Remember that 'select' elements cannot be 'readonly'; they can be 'disabled' though.
    - The 'input' file should not be wrapped with the 'label' tag.

Example:

    jQuery(document).ready(function($) {

        // Extremely minimum version:
        // Default settings apply. All input/select tags with a class of 'styled' are affected.
        var cf = new CustomFormElements();

        // Minimum version:
        var cf = new CustomFormElements({
            checkboxHeight: 12,
            radioHeight: 11,
            selectWidth: 161
        });

        // All options
        var cf = new CustomFormElements({
            styled: 'styled',
            uniqueClassName: 'customFormElement',
            checkboxHeight: 12,
            radioHeight: 11,
            selectWidth: 161
        });

        // If you need to reinitialize dynamically added form elements:
        cf.repaint();

    });

*/

(function(window, document, $) {

    function CustomFormElements(options) {
        this.init.call(this, options);
    }

    CustomFormElements.prototype = {
        init: function(options) {
            var self = this;

            // Merge options
            self.options = $.extend({}, CustomFormElements.options, options || {});
            var css = [
                'input.', self.options.styled, '{display:none;}',
                'select.', self.options.styled, '{position:relative;width:', self.options.selectWidth, 'px;opacity:0;filter:alpha(opacity=0);z-index:5;}',
                '.' + d + ',.' + r + '{opacity:0.5;filter:alpha(opacity=50);}'
            ];

            $('<style>' + css.join('') + '</style>').appendTo('head');

            self.repaint();
        },

        repaint: function(){
            var self = this;

            $('input.' + self.options.styled + '[type=checkbox],input.' + self.options.styled + '[type=radio],select.' + self.options.styled).each(function(){

                var existing = $('#' + this.id + '_cf.' + self.options.uniqueClassName);
                if (existing.length > 0) {
                    existing.remove();
                }

                var selected = $(this).find('option:selected').text(),
                    type = this.type === 'select-one' ? 'select' : this.type,
                    style = 'style="background-position:0 -' + self.options[type + h] * (this.checked ? 2 : 0) + 'px;"',
                    disabled = this.disabled ? d : null,
                    readonly = $(this).attr(r) ? r : null,
                    className = [self.options.uniqueClassName, type, disabled, readonly],
                    span = '<span id="' + this.id + '_cf" class="' + className.join(' ').replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '') + '"' + (type !== 'select' ? ' ' + style + ' ' : '') + '>' + selected + '</span>';

                $(span).insertBefore(this);
            });

            self.bind();
        },

        bind: function(){
            var self = this;

            $('span.' + self.options.uniqueClassName + '.checkbox:not(.' + d + ',.' + r + '),span.' + self.options.uniqueClassName + '.radio:not(.' + d + ',.' + r + ')')
                .die('mousedown mouseup')
                .live('mousedown', function(e) {
                    self.mousedown(e, this);
                })
                .live('mouseup', function(e) {
                    self.mouseup(e, this);
                });

            var query = 'span.' + self.options.uniqueClassName + '.select:not(.' + d + ')+select';

            $(query).each(function(){
                $(this)
                    .parent()
                    .undelegate(query, 'change')
                    .delegate(query, 'change', function(){
                        $(this)
                            .prev('span')
                            .html(
                                $(this)
                                .find('option:selected')
                                .text()
                                .replace(/\s/g, '&nbsp;')
                            );
                    });
            });

            // Handle label clicks
            query = 'input.' + self.options.styled;
            $(query).each(function(){

                if ($('span#' + this.id + '_cf.' + d).length) {
                    return;
                }

                $(this)
                    .parent()
                    .undelegate(query, 'change')
                    .delegate(query, 'change', function(e){
                        self.reset();
                    });

                if ($.browser.msie) {
                    $('label[for=' + this.id + ']').bind('click', function(){
                        var mouseup = jQuery.Event("mouseup");
                        mouseup.which = 1;
                        $('span#' + $(this).attr('for') + '_cf').trigger(mouseup);
                    });
                }
            });
        },

        reset: function(){
            var self = this;
            $('input.' + self.options.styled).each(function(k, v) {
                $('#' + this.id + '_cf')[0].style[bgp] = !this.checked ? '' : "0 -" + self.options[this.type + h] * 2 + 'px';
            });
        },

        mousedown: function(e, el) {
            if (e.which !== 1) { return; } // Only respond to left mouse clicks

            var self = this,
                input = $('#' + el.id.split('_cf').shift())[0],
                offset = self.options[input.type + h] * (input.checked ? 3 : 1);

            el.style[bgp] = "0 -" + offset + 'px';
        },

        mouseup: function(e, el) {
            if (e.which !== 1) { return; } // Only respond to left mouse clicks

            var self = this,
                input = $('#' + el.id.split('_cf').shift())[0];

            el.style[bgp] = input.checked && input.type === 'checkbox' ? '' : "0 -" + self.options[input.type + h] * 2 + 'px';

            $('input[type=radio][name=' + input.name + ']').not('#' + input.id).each(function(){
                $('#' + this.id + '_cf')[0].style[bgp] = '';
            });

            input.checked = !input.checked;
            $(input).trigger('change');
        }

    };

    // Default CustomFormElements options
    CustomFormElements.options = {
        'styled': 'styled',
        'uniqueClassName': 'customFormElement',
        'checkboxHeight': 12,
        'radioHeight': 11,
        'selectWidth': 161
    };

    // Save some space
    var bgp = 'backgroundPosition',
        d = 'disabled',
        r = 'readonly',
        h = 'Height';

    // Expose CustomFormElements to the global object
    window.CustomFormElements = CustomFormElements;
})(window, document, jQuery);