Custom Form Elements
====================

A lightweight custom form styler for radio, checkbox and select elements. Radio and Checkboxes have four states rather than just two.

Developed by [Ali Karbassi](http://karbassi.com).

This project lives on GitHub: [http://github.com/karbassi/Custom-Form-Elements](http://github.com/karbassi/Custom-Form-Elements)

This whole project is licensed under the MIT License: [http://opensource.org/licenses/mit-license.php](http://opensource.org/licenses/mit-license.php)

Note
-----

* Requires [jQuery 1.4.2+](http://jquery.com)
* Call once your document is loaded.
* The sprite order from top to bottom is:
  1. unchecked
  2. unchecked-mousedown
  3. checked
  4. checked-mousedown
* `checkboxHeight` and `radioHeight` should all be set to 1/4th the sprite height.
* `selectWidth` is the width of the select box image.
* Remember that `select` elements cannot be `readonly`; they can be `disabled` though.
* As of jQuery 1.4.2, there is an [open bug](http://dev.jquery.com/ticket/7071) pertaining to jQuery, VML, and IE. Version 0.5+ of this script has a work around.

Example
--------

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

Demo
-----

[http://karbassi.github.com/Custom-Form-Elements/](http://karbassi.github.com/Custom-Form-Elements/)
