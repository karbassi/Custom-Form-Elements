/*
Custom Form Elements

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
        cf.init();

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

            self.bind();
            self.create();
        },

        create: function(){

            // Add global styles
            var self = this,
                style = [
                'input.', self.options.styled, ' { display: none; } ',
                'select.', self.options.styled, ' { position: relative; width: ', self.options.selectWidth, 'px; opacity: 0; filter: alpha(opacity=0); z-index: 5; } ',
                '.disabled { opacity: 0.5; filter: alpha(opacity=50); } '
            ];

            $('<style>' + style.join('') + '</style>').appendTo('head');

            $('input.' + self.options.styled + '[type=checkbox], input.' + self.options.styled + '[type=radio], select.' + self.options.styled).each(function(index) {

                // stop already created ones.
                if ($(this).prev().is('[class*=' + self.options.uniqueClassName + ']')) {
                    return;
                }

                var cb = $(this).is('[type=checkbox]'),
                    checked = $(this).is(':checked') ? 'background-position: 0 -' + ( self.options[cb ? 'checkboxHeight' : 'radioHeight'] * 2 ) + 'px' : '',
                    style = [checked],
                    selected = $('option:selected', this).text(),
                    type = $(this).attr('type') === 'select-one' ? 'select' : $(this).attr('type'),
                    disabled = $(this).is(":disabled") ? 'disabled': '',
                    className = [self.options.uniqueClassName, type, disabled],
                    span = '<span id="' + $(this).attr('id') + '_cf" class="' + className.join(' ') + '"' + (style.length ? 'style="' + style.join(';') : '') + '">' + selected + '</span>'
                ;

                $(span).insertBefore(this);

            });
        },

        bind: function(){
            var self = this;

            $('span.' + self.options.uniqueClassName + '.checkbox:not(.disabled), span.' + self.options.uniqueClassName + '.radio:not(.disabled), span.' + self.options.uniqueClassName + '.select:not(.disabled) + select')
                .die('mousedown mouseup change')
                .live('mousedown mouseup change', function(e){
                    self.state(e, this);
                })
            ;

            $('label[for]')
                .live('mousedown mouseup change', function(e){
                    $('#' + $(this).attr('for') + '_cf').trigger(e.type);
                })
            ;
        },

        state: function(e, el){

            // Catch the select box first; spans don't have a type.
            if( $(el).attr('type') !== undefined ) {
                $(el).prev().text( $('option:selected', el).text() );
                return;
            }

            var next = $(el).next(),
                md = e.type === 'mousedown',
                cb = next.is('[type=checkbox]'),
                rb = next.is('[type=radio]'),
                checked = next.is(":checked"),
                offset = this.options[(cb ? 'checkboxHeight' : 'radioHeight')] * (checked ? (md ? 3 : 0) : (md ? 1 : 2) )
            ;

            if ( !(cb || rb) ) {
                return;
            }

            $(el).css({'background-position': "0 -" + offset + 'px' });

            if(!md) {
                next.attr('checked', !checked);
            }

        }

    };

    // Default CustomFormElements options
    CustomFormElements.options = {
        styled: 'styled',
        uniqueClassName: 'customFormElement',
        checkboxHeight: 12,
        radioHeight: 11,
        selectWidth: 161
    };

    // Expose CustomFormElements to the global object
    window.CustomFormElements = CustomFormElements;
})(window, document, jQuery);