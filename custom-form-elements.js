/*
Custom Form Elements

http://github.com/karbassi/Custom-Form-Elements

Written by Ali Karbassi (karbassi.com)
Original idea from Ryan Fait (ryanfait.com)

Requires jQuery 1.4+

Note:
    - Call once your document is loaded.
    - The sprite order from top to bottom is: unchecked, unchecked-clicked, checked, checked-clicked.
    - 'checkboxHeight' and 'radioHeight' should all be set to 1/4th the sprite height.
    - 'selectWidth' is the width of the select box image.

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

(function( window, document, $, undefined ) {

    function CustomFormElements( options ) {
        this.init.call( this, options );
    }

    CustomFormElements.prototype = {
        init: function(options){
            var self = this;

            // Merge options
            self.options = $.extend({}, CustomFormElements.options, options || {});

            var css = [
                'input.', self.options.styled, ' { display: none; } ',
                'select.', self.options.styled, ' { position: relative; width: ', self.options.selectWidth, 'px; opacity: 0; filter: alpha(opacity=0); z-index: 5; } ',
                '.disabled { opacity: 0.5; filter: alpha(opacity=50); } '
            ];

            $('<style>' + css.join('') + '</style>').appendTo('head');

            self.bind();
            self.repaint();
        },

        repaint: function(){
            var self = this;

            $('input.' + self.options.styled + '[type=checkbox], input.' + self.options.styled + '[type=radio], select.' + self.options.styled).each(function(){

                // stop already created ones.
                if ($(this).prev().is('[class*=' + self.options.uniqueClassName + ']')) {
                    return;
                }

                var selected = $('option:selected', this).text(),
                    type = $(this).attr('type') === 'select-one' ? 'select' : $(this).attr('type'),
                    style = 'style = "background-position: 0 -' + self.options[ type + 'Height'] * ($(this).is(':checked') ? 2 : 0) + 'px;"',
                    disabled = $(this).is(":disabled") ? 'disabled': '',
                    className = [self.options.uniqueClassName, type, disabled],
                    span = '<span id="' + $(this).attr('id') + '_cf" class="' + className.join(' ') + '" ' + style + '">' + selected + '</span>'
                ;

                $(span).insertBefore(this);

            });
        },

        bind: function(){
            var self = this;

            $('span.' + self.options.uniqueClassName + '.checkbox:not(.disabled), span.' + self.options.uniqueClassName + '.radio:not(.disabled)')
                .live('mousedown', function(e){
                    self.mousedown(e, this);
                })
                .live('mouseup', function(e){
                    self.mouseup(e, this);
                })
            ;

            $('span.' + self.options.uniqueClassName + '.select:not(.disabled) + select')
                .die('change')
                .live('change', function(e){
                    $(this).prev('span').text( $('option:selected', this).text() );
                });

            // Handle label clicks
            $('input')
                .live('change', function(e){
                    self.reset();
                })
            ;
        },

        reset: function(e, el){
            var self = this;

            $('input.styled').each(function(k, v){
                var offset = self.options[ $(this).attr('type') + 'Height'] * ($(this).is(':checked') ? 2 : 0);
                $('#' + $(this).attr('id') + '_cf').css({'background-position': "0 -" + offset + 'px' });
            });
        },

        mousedown: function(e, el){
            var self = this,
                next = $(el).next('input'),
                offset = self.options[ next.attr('type') + 'Height'] * (next.is(':checked') ? 3 : 1);

            $(el).css({'background-position': "0 -" + offset + 'px' });
        },

        mouseup: function(e, el){
            var self = this,
                next = $(el).next('input');
                offset = self.options[ next.attr('type') + 'Height'] * (next.is(':checked') && next.attr('type') === 'checkbox' ? 0 : 2);

            $(el).css({'background-position': "0 -" + offset + 'px' });

            $('input[type=radio][name=' + next.attr('name') + ']:not(#' + next.attr('id') + ')').each(function(){
                $(this).prev('span').css({'background-position': '0 0' });
            });

            next.attr('checked', !next.is(':checked'));
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

    // Expose CustomFormElements to the global object
    window.CustomFormElements = CustomFormElements;
})(window, document, jQuery);