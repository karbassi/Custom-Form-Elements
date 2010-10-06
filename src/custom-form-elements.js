/*
Custom Form Elements v0.5

http://github.com/karbassi/Custom-Form-Elements

Written by Ali Karbassi (karbassi.com)

Requires jQuery 1.4+

Note:
    - Call once your document is loaded.
    - The sprite order from top to bottom is: unchecked, unchecked-clicked, checked, checked-clicked.
    - 'checkboxHeight' and 'radioHeight' should all be set to 1/4th the sprite height.
    - 'selectWidth' is the width of the select box image.
    - Remember that 'select' elements cannot be 'readonly'; they can be 'disabled' though.

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
                'input.', self.options.styled, '{display:none;}',
                'select.', self.options.styled, '{position:relative;width:', self.options.selectWidth, 'px;opacity:0;filter:alpha(opacity=0);z-index:5;}',
                '.disabled,.readonly{opacity:0.5;filter:alpha(opacity=50);}'
            ];

            $('<style>' + css.join('') + '</style>').appendTo('head');

            self.repaint();
        },

        repaint: function(){
            var self = this,
                prev;

            $('input.' + self.options.styled + '[type=checkbox],input.' + self.options.styled + '[type=radio],select.' + self.options.styled).each(function(){

                // stop already created ones.
                var prev = $(this).prev();
                if (prev.is('[class*=' + self.options.uniqueClassName + ']')) {
                    prev.remove();
                }

                var selected = $(this).find('option:selected').text(),
                    type = this.type === 'select-one' ? 'select' : this.type,
                    style = 'style="background-position:0 -' + self.options[ type + 'Height'] * (this.checked ? 2 : 0) + 'px;"',
                    disabled = this.disabled ? 'disabled': null,
                    readonly = $(this).attr("readonly") ? 'readonly': null,
                    className = [self.options.uniqueClassName, type, disabled, readonly],
                    span = '<span id="' + this.id + '_cf" class="' + className.join(' ') + '" ' + style + '>' + selected + '</span>'
                ;

                $(span).insertBefore(this);
            });

            self.bind();
        },

        bind: function(){
            var self = this;

            $('span.' + self.options.uniqueClassName + '.checkbox:not(.disabled,.readonly),span.' + self.options.uniqueClassName + '.radio:not(.disabled,.readonly)')
                .die('mousedown mouseup')
                .live('mousedown', function(e){
                    self.mousedown(e, this);
                })
                .live('mouseup', function(e){
                    self.mouseup(e, this);
                })
            ;

            var query = 'span.' + self.options.uniqueClassName + '.select:not(.disabled)+select';

            $(query).each(function(){
                $(this)
                    .parent()
                    .undelegate(query, 'change')
                    .delegate(query, 'change', function(){
                        $(this).prev('span').text( $('option:selected', this).text() );
                    });
            });

            // Handle label clicks
            query = 'input.' + self.options.styled;

            $(query).each(function(){

                if ($('span#' + this.id + '_cf.disabled').length) {
                    return;
                }

                $(this)
                    .parent()
                    .undelegate(query, 'change')
                    .delegate(query, 'change', function(){
                        self.reset();
                });

                if ($.browser.msie) {
                    $('label[for=' + this.id + ']').bind('click', function(){
                        $('input[id=' + this.htmlFor + ']').attr('checked', 'checked');
                        self.reset();
                    });
                }
            });
        },

        reset: function(){
            var self = this;
            $('input.' + self.options.styled).each(function(k, v){
                var offset = self.options[ this.type + 'Height'] * (this.checked ? 2 : 0);
                $('#' + this.id + '_cf').css({'background-position': "0 -" + offset + 'px' });
            });
        },

        mousedown: function(e, el){
            var self = this,
                next = $(el).next('input').get(0),
                offset = self.options[ next.type + 'Height'] * (next.checked ? 3 : 1);

            $(el).css({'background-position': "0 -" + offset + 'px' });
        },

        mouseup: function(e, el){
            var self = this,
                next = $(el).next('input').get(0);
                offset = self.options[ next.type + 'Height'] * (next.checked && next.type === 'checkbox' ? 0 : 2);

            $(el).css({'background-position': "0 -" + offset + 'px' });

            $('input[type=radio][name=' + next.name + ']').not('#' + next.id).each(function(){
                $(this).prev('span').css({'background-position': '0 0' });
            });

            next.checked = !next.checked;
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