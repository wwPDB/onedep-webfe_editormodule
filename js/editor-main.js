/***********************************************************************************************************
File:		editor-main.js
Author:		rsala (rsala@rcsb.rutgers.edu)
Date:		2012-02-06
Version:	0.0.1

JavaScript supporting General Annotation Editor Module web interface 

2012-02-06, RPS: Created
2012-04-02, RPS: Updates for better handling of cases where datafile being processed does not contain
					data corresponding to cif category being requested for display/edit.
					Also, corrected for better handling of aiOrder/column reordering in case of transposed tables.
2012-04-03, RPS: Updated to set DataTables "aoColumns" property on DataTable initialization in support of preserving
				 column reordering settings when filtering/redrawing
				 Corrected handling of primary key column display (i.e. freezing as leftmost and styling properly)
				 Reorganized code from this file into custom-jeditable-input-types.js.
2012-04-04, RPS: Updated to account for DataTable behavior whereby values of column indexes as managed by the 
 				 plugin are subject to change depending on column reordering and on point in time during which
 				 you reference these values in relation to sequence of callbacks fired.
2012-04-05, RPS: Updated as per recommendations by Allan Jardine (author of DataTables plugin) to eliminate behavior
				 whereby any edits submitted by jEditable caused DataTable to reset to first page for display
				 (unwanted behavior if on page > 1 when editing). Flag for bResetDisplay established and DataTables
				 javascript source amended (and renamed as jquery.dataTables.-1.9.0.wwpdb.js) as per Allan Jardine's suggestions.
2012-04-06, RPS: Introducing support for adding a new row to DataTable/cif category.				 
2012-04-09, RPS: Additional support for addition of new records by user.
2012-04-10, RPS: Introduced support for deleting a record.
2012-04-11, RPS: Resolved issue of true row index being lost for frozen columns on any redraws during filtering/pagination.
				 Instituted workaround for issue where jEditable behavior for frozen columns was partially hidden from view with default 
				 behavior of FixedColumns core plugin for DataTables. Workaround involved small tweak to settings in FixedColumns javascript 
				 source and crude settings for iLeftWidth option for FixedColumns initialization.
				 (FixedColumns source modified and js file renamed as FixedColumns-2.0.2.wwpdb.js).
2012-04-16, RPS: Addressed issue of DataTable display being disrupted when all columns for display are primary key columns / "frozen".
				 Introduced hook for server-side validation of user-submitted edits.
2012-04-17, RPS: Updates in support of server-side validation of data being submitted as edits to given cif category.attribute				 
2012-04-22, RPS: Introduced support for writing out edited cif data to output file as response to UI action button.
2012-04-23, RPS: Introduced support for custom jEditable "checkbox" input type
2012-04-23, RPS: Updates in anticipation of integration with WFM environment.
2012-04-26, RPS: Updates related to writing out edited cif data to output file as response to UI action button.
2012-04-26, RPS: Corrected errors in handling of "filesource"
2012-04028, JDW: add iframe close method.
2012-05-08, RPS: Updated as per addition of validation checking on server-side against boundary constraints when applicable.
2012-05-15, RPS: Introduced support for custom jEditable calendar input type which leverages jQuery UI DatePicker
2012-06-27, RPS: Cleaned up code managing exit from the EditorMod UI.
2012-06-28, RPS: Introduced support for launching of Jmol viewer relative to specific records selected via DataTable
					interface such that Jmol scripting commands are customized based on cif category and row selected.
2012-07-13, RPS: Improved handling of long category names when used as labels in the left hand accordion navigation menu
2012-07-20, RPS: Improved organization of code.
2012-07-27, RPS: Added support for column-specific search filtering.
2012-08-07, RPS: Updated to support new strategy of obtaining UI config details via config file.
2012-08-10, RPS: Introduced feature for toggling between "Show All Fields" and "Show Priority Fields Only" views.
					Unprotected fields activated for edit by double-click instead of single-click.
					Function definitions moved to a separate file, "editor-fxn-defs.js"
2013-02-05, RPS: Updated to support simultaneous viewing of > 1 DataTable.
				  Moved away from vertical accordion nav menu style to horizontal toolbar nav menu style
2013-02-26, RPS: Introduced support for "undo"-ing edits.
2013-03-13, RPS: Disallowing addition of records when cif category is of "unit" row cardinality.
				  Changed manner in which user selects single row so that it is done via CTRL-click (and not SHIFT-click)
2013-03-19, RPS: EditorMod.gotoRow property added as per strategy of "auto-increment" behavior on insertions.
2013-03-21, RPS: For selection of a DataTable row --> capturing "command-click" for Mac clients via e.metakey qualifier  
2013-04-24, RPS: Highlighting of mandatory items and functions to check whether these have non-null values.
2013-05-17, RPS: Adopting new JavaScript strategy for constructing transposed views of datatables via use of 'Transpose.js' plugin.
2013-05-22, RPS: Fixed bug affecting proper handling of unit cardinality.
2013-06-04, RPS: Updates to support new logEdit strategy/"Undo" functionality while viewing several DataTables at once on same page
2013-06-11, RPS: Addressed issue whereby column/header widths were not expanding to fill page to appropriate widths.
2013-06-14, RPS: Updated to add support for read-only table displays. Improved behavior on coordinating 
					simultaneous "transpose", "undo", "mandatory missing" functionalities.
2013-06-17, RPS: More improvements for handling of "undo", "mandatory missing" functionalities.
2013-06-19, RPS: Fix to check_mandatory_items when done in global mode.
2013-12-06, RPS: Added "global" transpose view feature.
					Supporting mouse right-click for context menu features (mark as unread / action req'd)
2014-02-06, RPS: Added categories to read-only list. Now applying highlighting to indicate currently selected navigation menu choice.
2014-02-24, RPS: Added support for handling requests to skip link/site/helix/sheet calculations when in Added Annotation context.
2014-06-05, RPS: Updated with improved features for providing annotator with information regarding violation of dictionary constraints.
2014-07-09, RPS: Introduced changes that will eventually support "insertRow" functionality, editing of editor view config files
2014-09-10, RPS: Added 'struct_conn' to list of categories where deletion of last row will be allowed.
2014-09-19, RPS: Changed strategy for making snapshots to support rollbacks. An initial zero-index snapshot had already been made when user 
					action invokes first call to have datatables populated in the browser. The pre-existing zero-index snapshot serves as readily
					available initial rollback point, and thus allows us to make snapshots *after* any edit actions so user does not have to wait 
					for snapshot completion for edit action roundtrip to be completed and allow user to interact with screen again.
2015-04-01, RPS: Adding "solvent repositioning" to types of calculations that can be skipped.
2015-04-14, RPS: Introduced support for CIF Editor self-config.
					Updates to reflect move to jQuery 2.1.3, DataTables 1.10.5, and related plugins.
					Added "Abort" button to allow exit with abandon of any changes.
					(Introduced support for latent right-click/context-menu row operations -- i.e. delete/insert multiple rows)
2015-06-16, RPS: Feature for copying title data between "struct" and "citation" categories
2016-03-14, RPS: Interim workaround for having skip calc buttons show for EM and NMR entries.
2016-03-24, RPS: Removal of all "async: false" ajax calls and streamlining of code.
2016-04-15, RPS: deleteRow() corrected to deleteRows()
2016-04-19, RPS: Fixed bug introduced in last update regarding handling of cardinality for given cif table.
2016-08-29  EP:  Allow deletion of last row of em_single_particle_entity
2016-09-12  RPS: Migrating configuration for read-only categories and categories-allowing-deletion-of-last-row out of this file and to python source for consistency 
2018-07-02  EP:  Performance improcement by retrieving all category related data at one time
*************************************************************************************************************/
//"EditorMod" namespacing for any globals
var EditorMod = {
    context: CONTEXT, // assignment using data populated as global var upon initial generation of html/javascript markup
    expmethod: EXPMETHOD, // assignment using data populated as global var upon initial generation of html/javascript markup
    ajaxTimeout: 60000,
    adminContact: 'Send comments to: <a href="mailto:rsala@rcsb.rutgers.edu">help@wwpdb-dev.rutgers.edu</a>',
    infoStyle: '<span class="ui-icon ui-icon-info fltlft"></span> ',
    errStyle: '<span class="ui-icon ui-icon-alert fltlft"></span> ',
    debug: false,
    oDataTable: undefined,
    CtgryConfig: new Object(),
    otherValInputId: "",
    autoCmpltOtherVal: "",
    selectedVals: [],
    bMultiSlctType: false,
    bResetDisplay: true,
    debugCurrentCtgryNm: "",
    currentCtgryNms: [], // i.e. names of categories currently in view, list will change as user navigates through different tabs of top nav bar
    currentRowSlctd: "",
    currentRowSlctd_TrNode: undefined,
    currentRowSlctd_CtgryNm: "",
    arrCtgriesWth3Dcntxt: [],
    // below property for arrReadOnlyCtgries should be replaced with config file implementation
    arrReadOnlyCtgries: arrREADONLY_CATGRS, // assignment using data populated as global var upon initial generation of html/javascript markup
    arrAllowLastRowDeleteCtgries: arrCATGRS_CAN_DELETE_LAST_ROW, // assignment using data populated as global var upon initial generation of html/javascript markup
    iSrchHeadersThrshld: (CONTEXT == "editorconfig") ? 45 : 20,
    iTransposeThrshld: 6,
    gotoRow: -1,
    editActnIndx: 0, //initializing counter with value of 0
    addRowActns: [], //array to record addNewRow actions
    deleteRowActns: [], //array to record deleteRow actions
    currentMndtryViolations: new Object(),
    currentDictViolations: new Object(),
    dictViolationsTooltip: false,
    mndtryViolationsTooltip: false,
    turnOffDTmDataConversion: true,
    bUseContextMenu: true,
    //toggleHiddenColsLabel : "Show All Fields",
    //URL constants
    URL: {
        SEE_RAW_JSON_FOR_DTBL: '/service/editor/test_see_json',
        DTBL_GET_TMPLT: '/service/editor/get_dtbl_config_dtls',
        DTBL_GET_MULTI_TMPLT: '/service/editor/get_multi_dtbl_config_dtls',
        DTBL_AJAX_LOAD: '/service/editor/get_dtbl_data',
        DTBL_VALIDATE_EDIT: '/service/editor/validate_edit',
        DTBL_SUBMIT_EDIT: '/service/editor/submit_edit',
        DTBL_PROPAGATE_TITLE: '/service/editor/propagate_title',
        DTBL_ACT_ON_ROW: '/service/editor/act_on_row',
        EXIT_NOT_FINISHED: '/service/editor/exit_not_finished',
        EXIT_FINISHED: '/service/editor/exit_finished',
        EXIT_ABORT: '/service/editor/exit_abort',
        GET_JMOL_SETUP: '/service/editor/get_jmol_setup',
        GET_CATEGORIES_3D_CNTXT: '/service/editor/get_ctgries_w3dcontext',
        UNDO_CHANGES: '/service/editor/undo',
        CHECK_MANDATORY_ITEMS: '/service/editor/check_mandatory_items',
        CHECK_DICT_VIOLATIONS: '/service/editor/check_dict_violations',
        SKIP_CALC: '/service/editor/skip_calc',
        SKIP_CALC_UNDO: '/service/editor/skip_calc_undo',
        CHECK_SKIP_CALC: '/service/editor/check_skip_calc',
        INIT_ROLLBACK_POINT: '/service/editor/init_rollback_point',
        RELOAD_PAGE: '/service/editor/reload'
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////BEGIN: adding customizations to javascript prototypes///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//need the below in cases of IE where indexOf is not defined for Array datatypes
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === needle) {
                return i;
            }
        }
        return -1;
    };
}

//adding convenience function to String prototype for checking if given string startsWith given string
String.prototype.startsWith = function(str) {
    return (this.match("^" + str) == str);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////END: adding customizations to javascript prototypes///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////BEGIN: jQuery document ready function ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {

    $(document).ajaxError(function(e, x, settings, exception) {
        try {
            if (x.status == 0) {
                $('.errmsg.glblerr').html(EditorMod.errStyle + 'You are offline!!<br />Please Check Your Network.').show().fadeOut(4000);
            } else if (x.status == 404) {
                $('.errmsg.glblerr').html(EditorMod.errStyle + 'Requested URL "' + settings.url + '" not found.<br />').show().fadeOut(4000);
            } else if (x.status == 500) {
                $('.errmsg.glblerr').html(EditorMod.errStyle + 'Internel Server Error.<br />').show().fadeOut(4000);
            } else if (e == 'parsererror') {
                $('.errmsg.glblerr').html(EditorMod.errStyle + 'Error.\nParsing JSON Request failed.<br />').show().fadeOut(4000);
            } else if (e == 'timeout') {
                $('.errmsg.glblerr').html(EditorMod.errStyle + 'Request Time out.<br />').show().fadeOut(4000);
            } else {
                $('.errmsg.glblerr').html(EditorMod.errStyle + x.status + ' : ' + exception + '<br />\n').show().fadeOut(4000);
            }
        } catch (err) {
            $('.loading').hide();
            var errtxt = 'There was an error while processing your request.\n';
            errtxt += 'Error description: ' + err.description + '\n';
            errtxt += 'Click OK to continue.\n';
            alert(errtxt);
        }
    });

    getListOfCategoriesWth3DCntxt();

    initUIglobalPreDTload();

    if (EditorMod.context == "editorconfig") {

        var arrCtgries = ["pdbx_display_view_category_info", "pdbx_display_view_item_info"];
        var arrDispNames = ["Category View Info", "Item View Info"];

        initUIglobalPreDTload();

        //initializing variables used for book-keeping of edit actions performed by user
        initBookKeepingGlobal();

        resetDTrsltsArea();

        bLastTableLoaded = false;

        for (var i = 0; i < arrCtgries.length; i++) {
            $('#dt_rslts_combo').append('<div id="dtbl_' + (i + 1) + '" class="atomic_dt_container" style="margin-bottom: 10px; padding: 8px; border-style:solid; border-width:1px; border-color:#c1d6c1;"></div>');
            var cifCtgryNm = arrCtgries[i];
            var targetDivId = "dtbl_" + (i + 1);

            if (i == (arrCtgries.length - 1)) bLastTableLoaded = true;

            loadCategoryDT(cifCtgryNm, arrDispNames[i], targetDivId, bLastTableLoaded);

        }

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
    ////////////////////BEGIN: EVENT HANDLERS ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $("#editor_pane").on('change', 'select', function(event) {
        //alert($(this).text());
        $(this).parent().submit();
    });

    $('.glblchck').click(function() {
        var chckType = ($(this).attr('id').split("_"))[1];

        if (chckType == "dictconstr") {
            checkForDictViolations("all", "manual");
        } else if (chckType == "mndtrydata") {
            checkForMandatoryItems("all", "manual");
        }

    });

    $('.cifctgry_submit_see_json').click(function() {
        var cifCtgry = $(this).attr('name');
        loadTestExampleSeeJson(cifCtgry);
    });

    $(document).on("click", '.check_mandatory_items', function() {
        var btnName = $(this).attr('name');
        var cifCtgryNm = btnName.split('-')[1];
        if (cifCtgryNm != 'all') {
            EditorMod.CtgryConfig[cifCtgryNm].checkingMndtryItems = true;
        }
        checkForMandatoryItems(cifCtgryNm, "manual");
    });

    $(document).on("click", '.check_dict_violations', function() {
        var btnName = $(this).attr('name');
        var cifCtgryNm = btnName.split('-')[1];
        if (cifCtgryNm != 'all') {
            EditorMod.CtgryConfig[cifCtgryNm].checkingDictViolations = true;
        }
        checkForDictViolations(cifCtgryNm, "manual");
    });

    $('.cifctgry_submit').click(function() {
        //this handler currently only serves needs of the "Other" categories selections
        $('#dt_rslts_combo').html('').hide();

        var targetDivId = "dt_rslts_single";
        var $thisLink = $(this);
        var cifCtgry = $(this).attr('name');
        var dispLabel = $(this).val();
        var unitCrdnlty = $(this).hasClass("unit");
        // DEBUG alert("unitCrdnlty is: "+unitCrdnlty);
        if (dispLabel.length < 1) {
            dispLabel = $(this).text();
        }
        bLastTableLoaded = true;
        //alert(dispLabel);

        if (unitCrdnlty) {
            oCARDINALITY_DICT[cifCtgry] = "unit";
        }

        //below we reset count for # times DataTables fnDrawCallBack was called
        //EditorMod.iCnt_DrawBackCalledOnCurrentTbl = 0;
        loadCategoryDT(cifCtgry, dispLabel, targetDivId, bLastTableLoaded);
        $('#dt_rslts_single').show();

        EditorMod.currentCtgryNms = [];
        EditorMod.currentCtgryNms.push(cifCtgry);

        //DEBUG: alert("At end of submit handler and iCnt_DrawbackCalled for "+cifCtgry+" is: "+ EditorMod.CtgryConfig[cifCtgry].iCnt_DrawBackCalledOnCurrentTbl);

        updateChosenHighlight($thisLink);

        $('#skip_btns_grp').hide();

    });

    $('.multi_cifctgry_submit').click(function() {
        var $thisLink = $(this);
        var categories = $(this).attr('id');
        var arrSplitCtgries = categories.split('+');
        var btnName = $(this).attr('name');
        var btnId = $(this).attr('id');
        var arrSplitDispNames = btnName.split('+');

        if (EditorMod.expmethod == "ELECTRON MICROSCOPY") {
            /** 
            $('#dt_rslts_combo').height($(window.parent).height() - 400);
            $('#dt_rslts_combo').css({
            	overflow: 'auto'
                //overflowX: 'scroll'
            });
            **/
        }

        //initializing variables used for book-keeping of edit actions performed by user
        initBookKeepingGlobal();

        resetDTrsltsArea();

        loadMultiCategoryDT(categories, arrSplitDispNames);

        // -- Old code that makes a request per category
        /*
	bLastTableLoaded = false;

        for (var i = 0; i < arrSplitCtgries.length; i++) {
            $('#dt_rslts_combo').append('<div id="dtbl_' + (i + 1) + '" class="atomic_dt_container" style="margin-bottom: 10px; padding: 8px; border-style:solid; border-width:1px; border-color:#c1d6c1;"></div>');
            var cifCtgryNm = arrSplitCtgries[i];
            var targetDivId = "dtbl_" + (i + 1);

            if (i == (arrSplitCtgries.length - 1)) bLastTableLoaded = true;

            loadCategoryDT(cifCtgryNm, arrSplitDispNames[i], targetDivId, bLastTableLoaded);

        }
	*/

        updateChosenHighlight($thisLink);
        initSkipCalcControls(btnId);

    });

    $(document).on("click", '.skip_calc', function() {
        var task = $(this).attr('id').split('_')[1];
        //alert(task);
        var btnRequest = $(this).attr('value');
        if (btnRequest.startsWith('Undo')) {
            undoSkipCalc(task);
        } else {
            skipCalc(task);
        }
    });

    $(document).on("click", '.cifctgry_add_row', function() {
        var cifCtgry = $(this).attr('name');
        addNewRow(cifCtgry);
    });

    $(document).on("click", '.cifctgry_insert_row', function() {
        var cifCtgry = $(this).attr('name');
        insertRow(cifCtgry, EditorMod.currentRowSlctd);
    });

    $(document).on("click", '.cifctgry_delete_row', function() {
        var cifCtgry = $(this).attr('name');
        deleteRows(cifCtgry, EditorMod.currentRowSlctd, 1);
    });

    $(document).on("click", '.jmol_view', function() {
        var cifCtgry = $(this).attr('name');
        //alert("Load Jmol for row: "+EditorMod.currentRowSlctd);
        launchJmol(cifCtgry, EditorMod.currentRowSlctd);
    });

    /***$(document).on("mousedown", ".atomic_dt_container tbody tr input", function(e) {
    	if( (e.which == 2) ) {
    		$(this).trigger("paste");
  	      	//alert("middle button");
    	
  	   	}
	});
	***/

    $(document).on("click", ".atomic_dt_container tbody tr", function(event) {
        if (event.ctrlKey || event.metaKey) {
            handleRowSelectForAction($(this), event);
            return false;
        }
    });

    $(document).on("contextmenu", ".atomic_dt_container tbody tr", function(event) {
        handleRowSelectForAction($(this), event);
        return false;
    });

    $('.row_context_menu_choice').click(function(event) {
        var action = $(this).attr('id');
        if (action == 'insertrow') {

            $('#insert_row').dialog("open");
            $('select[name="insert_row_quantity"]').val('1');

            $('#chckbx_duplicate_viewid').prop('checked', true);

            if (EditorMod.currentRowSlctd_CtgryNm == "pdbx_display_view_item_info") {

                $('#chckbx_duplicate_prmryheading').prop('checked', false);
                $('#checkbox_duplicate_prmryheading').hide();

                $('#chckbx_duplicate_subheading').prop('checked', false);
                $('#checkbox_duplicate_subheading').hide();

                $('#checkbox_duplicate_category_display_name').show();
                $('#chckbx_duplicate_category_display_name').prop('checked', true);

            } else {
                $('#checkbox_duplicate_prmryheading').show();
                $('#chckbx_duplicate_prmryheading').prop('checked', true);

                $('#checkbox_duplicate_subheading').show();
                $('#chckbx_duplicate_subheading').prop('checked', true);

                $('#chckbx_duplicate_category_display_name').prop('checked', false);
                $('#checkbox_duplicate_category_display_name').hide();
            }

            $('#insert_row').dialog("option", "position", {
                my: "left-10 top-40",
                of: EditorMod.currentRowSlctd_TrNode
            });

        } else if (action == 'delrow') {
            $('#delete_row').dialog("open");
            $('select[name="delete_row_quantity"]').val('1');
            $('#delete_row').dialog("option", "position", {
                my: "left-10 top-40",
                of: EditorMod.currentRowSlctd_TrNode
            });

        }

        $("#context_menu").hide();

        return false; //have to return false here to prevent default behavior of <a> element, by which page scrolls to the top 

    });

    $(document).on("click", '#savedone', function() {
        exitEditor("done");
    });
    $(document).on("click", '#abort', function() {
        var proceed = confirm("Are you sure you want to leave this session and abort all changes?");
        if (proceed) {
            exitEditor("abort");
        }
    });
    $(document).on("click", '#saveunfinished', function() {
        exitEditor("unfinished");
    });

    $(document).on("click", '.undototal', function() {
        var thisBtn = $(this);
        var btnName = thisBtn.attr('name');
        var cifCtgryNm = btnName.split('-')[1];

        undoEdits(cifCtgryNm, "total");
    });

    $(document).on("click", '.undoincrmntl', function() {
        var thisBtn = $(this);
        var btnName = thisBtn.attr('name');
        var cifCtgryNm = btnName.split('-')[1];

        undoEdits(cifCtgryNm, "incremental");
    });

    $(document).on("click", '.pulltitle', function() {
        var thisBtn = $(this);
        var btnName = thisBtn.attr('name');
        var cifCtgryNm = btnName.split('-')[1];

        propagateTitle(cifCtgryNm);
    });

    // Below fix found necessary to address issue with [ENTER] key reloading entire page when jQuery UI modal dialog active.
    // Code sourced from: http://codingrecipes.com/jquery-ui-dialog-and-the-enter-return-key-problem
    $("#other-value-form").find('input').keypress(function(e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $(this).parent().parent().parent().parent().find('.ui-dialog-buttonpane').find('button:first').click(); /* Assuming the first one is the action button */
            return false;
        }
    });

    $(document).on("click", '#togglehdrinputs', function() {
        var thisBtn = $(this);
        var btnName = thisBtn.attr('name');
        var btnRequest = thisBtn.attr('value');

        if (btnRequest == "Show Column Filters") {
            thisBtn.attr('value', 'Hide Column Filters');
            $("tr.srch_hdrs").show();
        } else {
            thisBtn.attr('value', 'Show Column Filters');
            $("tr.srch_hdrs").hide();
        }
    });
    $(document).on("click", '.toggleshowallcols', function() {
        var thisBtn = $(this);
        var btnName = thisBtn.attr('name');
        var cifCtgryNm = btnName.split('-')[1];
        var btnRequest = thisBtn.attr('value');

        //DEGUG: alert("cifCtgryNm is: "+cifCtgryNm);

        if (btnRequest == "Show All Fields") {
            thisBtn.attr('value', 'Show Priority Fields Only');
            showHiddenCols(cifCtgryNm);
        } else {
            thisBtn.attr('value', 'Show All Fields');
            showJustPriorityCols(cifCtgryNm);
        }
        $('#toggleshowallcols-' + cifCtgryNm).removeClass("ui-state-focus");
    });
    $(document).on("click", '.transposevw', function() {
        var thisBtn = $(this);
        var btnName = thisBtn.attr('name');
        var cifCtgryNm = btnName.split('-')[1];
        var btnRequest = thisBtn.attr('value');

        //DEGUG: alert("cifCtgryNm is: "+cifCtgryNm);

        transposeTable(cifCtgryNm);

        $('#transposevw-' + cifCtgryNm).removeClass("ui-state-focus");
    });

    $(document).on("click", '#toggle_em_view', function() {
        var thisBtn = $(this);
        var btnRequest = thisBtn.attr('value');
        var bWantMapModelView = null;
        if (btnRequest == "Load Map+Model View") {
            $("#emmodelview").val("y");
            bWantMapModelView = true;
            //thisBtn.val("Map Only View");
        } else { //i.e. map only view requested
            $("#emmodelview").val("n");
            bWantMapModelView = false;
            //thisBtn.val("Map+Model View");
        }

        $('#toggle_em_view').removeClass("ui-state-focus");

        $('#hlprfrm').attr('action', EditorMod.URL.RELOAD_PAGE);

        $('#hlprfrm').submit();

    });

    $(document).on("click", '#transpose_vw_all', function() {
        var thisBtn = $(this);
        var btnRequest = thisBtn.attr('value');
        var bWantTrnspsdView = null;
        if (btnRequest == "Transpose View (All)") {
            thisBtn.val("Default View (All)");
            bWantTrnspsdView = true;
        } else {
            thisBtn.val("Transpose View (All)");
            bWantTrnspsdView = false;
        }

        var cifCtgryNm = null,
            oDTable = null,
            bThisTableState = null;

        for (var i = 0; i < EditorMod.currentCtgryNms.length; i++) {
            cifCtgryNm = EditorMod.currentCtgryNms[i];
            oDTable = $('#' + cifCtgryNm + '_tbl').dataTable();
            bIsThisTableTrnspsd = oDTable.fnTransposeState();

            if ((bWantTrnspsdView && !bIsThisTableTrnspsd) || (!bWantTrnspsdView && bIsThisTableTrnspsd)) {
                transposeTable(cifCtgryNm);
            }
        }

        $('#transpose_vw_all').removeClass("ui-state-focus");
    });
    //////////////////////////////////SCRIPTING TO PROTOTYPE USE OF SELECTION CHECKBOXES 2012-04-23 //////////////////////////////////////////////////////
    $('#testcheckboxes').click(function() {
        var rowIds = '';
        var rowCount = 0;
        $('#dt_rslts_single :checkbox:checked').each(function() {
            rowCount++;
            rowIds += ((rowIds.length > 0) ? ',' : '') + $(this).parents('td').attr('true_row_idx');
            //alert("Value of 'name' #"+ rowCount + ": " + $(this).attr('name') );
        });
        $('#rowids').val(rowIds);

        if (rowCount > 0) {
            alert("List of row IDs currently selected for cif category '" + EditorMod.currentCtgryNm + "' is: " + rowIds);
        } else {
            alert("Currently no row(s) selected for cif category '" + EditorMod.currentCtgryNm + "'");
        }
    });
    $(document).on("click", '.select_row', function() {
        var checked = this.checked;
        if (checked) {
            //alert('Captured click event and true row index for cell is:'+$(this).parents('td').attr('true_row_idx') );
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////END: EVENT HANDLERS ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////END: jQuery document ready function ////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
