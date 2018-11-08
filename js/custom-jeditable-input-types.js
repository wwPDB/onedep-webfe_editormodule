/***********************************************************************************************************
File:		custom-jeditable-input-types.js
Author:		rsala (rsala@rcsb.rutgers.edu)
Date:		2012-03-15
Version:	0.0.1

JavaScript defining custom jEditable input types for use in
General Annotation Editor Module web interface 

2012-03-15, RPS: Created
2012-04-02, RPS: Reorganization of lines of code from editor-main.js into this file.
2012-04-23, RPS: Introduced support for custom jEditable "checkbox" input type
2012-05-15, RPS: Introduced support for custom jEditable calendar input type which leverages jQuery UI DatePicker
2013-04-26, RPS: Fine-tuning behavior for "select w/ other" and "autocomplete w/ other" controls.
2013-04-29, RPS: Improved handling of "?" for "autocomplete" and "autocomplete w/ other" controls.
2013-06-06, RPS: Updates to support new logEdit strategy/"Undo" functionality while viewing several DataTables at once on same page
2013-06-11, RPS: Improved datepicker (jQuery UI calendar widget) behavior to automatically submit on selection of a date value.
2015-04-09, RPS: Updated handling of "selected" property (using prop as opposed to attr as required by jquery 1.9+)
2015-06-09, RPS: Improved behavior of autocomplete controls so that new value is submitted as soon as user selects a listed option.
*************************************************************************************************************/
var optsCheckBox = {
    element: function(settings, original) {
        var input = $('<input class="select_row" type="checkbox">');
        $(this).append(input);
        return (input);
    }
};

$.editable.addInputType('checkbox', optsCheckBox);


/******Creating custom calendar input type for jEditable to integrate jQuery DatePicker input types******************/
var optsCalendar = {
    element: function(settings, original) {
        var input = $('<input type="text">');
        $(this).append(input);
        return (input);
    },
    plugin: function(settings, original) {
        $("input", this).datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            onSelect: function() {
                $(this).submit();
                $(this).hide();
            }
        });
    }
};

$.editable.addInputType('calendar', optsCalendar);


/******Creating custom input type for jEditable to integrate jQuery UI autocomplete input types******************/
function split(val) {
    return val.split(/,\s*/);
}

function extractLast(term) {
    return split(term).pop();
}

var optsAutoCmplt = {
    element: function(settings, original) {
        var input = $('<input type="text">');
        $(this).append(input);
        return (input);
    },
    plugin: function(settings, original) {
        $("input", this).autocomplete({
            source: settings.autocomplete.source,
            select: function(event, ui) {
                if (ui.item) {
                    $(this).val(ui.item.value);
                    $(this).submit();
                }
            }
        });
    }
};

var optsAutoCmpltWthOthr = $.extend({}, optsAutoCmplt, {
    //placeholder
});

var optsMultiAutoCmplt = $.extend({}, optsAutoCmplt, {
    plugin: function(settings, original) {
        $("input", this).bind("keydown", function(event) {
                if (event.keyCode === $.ui.keyCode.TAB &&
                    $(this).data("autocomplete").menu.active) {
                    event.preventDefault();
                }
            })
            .autocomplete({
                minLength: 0,
                source: function(request, response) {
                    // delegate back to autocomplete, but extract the last term
                    response($.ui.autocomplete.filter(
                        settings.autocomplete.source, extractLast(request.term)));
                },
                focus: function() {
                    // prevent value inserted on focus
                    return false;
                },
                select: function(event, ui) {
                    var terms = split(this.value);
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push(ui.item.value);
                    // add placeholder to get the comma-and-space at the end
                    terms.push("");
                    this.value = terms.join(", ");
                    return false;
                }
            });
    }
});

var optsMultiAutoCmpltWthOthr = $.extend({}, optsMultiAutoCmplt, {
    //placeholder
});

$.editable.addInputType('autocomplete', optsAutoCmplt);
$.editable.addInputType('autocomplete_w_other', optsAutoCmpltWthOthr);
$.editable.addInputType('multi_autocomplete', optsMultiAutoCmplt);
$.editable.addInputType('multi_autocomplete_w_other', optsMultiAutoCmplt);


/******Creating custom input type for jEditable to implement select-with-other input type******************/
$.editable.addInputType('select_w_other', {
    element: function(settings, original) {
        var selectWithOther = $('<select id="' + settings.select_w_other.id + '">');

        /* If it is string assume it is json. */
        if (String == settings.data.constructor) {
            eval('var json = ' + settings.data);
        } else {
            /* Otherwise assume it is a hash already. */
            var json = settings.data;
        }
        var origValueOpt;
        var foundOrigValue;
        for (var key in json) {
            // checking here if the json hash of dropdown choices 
            // includes the value that had already existed in the editable area
            if (original.revert == json[key]) {
                foundOrigValue = true;
            }
        }
        for (var key in json) {
            //here we are creating the necessary html markup for
            //each dropdown choice specified in the "data" hash
            if (!json.hasOwnProperty(key)) {
                continue;
            }
            if ('selected' == key) {
                continue;
            }
            var option = $('<option />').val(key).append(json[key]);
            selectWithOther.append(option);
        }
        if (!foundOrigValue) {
            // when not already a choice, this block adds option for value that was originally in the editable textarea
            // should be able to remove this when data validation/enums are in place 
            origValueOpt = $('<option />').val(original.revert).append(original.revert);
            selectWithOther.append(origValueOpt);
        }
        var otherOpt = $('<option />').val('Other').append('Other');
        selectWithOther.append(otherOpt);

        $(this).append(selectWithOther);
        return (selectWithOther);
    },
    submit: function(settings, original) {
        /**DEV STUFF
        alert("submit: $('select', this).val() is: "+$('select', this).val() );  // THIS GIVES THE SELECTED VALUE
        ***/
    },
    content: function(data, settings, original) {
        /**DEV STUFF
        alert("content: $(this).html() is: "+$(this).html() ); // THIS GIVES HTML MARKUP FOR THE SELECT CONTROL
        alert("content: $('select', this).val() is: "+$('select', this).val() );  // THIS GIVES THE FIRST VALUE IN THE LIST WHEN CALLED HERE
        ***/

        /* If it is string assume it is json. */
        if (String == data.constructor) {
            eval('var json = ' + data);
        } else {
            /* Otherwise assume it is a hash already. */
            var json = data;
        }

        /* Loop option to set selected. Works in IE */
        $('select', this).children().each(function() {
            /**DEV STUFF
        	alert("content: in select children each and $(this).html() is: "+$(this).html() );//THIS GIVES YOU THE CHOICE CURRENTLY IN FOCUS BY ITERATION
			alert("content: in select children each and String(original.revert) is: "+String(original.revert) );//THIS IS HOW YOU GET ORIGINAL VALUE
			***/
            if (json.selected) {
                //if data hash already had "selected" attribute assigned to a given choice
                //then should set this as default "selected" for display of the drop-down list
                var option = $(this);
                $.each(json.selected, function(index, value) {
                    if (option.val() == value) {
                        option.prop('selected', true);
                    }
                });
            } else {
                // if there was no "selected" option, and if value of data that was
                // originally in the editable input is in the drop-down list
                // then have that value be the already selected option
                if (original.revert.indexOf($(this).html()) != -1)
                    $(this).prop('selected', true);
            }
        });
    }
});


/******Creating custom input type for jEditable to implement multiple select input types******************/
/******implementation derived from --> http://stackoverflow.com/questions/1597756/is-there-a-jquery-jeditable-multi-select-plugin ***/
var optsMltiSlct = {
    element: function(settings, original) {
        var select = $('<select multiple="multiple" />');

        if (settings.width != 'none') {
            select.width(settings.width);
        }
        if (settings.size) {
            select.attr('size', settings.size);
        }

        $(this).append(select);
        return (select);
    },
    content: function(data, settings, original) {
        /* If it is string assume it is json. */
        if (String == data.constructor) {
            eval('var json = ' + data);
        } else {
            /* Otherwise assume it is a hash already. */
            var json = data;
        }
        for (var key in json) {
            if (!json.hasOwnProperty(key)) {
                continue;
            }
            if ('selected' == key) {
                continue;
            }
            var option = $('<option />').val(key).append(json[key]);
            $('select', this).append(option);
        }
        /**DEV STUFF
        alert("multiselect-->content: $(this).html() is: "+$(this).html() ); // THIS GIVES HTML MARKUP FOR THE SELECT ELEMENT
        **/

        /* Loop option to set selected. Works in IE */
        $('select', this).children().each(function() {
            if (json.selected) {
                var option = $(this);
                $.each(json.selected, function(index, value) {
                    if (option.val() == value) {
                        option.prop('selected', true);
                    }
                });
            } else {
                // if there was no "selected" option, and if value of data that was
                // originally in the editable input is in the drop-down list
                // then have that value be the already selected option	            	
                if (original.revert.indexOf($(this).html()) != -1)
                    $(this).prop('selected', true);
            }
        });
    },
    submit: function(settings, original) {
        //THIS IS CALLED AFTER ONSUBMIT HANDLER IN JEDITABLE INITIALIZATION
        /**DEV STUFF
        alert("value of multi-select is: "+$("select", this).val() );
        ***/
    }
};

var optsMltiSlctWthOthr = $.extend({}, optsMltiSlct, {
    element: function(settings, original) {
        var select = $('<select multiple="multiple" class="multi" id="' + settings.select_w_other.id + '" />');

        if (settings.width != 'none') {
            select.width(settings.width);
        }
        if (settings.size) {
            select.attr('size', settings.size);
        }

        $(this).append(select);
        return (select);
    }
});

$.editable.addInputType("multiselect", optsMltiSlct);
$.editable.addInputType("multiselect_w_other", optsMltiSlctWthOthr);


/***********************Defining onSubmit functions as necessary for some of the above custom input controls************/
function onSubmitSlctWithOther(settings, td) {
    var inputValue = $(td).find('select').val();
    var origValue = td.revert;

    EditorMod.bMultiSlctType = $(td).find('select').hasClass("multi");
    if ("Other".indexOf(inputValue) != -1) {
        //if 'Other' was specified need to launch form to 
        //capture non-standard input data
        //EditorMod.otherValInputId = cifCtgry+'_'+td.getAttribute('true_col_idx')+'_'+td.getAttribute('true_row_idx');
        EditorMod.otherValInputId = settings.select_w_other.id;
        if (EditorMod.bMultiSlctType) {
            EditorMod.selectedVals = inputValue.slice();
        }

        $("#other-value-form").dialog("open");
        return false;
    } else { //NOTE: we also ultimately end up here after the "Other value" form "Submit"s successfully 
        settings.logeditfxn(settings.cifname, td, origValue);
        return true; //else just submit the form if 'Other' data not being requested
    }
}

function onSubmitAutoCmplt(settings, td) {
    var inputValue = $(td).find('[type="text"] ').val();

    if (inputValue.length == 0) {
        // if the new value is an empty string (i.e. user deleted whatever value was there)
        // then set value on screen to be default value for empty values
        $(td).find('[type="text"] ').val("?");
        inputValue = '?';
    }

    var origValue = td.revert;
    //alert("newValue is: '"+newValue+"' and origValue is: '"+origValue+"'");
    if (inputValue == origValue) {
        // DEBUG alert("newVal is same as origVal");
        td.reset();
        return false;
    } else {

        if (inputValue != "?" && settings.autocomplete.source.indexOf(inputValue) == -1) {
            //i.e. input value was not member of approved list of choices 
            alert("Value being submitted: '" + inputValue + "', is not in list of accepted options.");
            td.reset();
            // not sure if we need above reset()?
            return false;
        } else {
            settings.logeditfxn(settings.cifname, td, origValue);
            return true; //else can submit the data cause it's an accepted option
        }
    }
}

function onSubmitAutoCmpltWithOther(settings, td) {
    var inputValue = $(td).find('[type="text"] ').val();

    if (inputValue.length == 0) {
        // if the new value is an empty string (i.e. user deleted whatever value was there)
        // then set value on screen to be default value for empty values
        $(td).find('[type="text"] ').val("?");
        inputValue = '?';
    }

    var origValue = td.revert;
    //alert("newValue is: '"+newValue+"' and origValue is: '"+origValue+"'");
    if (inputValue == origValue) {
        // DEBUG alert("newVal is same as origVal");
        td.reset();
        return false;
    } else {

        if ((inputValue != "?") && (settings.autocomplete.source.indexOf(inputValue) == -1) && (EditorMod.autoCmpltOtherVal.indexOf(inputValue) == -1)) {
            //i.e. input value was not member of approved list of choices 
            var choice = confirm("Value being submitted: '" + inputValue + "', is not in list of accepted options. Please confirm that you would like to submit this value.	");
            if (choice == true) {
                //alert( "choice is true");
                EditorMod.autoCmpltOtherVal = inputValue;
                settings.logeditfxn(settings.cifname, td, origValue);
            } else {
                //alert( "choice is false");
                EditorMod.autoCmpltOtherVal = "";
                td.reset();
                // not sure if we need above reset()?
            }
            return choice;
            /***
	    	$('#other_val').html(inputValue);
	    	var accept = false;
	    	$( "#dialog-confirm-other" ).dialog({
				resizable: false,
				height: 200,
				width: 300,
				modal: true,
				buttons: {
					"Submit new value": function() {
						$( this ).dialog( "close" );
						accept=true;
					},
					Cancel: function() {
						$( this ).dialog( "close" );
						accept=false;
					}
				}
			});
			return accept;
			***/
        } else {
            settings.logeditfxn(settings.cifname, td, origValue);
            return true; //else can submit the data cause it's an accepted option
        }
    }
}

function onSubmitMultiAutoCmplt(settings, td) {
    var rtrn = false;
    var inputValue = $(td).find('[type="text"] ').val();
    var aVal;
    var values = split(inputValue);
    var origValue = td.revert;

    // check for any empty strings added by jQuery UI Autocomplete 
    // plugin (i.e. for display purposes) and remove 
    if (!values[(values.length - 1)]) values.pop();

    for (var i = 0; i < values.length; i++) {
        aVal = values[i];
        if (settings.autocomplete.source.indexOf(aVal) == -1) {
            //i.e. input value was not member of approved list of choices 
            alert("Value being submitted: '" + aVal + "', is not in list of accepted options.");
            return false;
        }
    }
    //if we get here then all values are valid
    inputValue = values.join(", ");
    $(td).find('[type="text"] ').val(inputValue);
    settings.logeditfxn(settings.cifname, td, origValue);
    return true; //can submit the data

}

function onSubmitMultiAutoCmpltWthOthr(settings, td) {
    var rtrn = false;
    var inputValue = $(td).find('[type="text"] ').val();
    var aVal;
    var values = split(inputValue);
    var origValue = td.revert;

    // check for any empty strings added by jQuery UI Autocomplete 
    // plugin (i.e. for display purposes) and remove 
    if (!values[(values.length - 1)]) values.pop();

    for (var i = 0; i < values.length; i++) {
        aVal = values[i];
        if (settings.autocomplete.source.indexOf(aVal) == -1) {
            //i.e. input value was not member of approved list of choices 
            var choice = confirm("Value being submitted: '" + aVal + "', is not in list of accepted options. Please confirm that you would like to submit this value.	");
            if (choice) {
                inputValue = values.join(", ");
                $(td).find('[type="text"] ').val(inputValue);
            }
            return choice;
        }
    }
    //if we get here then all values were valid to begin with
    inputValue = values.join(", ");
    $(td).find('[type="text"] ').val(inputValue);
    settings.logeditfxn(settings.cifname, td, origValue);
    return true; //can submit the data

}

/**************************************************************************************************************/
