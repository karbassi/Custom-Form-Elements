/*
Custom Form Elements v2.0.0

http://github.com/karbassi/Custom-Form-Elements

Written by Ali Karbassi (karbassi.com)

Requires jQuery v1.7+

Note:
    - Call once your document is loaded.
    - Custom `span` elements have four states:
        - state-0: unchecked
        - state-1: unchecked-mousedown
        - state-2: checked
        - state-3: checked-mousedown

Example:

    jQuery(document).ready(function($) {

        // Extremely minimum version:
        // Default settings apply. All input/select tags with a class of 'cfe-styled' are affected.
        var cf = new CustomFormElements();

        // All options
        var cf = new CustomFormElements({
            cssClass: 'cfe-styled',
        });

        // If you need to reinitialize dynamically added form elements:
        cf.repaint();

    });

*/

(function(window, document, $) {

    var CustomFormElements = function(options) {
        this.init.call(this, options);
    };

    CustomFormElements.prototype = {
        init: function(options) {
            // Merge options
            this.options = $.extend({}, CustomFormElements.options, options || {});

            // Create CSS
            var head = document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            style.type = 'text/css';

            var rules = document.createTextNode(
                'input.' + this.options.cssClass + ' { display: none; } ' +
                'select.' + this.options.cssClass + ', input.' + this.options.cssClass + '[type=file] { position: relative; display: block; opacity: 0; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha"(Opacity=0); filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0); filter:alpha(opacity=0); z-index: 5; } '
                );

            if (style.styleSheet) {
                style.styleSheet.cssText = rules.nodeValue;
            } else {
                style.appendChild( rules );
            }

            head.appendChild( style );

            this.repaint();
        },


        repaint: function() {
            var self = this;

            $('.' + self.options.cssClass + '[type=checkbox], ' +
              '.' + self.options.cssClass + '[type=radio], ' +
              '.' + self.options.cssClass + '[type=file], ' +
              '.' + self.options.cssClass
            ).each(function() {

                var existing = $('#cfe-' + this.id + '.cfe');
                if (existing.length) {
                    existing.remove();
                }

                // Class Names for the element
                var className =
                    [
                        // Plugins unique name
                        'cfe',

                        // Form Element type
                        'cfe-' + (this.type === 'select-one' ? 'select' : this.type),

                        // If the element is checked or not
                        this.type !== 'select-one' && this.type !== 'file' ?
                            'cfe-' + (this.checked ? 'state-2' : 'state-0'):
                            '',

                        // If the element is disabled or not
                        this.disabled ? 'cfe-disabled' : '',

                        // If the element is readonly or not
                        this.getAttribute('readonly') ? 'cfe-readonly' : ''
                    ]

                    .sort()

                    // Combine array into a string with seperator of space.
                    .join(' ')

                    // Trim
                    .trim()
                ;

                // Create the span element
                var span = document.createElement('span');
                span.id = 'cfe-' + this.id;
                span.className = className;
                span.innerHTML = $(this).find('option:selected').text();

                // Insert before the HTML element
                this.parentNode.insertBefore(span, this);

                // Set label class
                $('label[for=' + this.id + ']').addClass('cfe');

            });

            // Listen to checkbox change events and update the style accordingly
            var cb = this;
            if($(this).attr("type") === "checkbox") {
                $(this).off("cfe-styled").on("change.cfe-styled", function() {
                    var el = document.getElementById('cfe-' + cb.id);
                    self.setState(el, (this.checked ? 2 : 0));
                });
            }

            this.bind();
        },

        bind: function() {
            var self = this;

            // Radio and Checkboxes
            $('.cfe-radio:not(.cfe-disabled, .cfe-readonly), .cfe-checkbox:not(.cfe-disabled, .cfe-readonly)')

                // Remove old binds
                .off('.cfe')

                // New binds
                .on('mousedown.cfe', function(e) {
                    self.mousedown(this, e);
                })
                .on('mouseup.cfe', function(e) {
                    self.mouseup(this, e);
                })
            ;

            // Select boxes
            $('select.' + self.options.cssClass +
              ', input.' + self.options.cssClass + '[type=file]')

                // Remove old binds
                .off('.cfe')

                // New binds
                .on('change.cfe', self.change)
            ;

            // Handle label clicks
            $('label.cfe')

                // Remove old binds
                .off('.cfe')

                // Prevent normal label event
                .on('click.cfe', function(e) {
                    e.preventDefault();
                })

                // Set mousedown state
                .on('mousedown.cfe', function(e) {
                    var el = document.getElementById('cfe-' + this.htmlFor);

                    if (e.target !== el && el.className.indexOf('cfe-disabled') < 0) {
                        self.mousedown(el, e);
                    }
                })

                // Set mouseup state
                .on('mouseup.cfe', function(e) {
                    var el = document.getElementById('cfe-' + this.htmlFor);

                    if (e.target !== el && el.className.indexOf('cfe-disabled') < 0) {
                        self.mouseup(el, e);
                    }
                })
            ;
        },

        mousedown: function(el, e) {
            // Only respond to left mouse clicks
            if (!(e.isTrigger || e.which === 1)) {
                return;
            }

            var input = document.getElementById( el.id.split('cfe-').pop() );
            this.setState(el, (input.checked ? 3 : 1));
        },

        mouseup: function(el, e) {
            // Only respond to left mouse clicks
            if (!(e.isTrigger || e.which === 1)) {
                return;
            }

            var self = this;
            var input = document.getElementById( el.id.split('cfe-').pop() );

            // Prevent unselecting radio option
            if (input.type === 'radio' && input.checked === true) {
                this.setState(el, 2);
                return;
            }

            // Reset all other radio buttons in group
            $('.' + this.options.cssClass + '[type=radio][name=' + input.name + ']')
                .not(':disabled, .cfe-disabled, #' + input.id)
                .each(function() {
                    self.setState( document.getElementById('cfe-' + this.id), 0);
                })
            ;

            // Set state
            this.setState(el, (input.checked ? 0 : 2));

            // Set the checkbox state
            if (!e.isTrigger ) {
               input.checked = !input.checked;
            }

            // Bubble up change event.
            $(input).trigger('change');
        },

        change: function(e) {

            var value = this.options[this.selectedIndex].text;

            // Remove 'C:\fakepath\' from string
            if (this.type === 'file') {
                value = this.value.replace(/C:\\fakepath\\/, '');
            }

            document.getElementById('cfe-' + this.id).innerHTML = value;
        },

        setState: function(el, state) {
            // Remove previous states
            el.className = el.className.replace(/(?:^|\s)cfe-state-\d(?!\S)/, '');

            // Add new state.
            el.className += ' cfe-state-' + state;
        }

    };

    // Default CustomFormElements options
    CustomFormElements.options = {
        cssClass: 'cfe-styled'
    };

    // Expose CustomFormElements to the global object
    window.CustomFormElements = CustomFormElements;

    // HELPERS

    // Create String's trim function if we don't have it.
    if(!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g,'');
        };
    }

    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(
                        this instanceof fNOP ? this : oThis || window,
                        aArgs.concat(Array.prototype.slice.call(arguments))
                    );
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

})(window, document, jQuery);
