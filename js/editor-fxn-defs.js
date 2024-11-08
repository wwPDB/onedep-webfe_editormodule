/**********************************************************************************************************************
File:		editor-fxn-defs.js
Author:		rsala (rsala@rcsb.rutgers.edu)
Date:		2012-08-10
Version:	0.0.1

JavaScript function definitions supporting General Annotation Editor Module web interface 

2012-08-10, RPS: File created in order to move function definitions from "editor-main.js" file to this dedicated file.
2012-08-13, RPS: Fix for correct book-keeping of records when handling added/deleted rows.
2013-02-05, RPS: Introduced support for simultaneous viewing of > 1 DataTable and for enforcing read-only protection
				  as required via cif meta dictionary.
2013-02-26, RPS: Introduced support for "undo"-ing edits.
2013-03-08, RPS: Adjusting behavior of custom jEditable calendar control. Updating jEditable placeholder text to "Double-click to edit"
2013-03-11, RPS: Improved behavior to disallow deletion of record when only one record left in the category, and now submitting default of
                 '?' when data for an attribute is deleted and results in empty value being submitted.
                 Also implemented confirm dialog to verify user intention in cases that user clicks on "Total" undo button
2013-03-13, RPS: Introduced support for sorting when require by given cif categories (currently 'citation_author' only category requiring this).
				 Improved handling for data validation with prompts to user indicating specific reasons for failure.
2013-03-15, RPS: Linking name of cif category to definition/description webpage
2013-03-18, RPS: Correcting for sorting behavior introduced for display of citation_author content.
2013-03-19, RPS: piloting strategy of "auto-increment" behavior on insertions for 'citation_author' and 'audit_author' categories. 
2013-04-04, RPS: Updated to give user choice to proceed/abort edit when validation flag is raised.
2013-04-05, RPS: Skipping validation when default values of "?" or "." are submitted on edits.
2013-04-05, RPS: Updating display of Undo buttons for better placement, labeling.
2013-04-24, RPS: Highlighting of mandatory items and functions to check whether these have non-null values.
2013-05-09, RPS: Specifying sServerMethod DataTable option to "POST" to eliminate occurrences of "414 : Request-URI Too Large" errors
2013-05-16, RPS: sServerMethod DataTable option specified as "GET" when viewing more than one cif category simultaneously because
 					column width/alignment issue was found when "POST" was being used.
2013-05-17, RPS: Removed obsolete code for handling transposed data that had been constructed server-side (strategy now abandoned)
					Now adopting new JavaScript strategy for doing this via use of 'Transpose.js' plugin.
2013-05-22, RPS: Fixed bug affecting proper handling of unit cardinality.
2013-06-06, RPS: Updates to support "Transpose View" and "Undo" functionality while viewing several DataTables at once on same page
2013-06-11, RPS: Improved datepicker (jQuery UI calendar widget) behavior to automatically submit on selection of a date value.
					Introduced use of "textarea" input types.
2013-06-14, RPS: Updated to add support for read-only table displays. Improved behavior on coordinating simultaneous "transpose", 
					"undo", "mandatory missing" functionalities.
2013-06-17, RPS: More improvements for handling of "undo", "mandatory missing" functionalities.
2013-06-18, RPS: Removing redundant call to fnDraw() in transposeTable() function.
2013-06-19, RPS: Improved DataTable behavior with browser resizes.
2013-12-06, RPS: Added "global" transpose view feature.
					Improved behavior of jEditable select controls so that submission occurs right away when user clicks on choice.
2014-02-03, RPS: Addressed bug so that hidden columns of a category designated as "read-only" are not editable when these are 
					brought into display by user
2014-02-06, RPS: Updates for additional categories/items requiring auto-increment/decrement handling of ordinal IDs.
					Now accommodating categories whose hidden items should be read-only when user decides to display these.
					Added highlighting of last selected navigation menu choice.
2014-02-24, RPS: Added support for handling requests to skip link/site/helix/sheet calculations when in Added Annotation context.
2014-03-28, RPS: Bug fix for absence of edit logging when user submits edited value that is beyond soft constraints.
2014-05-13, RPS: Improved handling of submitted edits for calendar widget.
2014-06-05, RPS: Updated with improved features for providing annotator with information regarding violation of dictionary constraints.
2014-07-09, RPS: Introduced changes that will eventually support "insertRow" functionality
2014-07-17, RPS: Deactivating tooltips shown for cells where non-null data hasn't been provided for a mandatory item.
					handleCifNull function added to eliminate presence of "?" or "." in editable field upon annotator editing
2014-09-22, RPS: removed call to updtDictViolationFlags on success callback of submission of edit as this was a big performance hit.
					also removed call to updateViolationFlagging on addNewRow (which is really just append action)
2015-01-22, RPS: jEditable behavior now activated on single click of mouse (not double-click)
2015-04-14, RPS: Introduced support for CIF Editor self-config.
					Updates to reflect move to jQuery 2.1.3, DataTables 1.10.5, and related plugins.
					Added "Abort" button to allow exit with abandon of any changes.
					(Introduced support for latent right-click/context-menu row operations -- i.e. delete/insert multiple rows)
2015-06-11, RPS: Updated to prevent horizontal scrollbars from appearing unnecessarily.
2015-06-09, RPS: Improved behavior of autocomplete controls so that new value is submitted as soon as user selects a listed option.
2015-06-12, RPS: Improved behavior by which columns specified for sort ascending are identified via server-side intelligence
2015-06-16, RPS: Feature for copying title data between "struct" and "citation" categories
2016-03-04, RPS: handleRowSelectForAction() updated so that option to insert row is not available when given cif category is of unit cardinality
2016-03-24, RPS: Removal of all "async: false" ajax calls and streamlining of code.
2016-04-19, RPS: Fixed bug introduced in last update regarding handling of cardinality for given cif table.
2016-05-24  EP:  Changed link from internal rcsb site for dictionary to mmcif.wwpdb.org
2017-05-22  EP:  For regular expression checking - provide a "soft" limit error - to ask for confirmation
2017-10-26  EP:  Add sorting support for em_author_list (getSortFlag())
2018-07-02  EP:  Improve performance by adding loadMultiCategoryDT()
***********************************************************************************************************************/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////BEGIN: FUNCTION DEFINITIONS /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// DataTable Helper Functions ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////
function loadMultiCategoryDT(cifCtgry, arrSplitDispNames) {
    //submit ajax call to get starter template that will ultimately be populated with data
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.DTBL_GET_MULTI_TMPLT,
        clearForm: false,
        dataType: 'json',
        //async: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
            formData.push({
                "name": "datafile",
                "value": DATAFILE
            });
            formData.push({
                "name": "displabels",
                "value": arrSplitDispNames
            }); //required so for mapping to backend view dict info 
        },
        success: function(jsonData) {
            var arrSplitCtgries = cifCtgry.split('+');
            for (var i = 0; i < arrSplitCtgries.length; i++) {
                $('#dt_rslts_combo').append('<div id="dtbl_' + (i + 1) + '" class="atomic_dt_container" style="margin-bottom: 10px; padding: 8px; border-style:solid; border-width:1px; border-color:#c1d6c1;"></div>');
                var cifCtgryNm = arrSplitCtgries[i];
                var targetDivId = "dtbl_" + (i + 1);
                var html = jsonData.html[cifCtgryNm];
                var ctgryData = jsonData.ctgry_dict[cifCtgryNm];
                // Chrome is complaining about a single task taking more than 50ms
                //setTimeout(setupCategoryDT(cifCtgryNm, html, ctgryData, targetDivId));
                setupCategoryDT(cifCtgryNm, html, ctgryData, targetDivId);
            }

            postDTloadSetup();
            return false;

        }
    })
};


function loadCategoryDT(cifCtgry, dispLabel, targetDivId, bLastTableLoaded) {
    //submit ajax call to get starter template that will ultimately be populated with data
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.DTBL_GET_TMPLT,
        clearForm: false,
        dataType: 'json',
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
            formData.push({
                "name": "datafile",
                "value": DATAFILE
            });
            formData.push({
                "name": "displabel",
                "value": dispLabel
            }); //required so for mapping to backend view dict info 
        },
        success: function(jsonData) {
            var ret = setupCategoryDT(cifCtgry, jsonData.html, jsonData.ctgry_dict, targetDivId);
            if (bLastTableLoaded == true) {
                postDTloadSetup();
            }

            return ret;
        } // end of success block

    })
};

function setupCategoryDT(cifCtgry, htmlData, ctgry_dict, targetDivId) {
    $('#' + targetDivId).html(htmlData); //populate target div with markup representing the "skeleton" starter table

    //initializing state of various screen controls
    initUIcifCtgry(cifCtgry);

    if (ctgry_dict) {
        //a non-null "ctgry_dict" means that we have a dictionary object from the server that serves as source of
        //configuration details that govern various settings for column, cell specific display details, validation behavior, etc.

        //derive a custom "Category" type JavaScript object based on the ctgry_dict 
        var newCategory = new Category();
        newCategory.loadFromJson(ctgry_dict);

        //if this is a revisit of a previously seen category, below we need to propagate any settings related to book-keeping of records 
        if (typeof EditorMod.CtgryConfig[cifCtgry] != "undefined") {
            if (typeof EditorMod.CtgryConfig[cifCtgry].bAddingNewRow != "undefined") {
                // here b/c value had been set so propagating state for this session as
                // pertains to whether user is adding new row(s)
                newCategory.bAddingNewRow = EditorMod.CtgryConfig[cifCtgry].bAddingNewRow;
            }
            if (typeof EditorMod.CtgryConfig[cifCtgry].originalTotalRows !== "undefined" && EditorMod.CtgryConfig[cifCtgry].originalTotalRows >= 0) {
                // here b/c value had been set so propagating value for this session as
                // pertains to total # rows initially in the datafile for this category
                newCategory.originalTotalRows = EditorMod.CtgryConfig[cifCtgry].originalTotalRows;
                newCategory.addedRows = EditorMod.CtgryConfig[cifCtgry].addedRows;
                newCategory.addedRowIds = EditorMod.CtgryConfig[cifCtgry].addedRowIds;
                newCategory.deletedRows = EditorMod.CtgryConfig[cifCtgry].deletedRows;
                newCategory.addingRowHwm = EditorMod.CtgryConfig[cifCtgry].addingRowHwm;
            }
        }

        //set presorted columns where necessary NOTE: SHOULD REPLACE THIS CODE WITH ACCOMMODATION VIA CONFIG FILE 
        newCategory.presorted_cols = [];

        var sortAscIdx = newCategory.getSortAscColIdx();
        if (sortAscIdx >= 0) {
            newCategory.presorted_cols = [
                [sortAscIdx, 'asc']
            ];
        }

        // below line is strategy for bookkeeping of references to Category objects for each cif category retrieved by the UI during user's session
        EditorMod.CtgryConfig[cifCtgry] = newCategory;

        /**FOR DEBUGGING 
	   alert("newCategory.bAddingNewRow is: "+newCategory.bAddingNewRow);
	   alert("col_displ_ordr is: "+newCategory.col_displ_ordr);
	   alert("vldt_err_flgs col[1]row[0] is: "+newCategory.vldt_err_flgs[1][0]);
	   alert("slct_opts[1] is: "+newCategory.slct_opts[1]);
	   alert("prmry_ky is: "+newCategory.prmry_ky);
	   alert("type of prmry_ky[0] is: "+typeof(newCategory.prmry_ky[0]) );
	   if( cifCtgry == 'citation_author' ){
	   alert("EditorMod.CtgryConfig['citation_author'].getPreSortedColumns() is: "+EditorMod.CtgryConfig[cifCtgry].getPreSortedColumns() );
	   }
	   
	   alert('getting EditorMod.CtgryConfig['+cifCtgry+'].getDataTblaoColumns() as'+ String(EditorMod.CtgryConfig[cifCtgry].getDataTblaoColumns()) );
	   alert('value of trnspd_tbl is: '+EditorMod.CtgryConfig[cifCtgry].trnspsd_tbl);
	   
	   var names = "";
	   for(var cifname in EditorMod.CtgryConfig){
	   names += cifname + "\n";
	   }
	   alert(names);
	***/

        var arrAiOrder, arrHiddenCols, primaryKeyForAaTargets;
        arrAiOrder = EditorMod.CtgryConfig[cifCtgry].getColDisplOrder();
        arrHiddenCols = EditorMod.CtgryConfig[cifCtgry].getHiddenColumns();
        primaryKeyForAaTargets = EditorMod.CtgryConfig[cifCtgry].getPrimaryKey();

        var oTable;
        /***TRANSPOSE**/
        var sTrnsps = 'Z';
        /*
	  var sServerMethod = 'GET'; //20130517, had to use "GET" b/c currently using "POST" in context of simultaneous view of >1 datatable seemed to cause lag/column sizing/alignment issue.
          if (cifCtgry == 'refine') {
            sServerMethod = 'POST'; // seeing issues with 'GET' when number of data elements is large enough to exceed 'GET' method limits of supportable number of query parameters
            }
	*/
	// Windows 10 is causing issues with too long uris.
	// It is truncating requests in what it sends to server.
	sServerMethod = 'POST';

        // Start of DataTble constructor
        oTable = $('#' + cifCtgry + '_tbl').dataTable({
            "sDom": sTrnsps + 'RC<"categorynamelabel_' + cifCtgry + ' fltlft"><"hdrhelptxt fltlft"><"fltrgt"f><"tgglshwallcols_' + cifCtgry + ' fltrgt"><"trnspsvw_' + cifCtgry + ' fltrgt"><"chck_mndtry_itms_' + cifCtgry + ' fltrgt"><"pulltitle_' + cifCtgry + ' fltrgt"><"chck_dict_vltns_' + cifCtgry + ' fltrgt"><"undobtns_' + cifCtgry + ' fltrgt">rtip',
            "oLanguage": {
                "sSearch": "Search all columns:"
            },
            "bSortCellsTop": true,
            "bProcessing": true,
            "bServerSide": true,
            "sAjaxSource": EditorMod.URL.DTBL_AJAX_LOAD,
            "sServerMethod": sServerMethod,
            "fnServerParams": function(aoData) {
                aoData.push({
                    "name": "cifctgry",
                    "value": cifCtgry
                });
                aoData.push({
                    "name": "sessionid",
                    "value": SESSION_ID
                });
                aoData.push({
                    "name": "datafile",
                    "value": DATAFILE
                });
                aoData.push({
                    "name": "filesource",
                    "value": FILE_SOURCE
                });
            },
            "sScrollX": "100%",
            //"sScrollXInner": "50%",
            "bScrollCollapse": true,
            "iDisplayLength": getDisplayLength(cifCtgry),
            "bPaginate": true,
            "sPaginationType": "full_numbers",
            "bLengthChange": false,
            "bFilter": true,
            "bSort": getSortFlag(cifCtgry),
            "bInfo": true,
            "bAutoWidth": true,
            //"bStateSave": true,
            "fnInitComplete": function(oSettings, json) {
                /***
                 * Using this callback as an opportunity for any custom DataTables initialization tasks required 
                 * in context of  our custom CifEditor. So tasks went into this callback when such tasks only needed
                 * to occur once after loading of data. i.e. as opposed to being placed in fnDrawCallback callback
                 * which gets called on every draw of the table that may result after resorting, filtering, etc.
                 */
                var iColCnt = EditorMod.CtgryConfig[cifCtgry].getNumCols();
                if (EditorMod.CtgryConfig[cifCtgry].originalTotalRows == null) {
                    //if value is negative then un-initialized so capture total #rows originally in datafile for cif category
                    EditorMod.CtgryConfig[cifCtgry].originalTotalRows = oSettings.fnRecordsTotal();
                    EditorMod.CtgryConfig[cifCtgry].addingRowHwm = EditorMod.CtgryConfig[cifCtgry].originalTotalRows; //i.e. High Water Mark initialized = originalTotalRows
                }
                // DEBUG alert("addingRowHwm is now: "+EditorMod.CtgryConfig[cifCtgry].addingRowHwm);

                // "pull title" buttons
                if (["citation", "struct"].indexOf(cifCtgry) >= 0) {
                    var sourceCategory = (cifCtgry == "citation") ? "struct" : "citation";
                    $('.pulltitle_' + cifCtgry).html('<input id="pulltitle-' + cifCtgry + '" name="pulltitle-' + cifCtgry + '" value="Copy Title from &quot;' + sourceCategory + '&quot;" title="Pull Title from &quot;' + sourceCategory + '&quot;" class="fltlft pulltitle" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />');
                    $('#pulltitle-' + cifCtgry).button();
                }

                // undo buttons
                $('.undobtns_' + cifCtgry).html('<input id="undototal-' + cifCtgry + '" name="undototal-' + cifCtgry + '" value="Undo (Reset)" title="Undo (Reset)" class="fltlft displaynone undo undototal" type="button" style="margin-top: 8px; margin-right: 8px; font-size: .8em;" />' +
                    '<input id="undoincrmntl-' + cifCtgry + '" name="undoincrmntl-' + cifCtgry + '" value="Undo (Incremental)" title="Undo (Incremental)" class="fltlft displaynone undo undoincrmntl" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />');

                // 2013-06-10 -- no sure at this time if we need global "reset" undo for all info currently on the screen  
                $('.undogrp').html('');
                //$('#undobtns_grp').html('<input id="undototal" name="undototal" value="Undo (Reset)" title="Undo (Reset)" class="fltlft displaynone undo" type="button" style="margin-top: 8px; margin-right: 8px; font-size: .8em;" />').hide();

                if (arrHiddenCols.length) {
                    // generate "Show All Fields" vs. "Show Priority Columns only" button but only if there are hidden columns to be revealed for this category							
                    $('.tgglshwallcols_' + cifCtgry).html('<input id="toggleshowallcols-' + cifCtgry + '" name="toggleshowallcols-' + cifCtgry + '" value="Show All Fields" class="fltlft toggleshowallcols" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />');
                    $('#toggleshowallcols-' + cifCtgry).button();
                }
                /***TRANSPOSE***/
                /////////////////////////////////////////////////////////
                // provide "Transpose View" button/functionality
                /////////////////////////////////////////////////////////
                if (EditorMod.context != "editorconfig") {
                    $('.trnspsvw_' + cifCtgry).html('<input id="transposevw-' + cifCtgry + '" name="transposevw-' + cifCtgry + '" value="Transpose View" class="fltlft transposevw" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />');
                    $('#transposevw-' + cifCtgry).button();
                }

                var bTransposeState = oTable.fnTransposeState(false);
                oTable.fnTranspose(false);
                //alert("bTransposeState is: "+bTransposeState);

                /***
                    var arrPriorityCols =  EditorMod.CtgryConfig[cifCtgry].getPriorityColumns();
                    //alert("arrPriorityCols length is: "+arrPriorityCols.length);
                    if( EditorMod.CtgryConfig[cifCtgry].originalTotalRows == 1 && arrPriorityCols.length > EditorMod.iTransposeThrshld ){
                    // if originally only a single row and there are enough fields in the row to warrant, then set default view to already be transposed
                    bTransposeState = true;
                    }
                ***/

                /***TRANSPOSE END***/
                // provide "Check Mandatory Items" functionality
                if (EditorMod.context != "editorconfig") {
                    $('.chck_mndtry_itms_' + cifCtgry).html('<input id="check_mandatory_items-' + cifCtgry + '" name="check_mandatory_items-' + cifCtgry + '" value="Check Mandatory Items" class="fltlft check_mandatory_items" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />');
                    $('#check_mandatory_items-' + cifCtgry).button();
                }


                // uncomment to provide "Check Dict Violations" functionality at indiv cif category level
                //$('.chck_dict_vltns_'+cifCtgry).html('<input id="check_dict_violations-'+cifCtgry+'" name="check_dict_violations-'+cifCtgry+'" value="Check Dictionary Violations" class="fltlft check_dict_violations" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />')
                //$('#check_dict_violations-'+cifCtgry).button();

                //$('.hdrhelptxt').html('<div style="margin-top: 17px; margin-left: 60px;">Unprotected fields are editable on double-click.</div>');

                // intializing appearance of buttons used for providing functionality related to actions on selecting a specific row in the DataTable
                $('.' + cifCtgry + '_row_action').button();

                // provide label of cif category name which links to dictionary meta description if being launched under self-admin context 
                var addOn = "";
                if (cifCtgry == "pdbx_display_view_category_info") {
                    addOn = ' id="help_pdbx_display_view_category_info" title="title" ';
                }
                if (cifCtgry == "pdbx_display_view_item_info") {
                    addOn = ' id="help_pdbx_display_view_item_info" title="title" ';
                }

                $('.categorynamelabel_' + cifCtgry).html('<h3>Category: <span ' + addOn + '><a href="https://mmcif.wwpdb.org/dictionaries/mmcif_pdbx_v5_next.dic/Categories/' + cifCtgry + '.html" target="_blank" >' + cifCtgry + '</a></span></h3>');

                oTable.width("100%");
                oTable.fnAdjustColumnSizing(); //SEEMS WE NEED TO DO THIS TO ENSURE THAT COLUMN HEADERS ALIGN PROPERLY WITH COLUMNS UNDERNEATH

                $(window).resize(function() {
                    oTable.fnAdjustColumnSizing();
                    /***TRANSPOSE***/
                    var isTransposed = oTable.fnTransposeState();
                    if (isTransposed) {
                        oTable.width("100%");
                        $('#' + cifCtgry + '_tbl_wrapper .dataTables_scrollHead').hide(); //NEED TO INVESTIGATE WHY THIS IS NEEDED, CHECK PLUGIN CODE
                    }
                    /***TRANSPOSE END***/
                });
                if (EditorMod.CtgryConfig[cifCtgry].originalTotalRows > EditorMod.iSrchHeadersThrshld || cifCtgry == "citation_author") {
                    // i.e. only showing search header filter boxes when number of total rows is large enough to make this of any value
                    $('#' + targetDivId + ' tr.srch_hdrs').show();

                    // !!!MUST MAKE THE FOLLOWING TWO CALLS IN THE GIVEN ORDER TO HAVE THE COLUMNS ALIGN/SPACE WITH THE SEARCH HEADERS PROPERLY 
                    oTable.fnDraw();
                    oTable.fnAdjustColumnSizing();

                }

            },
            "fnDrawCallback": function() {
                EditorMod.CtgryConfig[cifCtgry].iCnt_DrawBackCalledOnCurrentTbl += 1;
                //alert("In fnDrawCallback and EditorMod.iCnt_DrawBackCalledOnCurrentTbl is now: "+EditorMod.iCnt_DrawBackCalledOnCurrentTbl);
                //DEBUG: alert("In fnDrawCallback for "+cifCtgry+" and new iCnt_DrawBackCalledOnCurrentTbl is now: "+EditorMod.CtgryConfig[cifCtgry].iCnt_DrawBackCalledOnCurrentTbl);

                if (!ctgryIsReadOnly(cifCtgry)) {
                    applyJeditable(cifCtgry, oTable);
                }

                applySearchHeaderFunctions(targetDivId, cifCtgry, oTable);

                //$('.togglehdrinputs').html('<input id="togglehdrinputs" name="togglehdrinputs" value="Show Column Filters" class="fltlft" type="button" style="margin-left: 185px; margin-top: 5px">')
                //alert("Inside fnDrawCallback and EditorMod.CtgryConfig[cifCtgry].bAddingNewRow is: "+EditorMod.CtgryConfig[cifCtgry].bAddingNewRow);

                //next if-else block removes pagination controls if only 1 page exists for the dataset
                //i.e. if total number of records in dataset divided by configured value for #records in a "page" gives value
                //that requires greater than 1 page for navigation then display pagination markup, otherwise don't
                if (Math.ceil((this.fnSettings().fnRecordsDisplay()) / this.fnSettings()._iDisplayLength) > 1) {
                    $('#' + targetDivId + ' .dataTables_paginate').css("display", "block");
                    $('#' + targetDivId + ' .dataTables_length').css("display", "block");
                    $('#' + targetDivId + ' .dataTables_filter').css("display", "block");
                } else {
                    $('#' + targetDivId + ' .dataTables_paginate').css("display", "none");
                    $('#' + targetDivId + ' .dataTables_length').css("display", "none");
                    if (EditorMod.context != "editorconfig") {
                        $('#' + targetDivId + ' .dataTables_filter').css("display", "none");
                    }
                }


                var sSuffix = '_tbl';

                /***TRANSPOSE ***/
                if (oTable.fnTransposeState()) {
                    $('#' + cifCtgry + '_tbl_wrapper input.search_init').parent().hide();
                    //$('#'+targetDivId+' tr.srch_hdrs').hide();  // NEED TO INVESTIGATE WHY THIS DOESN'T WORK
                    $('#' + cifCtgry + "_record_actions").hide();
                    sSuffix = '_tbl_transpose';
                } else {
                    if (!EditorMod.CtgryConfig[cifCtgry].unitCrdnlty) $('#' + cifCtgry + "_record_actions").show();
                    //$('#'+targetDivId+' tr.srch_hdrs').show();  // NEED TO INVESTIGATE WHY THIS DOESN'T WORK
                    $('#' + cifCtgry + '_tbl_wrapper input.search_init').parent().show();
                }
                // next if-block handles highlighting of mandatory cols that are missing data values.
                if (typeof EditorMod.currentMndtryViolations[cifCtgry] != 'undefined' && EditorMod.currentMndtryViolations[cifCtgry].length > 0) {
                    for (var i = 0; i < EditorMod.currentMndtryViolations[cifCtgry].length; i++) {
                        $('#' + cifCtgry + sSuffix).find('td[true_row_idx="' + EditorMod.currentMndtryViolations[cifCtgry][i][0] + '"][true_col_idx="' + EditorMod.currentMndtryViolations[cifCtgry][i][1] + '"]').addClass('mndtry_missing'); //.prop('title', "Must supply value for this required item.");	
                    }
                }

                // next if-block handles highlighting of cols that are in violation of dictionary constraints.
                if (typeof EditorMod.currentDictViolations[cifCtgry] != 'undefined' && EditorMod.currentDictViolations[cifCtgry].length > 0) {
                    for (var i = 0; i < EditorMod.currentDictViolations[cifCtgry].length; i++) {
                        $('#' + cifCtgry + sSuffix).find('td[true_row_idx="' + EditorMod.currentDictViolations[cifCtgry][i][0] + '"][true_col_idx="' + EditorMod.currentDictViolations[cifCtgry][i][1] + '"]').addClass('dict_violation');
                        if (typeof EditorMod.currentDictViolations[cifCtgry].violtn_msgs != "undefined") {
                            $('#' + cifCtgry + sSuffix).find('td[true_row_idx="' + EditorMod.currentDictViolations[cifCtgry][i][0] + '"][true_col_idx="' + EditorMod.currentDictViolations[cifCtgry][i][1] + '"]').prop('title', EditorMod.currentDictViolations[cifCtgry].violtn_msgs[i]);
                        }
                    }
                }
                $('td.dict_violation').tooltip({
                    //track : true,
                    show: {
                        effect: "slideDown",
                        delay: 250
                    },
                    open: function(event, ui) {
                        EditorMod.dictViolationsTooltip = true;
                    }
                });
                /***$('td.mndtry_missing').tooltip( {
		 //track : true,
		 show : {
		 effect: "slideDown",
		 delay: 250},
		 open: function( event, ui ) { EditorMod.mndtryViolationsTooltip = true; }
		 });***/
                $('th.cifitemhdr').tooltip({
                    //track : true,
                    show: {
                        //effect: "slideDown",
                        delay: 150
                    }
                });


                if (cifCtgry == "pdbx_display_view_category_info") {
                    $('#help_pdbx_display_view_category_info').tooltip({
                        content: function() {
                            return $('#pdbx_display_view_category_info_help').html();
                        },
                        position: {
                            my: "left top-50",
                            at: "right+30 top"
                        },
                        open: function(event, ui) {
                            ui.tooltip.css("max-width", "1200px");
                        }
                    });
                }
                if (cifCtgry == "pdbx_display_view_item_info") {
                    $('#help_pdbx_display_view_item_info').tooltip({
                        content: function() {
                            return $('#pdbx_display_view_item_info_help').html();
                        },
                        position: {
                            my: "left top-50",
                            at: "right+30 top"
                        },
                        open: function(event, ui) {
                            ui.tooltip.css("max-width", "1200px");
                        }
                    });
                }

            },
            "oColReorder": {
                "aiOrder": arrAiOrder,
                "iFixedColumns": EditorMod.CtgryConfig[cifCtgry].getNumCols()
            },
            "aaSorting": EditorMod.CtgryConfig[cifCtgry].getPreSortedColumns(),
            "aoColumns": EditorMod.CtgryConfig[cifCtgry].getDataTblaoColumns(), // we set aoColumns b/c DataTables seems to need this to serve as col mapping key when undertaking column reordering 
            "aoColumnDefs": [{
                    "aTargets": primaryKeyForAaTargets,
                    "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {

                        /*** DEBUGGING
			 if( iRow == 0 ){
			 //alert("Inside fnCreatedCell for prmary keys and EditorMod.CtgryConfig[cifCtgry].bAddingNewRow is: "+EditorMod.CtgryConfig[cifCtgry].bAddingNewRow);
			 //alert("Inside fnCreatedCell for prmary keys and EditorMod.CtgryConfig[cifCtgry].originalTotalRows is: "+EditorMod.CtgryConfig[cifCtgry].originalTotalRows);
			 //alert("fnRecordsTotal() returns: "+ oSettings.fnRecordsTotal());
			 }
		    **/
                        var $nTd = $(nTd);
                        var iTrueColIdx = getTrueColIdx_DataTable(EditorMod.CtgryConfig[cifCtgry], iCol);
                        var bTrnspsdTbl = $(this).hasClass('trnspsd_tbl');
                        //if( iRow == 0 ) alert("fnCreatedCell for primary key, about to get true row idx for iRow: "+iRow);
                        var iTrueRowIdx = getTrueRowIdx_DataTable(nTd, iRow);
                        //if( iRow == 0 ) alert("fnCreatedCell for primary key, true row idx for iRow returned as: "+iTrueRowIdx);
                        //apply primary key flag via custom class
                        if (!bTrnspsdTbl) {
                            var specialCases = ['cell', 'pdbx_refine_tls_group', 'struct_ncs_ens', 'struct_ncs_dom', 'struct_ncs_dom_lim', 'struct_ncs_dom_lim', 'refine_ls_restr_ncs'];
                            var writeProtectHiddenCol = false;
                            if (specialCases.indexOf(cifCtgry) >= 0 && arrHiddenCols.indexOf(parseInt(iTrueColIdx)) >= 0) {
                                writeProtectHiddenCol = true;
                            }

                            $nTd.addClass('prmry_key');
                            applyReadOnlyProtection(cifCtgry, $nTd, iTrueColIdx, writeProtectHiddenCol);
                            applyMandatoryHighlight(cifCtgry, $nTd, iTrueColIdx);

                        }

                        if (bTrnspsdTbl) {
                            $nTd.addClass('trnspsd');
                            if ((EditorMod.CtgryConfig[cifCtgry].getPrimaryKey()).indexOf(parseInt(iTrueRowIdx)) > -1) {
                                //$nTd.addClass('prmry_key').addClass('immutable');
                                //NOTE: commented out above so that read-only behavior is enforced solely by config file and not automatically tied to primary key status
                                $nTd.addClass('prmry_key');
                            }
                        }

                        applyNewRecordAttrib(cifCtgry, $nTd, iTrueRowIdx, bTrnspsdTbl);

                        //create custom attribute to store true absolute column index (i.e. value that can be used to reference server-side data element
                        $nTd.attr('true_col_idx', iTrueColIdx);
                        $nTd.attr('true_row_idx', iTrueRowIdx);

                    }
                },
                {
                    "aTargets": arrHiddenCols,
                    "bVisible": false,
                    "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {

                        /*** DEBUGGING
					  if( iRow == 0 ){
					  //alert("Inside fnCreatedCell for prmary keys and EditorMod.CtgryConfig[cifCtgry].bAddingNewRow is: "+EditorMod.CtgryConfig[cifCtgry].bAddingNewRow);
					  //alert("Inside fnCreatedCell for prmary keys and EditorMod.CtgryConfig[cifCtgry].originalTotalRows is: "+EditorMod.CtgryConfig[cifCtgry].originalTotalRows);
					  //alert("fnRecordsTotal() returns: "+ oSettings.fnRecordsTotal());
					  }
				     **/
                        var $nTd = $(nTd);
                        var iTrueColIdx = getTrueColIdx_DataTable(EditorMod.CtgryConfig[cifCtgry], iCol);
                        var bTrnspsdTbl = $(this).hasClass('trnspsd_tbl');
                        //if( iRow == 0 ) alert("fnCreatedCell for primary key, about to get true row idx for iRow: "+iRow);
                        var iTrueRowIdx = getTrueRowIdx_DataTable(nTd, iRow);
                        //if( iRow == 0 ) alert("fnCreatedCell for primary key, true row idx for iRow returned as: "+iTrueRowIdx);
                        //apply primary key flag via custom class
                        var specialCases = ['cell', 'pdbx_refine_tls_group', 'struct_ncs_ens', 'struct_ncs_dom', 'struct_ncs_dom_lim', 'struct_ncs_dom_lim', 'refine_ls_restr_ncs'];
                        var writeProtectHiddenCol = false;
                        if (specialCases.indexOf(cifCtgry) >= 0) {
                            writeProtectHiddenCol = true;
                        }

                        if (!bTrnspsdTbl) {
                            applyReadOnlyProtection(cifCtgry, $nTd, iTrueColIdx, writeProtectHiddenCol);
                            applyMandatoryHighlight(cifCtgry, $nTd, iTrueColIdx);
                        }

                        if (bTrnspsdTbl) {
                            $nTd.addClass('trnspsd');
                        }

                        applyNewRecordAttrib(cifCtgry, $nTd, iTrueRowIdx, bTrnspsdTbl);

                        //create custom attribute to store true absolute column index (i.e. value that can be used to reference server-side data element
                        $nTd.attr('true_col_idx', iTrueColIdx);
                        $nTd.attr('true_row_idx', iTrueRowIdx);

                    }
                },
                {
                    "aTargets": ["_all"],
                    "fnCreatedCell": function(nTd, sData, oData, iRow, iCol) {
                        var $nTd = $(nTd);
                        var iTrueColIdx = getTrueColIdx_DataTable(EditorMod.CtgryConfig[cifCtgry], iCol);
                        var bTrnspsdTbl = $(this).hasClass('trnspsd_tbl');
                        var iTrueRowIdx = getTrueRowIdx_DataTable(nTd, iRow);

                        //DEV TESTING for favorites styling
                        if (iTrueColIdx > 0 && iTrueColIdx < 4) $nTd.addClass('favorite');

                        //create custom attribute to store true absolute column index (i.e. value that can be used to reference server-side data element
                        $nTd.attr('true_col_idx', iTrueColIdx);
                        $nTd.attr('true_row_idx', iTrueRowIdx);

                        if (!bTrnspsdTbl) {
                            applyReadOnlyProtection(cifCtgry, $nTd, iTrueColIdx, false);
                            applyMandatoryHighlight(cifCtgry, $nTd, iTrueColIdx);
                        }

                        //apply "newrecord" class as necessary
                        applyNewRecordAttrib(cifCtgry, $nTd, iTrueRowIdx, bTrnspsdTbl);

                        //apply validation flags via custom classes
                        var vldtFlgColIdx;
                        var vldtFlgRowIdx;

                        if (bTrnspsdTbl) {
                            $nTd.addClass('trnspsd');
                            vldtColIdx = iTrueRowIdx;
                            vldtRowIdx = iCol - 1;
                        } else {
                            vldtColIdx = iCol;
                            vldtRowIdx = iTrueRowIdx;
                        }
                        if (EditorMod.CtgryConfig[cifCtgry].getVldtFlags(vldtColIdx, vldtRowIdx)) $nTd.addClass("vldt_flg").addClass(String(EditorMod.CtgryConfig[cifCtgry].getVldtFlags(vldtColIdx, vldtRowIdx)));


                    }
                }
            ]
        }); // end of DataTable constructor

        EditorMod.oDataTable = oTable;

    } // end of check for ctgry_dict conditional

    initBookKeepingCifCtgry(cifCtgry);

    return false;
};

function postDTloadSetup() {
    /***************************************************************************
     * setup necessary at point after all DataTables are 
     * loaded onto page for a given "fetch session" 
     *****************************************************************************/
    initUIglobalPostDTload();
    createInitRollbackPoint();
}

function initBookKeepingGlobal() {
    /***************************************************************************
     * 	initializing variables used for book-keeping of edit actions performed by user
     *****************************************************************************/
    EditorMod.currentCtgryNms = []; // resetting list to track which cif categories are being brought into current view
    EditorMod.editActnIndx = 0; //re-initializing counter with value of 1 with every load of new DataTable
    EditorMod.deleteRowActns = [];
    EditorMod.addRowActns = [];
}

function initUIglobalPreDTload() {
    /***************************************************************************
     * intialize state of UI components 
     *****************************************************************************/
    initJqueryUiComponents();

    if (EditorMod.expmethod == "ELECTRON MICROSCOPY") {
        $('#toggle_em_view').button().show();
        $('#em_view_label').show();
        //checkForDictViolations("all","manual");
    } else {
        $('#toggle_em_view').hide();
        $('#em_view_label').hide();
    }

    $("#context_menu").menu();
    $('#context_menu_content').show();

    $("#check_mandatory_items-all").show();
    $("#check_dict_violations-all").show();

    if (EditorMod.context == "editorconfig") {
        $('#help_editor_ui_admin').tooltip({
            content: function() {
                return $('#helpcontent').html();
            },
            position: {
                my: "right-1000 top",
                at: "left top-135"
            },
            open: function(event, ui) {
                ui.tooltip.css("max-width", "1200px");
            }
        });

    } else {
        $('#global_check_menu').menu().show();
        //checkForDictViolations("all","manual");
    }


}

function resetDTrsltsArea() {
    /***************************************************************************
     *  this function is necessary for resetting the "results" section of the webpage
     *  so that any calls to load a new set of cif categories onto the page
     *  will result in properly displayed sections for each cif category 
     *****************************************************************************/
    $('#dt_rslts_combo').html('');
    $('#dt_rslts_single').html('').hide();
    $('#dt_rslts_combo').show();
}

function initUIglobalPostDTload() {
    /***************************************************************************
     * intialize state of UI components 
     *****************************************************************************/

    $('.undo').hide();

    if (EditorMod.context != "editorconfig") {
        showCheckViolButtons();

        /***TRANSPOSE*/
        $("#transpose_vw_all").show();
        toggleTransposeAllBtn();
    }

    $('#colorlegend').show();

}

function initJqueryUiComponents() {
    /***************************************************************************
     * intialize jQuery UI components 
     *****************************************************************************/
    //initialize "Other Value" form as jQuery UI dialog box
    $("#other-value-form").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Submit": function(event) {
                var bValid = true;
                var otherValue = $("#othervalue").val();
                if (otherValue.length == 0) bValid = false;
                if (bValid) {
                    //Propagate value to input field
                    //var option = $('<option />').attr("value", otherValue).text(otherValue).attr('selected','selected');
                    var option = $('<option />').attr("value", otherValue).text(otherValue).prop('selected', true);
                    $('#' + EditorMod.otherValInputId).append(option);
                    if (EditorMod.bMultiSlctType) {
                        $('#' + EditorMod.otherValInputId).children().each(function() {
                            if (EditorMod.selectedVals.indexOf($(this).html()) != -1) {
                                //alert("found match for: "+$(this).html());
                                //$(this).attr('selected', 'selected');
                                $(this).prop('selected', true);
                            }
                            if ("Other".indexOf($(this).html()) != -1) {
                                //$(this).removeAttr("selected");
                                $(this).prop("selected", false);
                            }
                        });
                    } else {
                        $('#' + EditorMod.otherValInputId).val(otherValue).submit();
                    }
                    $(this).dialog("close");
                } else {
                    alert("Cannot submit an empty string.");
                    return false;
                }
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            //any clean-up actions required
        }
    });

    // initialize Insert Row dialog as jQuery UI dialog box
    $("#insert_row").dialog({
        autoOpen: false,
        height: (EditorMod.context == "editorconfig") ? 370 : 250,
        width: 350,
        modal: true,
        buttons: {
            "OK": function() {
                var cloneItemArr = new Array();
                $('#insert_row :checkbox:checked').each(function() {
                    value = $(this).val();
                    cloneItemArr.push(value);
                });

                var numRowsToInsert = $('select[name="insert_row_quantity"]').val();

                /**for( var x=0; x < numRowsToInsert; x++ ){
                	insertRow(EditorMod.currentRowSlctd_CtgryNm,EditorMod.currentRowSlctd,cloneItemArr);
                }***/

                insertRows(EditorMod.currentRowSlctd_CtgryNm, EditorMod.currentRowSlctd, cloneItemArr, numRowsToInsert);

                $(this).dialog("close");

            },
            Cancel: function() {
                $(this).dialog("close");
                $("#context_menu").hide();
            }
        },
        close: function() {
            // any clean-up actions required
        }
    });

    // initialize Delete Row dialog as jQuery UI dialog box
    $("#delete_row").dialog({
        autoOpen: false,
        height: (EditorMod.context == "editorconfig") ? 300 : 275,
        width: 350,
        modal: true,
        buttons: {
            "OK": function() {
                var numRowsToDelete = $('select[name="delete_row_quantity"]').val();

                /***for( var x=0; x < numRowsToDelete; x++ ){
                	deleteRow(EditorMod.currentRowSlctd_CtgryNm,EditorMod.currentRowSlctd);
                }***/

                deleteRows(EditorMod.currentRowSlctd_CtgryNm, EditorMod.currentRowSlctd, numRowsToDelete);

                $(this).dialog("close");

            },
            Cancel: function() {
                $(this).dialog("close");
                $("#context_menu").hide();
            }
        },
        close: function() {
            // any clean-up actions required
        }
    });

    // initialize jQuery UI buttons
    $("#savedone").button().tooltip();
    $("#abort").button().tooltip();
    $("#check_mandatory_items-all").button().hide();
    $("#check_dict_violations-all").button().hide();
    $("#transpose_vw_all").button().hide();
}

function initSkipCalcControls(btnId) {
    /***************************************************************************
     * intialize state of "Skip Link Calc" and "Skip Site Calc" buttons 
     * 
     *		params:
     *				btnId --> indicates which navigation button selection was made
     *				(which determines which cif categories are requested for the current view)
     *				
     *****************************************************************************/
    var contextsRequiringSkipCalc = ["annotation", "summaryreport", "em", "nmr"];

    if (contextsRequiringSkipCalc.indexOf(EditorMod.context) >= 0) {
        $('#skip_btns_grp').show();
        if (btnId == "struct_conn+struct_mon_prot_cis+pdbx_modification_feature") {
            $('#skip_site').hide();
            $('#skip_solventpos').hide();
            $('.skip_scndry_strctr').hide();
            checkSkipCalc('linkdisulf');
            // $('#skip_link').show().button();
            $('#skip_linkdisulf').show().button();
            //$('#skip_btns_grp').html('<input id="skip" name="skip" value="skip" class="" type="button" style="margin-top: 8px; font-size: .8em;" />');
        } else if (btnId == "struct_site+struct_site_gen") {
            //$('#skip_link').hide();
            $('#skip_linkdisulf').hide();
            $('#skip_solventpos').hide();
            $('.skip_scndry_strctr').hide();
            checkSkipCalc('site');
            $('#skip_site').show().button();
            //$('#skip_btns_grp').html('<input id="skip" name="skip" value="skip" class="" type="button" style="margin-top: 8px; font-size: .8em;" />');
        } else if (btnId == "pdbx_distant_solvent_atoms+pdbx_solvent_atom_site_mapping") {
            //$('#skip_link').hide();
	    $('#skip_linkdisulf').hide();
            $('#skip_site').hide();
            $('.skip_scndry_strctr').hide();
            checkSkipCalc('solventpos');
            $('#skip_solventpos').show().button();
        } else if (btnId == "struct_sheet_order+struct_sheet+pdbx_struct_sheet_hbond+struct_sheet_range" || btnId == "struct_conf+struct_conf_type") {
            // $('#skip_link').hide();
            $('#skip_linkdisulf').hide();
            $('#skip_site').hide();
            $('#skip_solventpos').hide();
            checkSkipCalc('helix');
            checkSkipCalc('sheet');
            $('.skip_scndry_strctr').show().button();
        } else {
            $('#skip_btns_grp').hide();
        }
    }
}

function initUIcifCtgry(cifCtgry) {
    /***************************************************************************
     * intialize state of UI components
     * 
     *		params:
     *				cifCtgry --> cif category name
     *				
     *****************************************************************************/
    $('.' + cifCtgry + '_row_action.onrowselect').hide();
    $('#unselect_' + cifCtgry).hide();
    $('#select_for_action_' + cifCtgry).show();
}

function initBookKeepingCifCtgry(cifCtgryNm) {
    /***************************************************************************
     * whenever a cif category is added to the view, this function called to
     * register the cif category for UI/session tracking purposes and to 
     * intialize display/config settings for the cif category
     * 
     *		params:
     *				cifCtgryNm --> cif category name
     *				
     *****************************************************************************/
    EditorMod.debugCurrentCtgryNm = cifCtgryNm;
    EditorMod.currentCtgryNms.push(cifCtgryNm);
    EditorMod.CtgryConfig[cifCtgryNm].checkingMndtryItems = false;
    EditorMod.CtgryConfig[cifCtgryNm].checkingDictViolations = false;

    if (typeof EditorMod.currentMndtryViolations[cifCtgryNm] == "undefined") {
        EditorMod.currentMndtryViolations[cifCtgryNm] = [];
    }

    if (typeof EditorMod.currentDictViolations[cifCtgryNm] == "undefined") {
        EditorMod.currentDictViolations[cifCtgryNm] = [];
    }
    if (typeof oCARDINALITY_DICT[cifCtgryNm] != "undefined" && oCARDINALITY_DICT[cifCtgryNm] == "unit") {
        EditorMod.CtgryConfig[cifCtgryNm].unitCrdnlty = true;
        //DEBUG alert(cifCtgryNm + " has unit cardinality.");
    } else {
        EditorMod.CtgryConfig[cifCtgryNm].unitCrdnlty = false;
    }

}

function redrawTable(cifCtgry, holdPosition) {
    /***************************************************************************
     * ask given cif DataTable to redraw itself
     *		params:
     *				cifCtgry --> cif category name
     *				holdPosition --> boolean indicating whether or not table should
     *									reposition at first page of data or maintain
     *									position at current page/record.
     *									defaults to true
     *****************************************************************************/
    holdPosition = typeof holdPosition !== 'undefined' ? holdPosition : true;
    var table = $('#' + cifCtgry + '_tbl').DataTable();
    var resetPosition = !holdPosition;
    table.draw(resetPosition);
}

function getSortFlag(cifCtgry) {
    /***************************************************************************
     * Putting in place until creating more ideal strategy for deriving this config behavior
     *****************************************************************************/
    var arrSortedCategories = ['citation_author', 'audit_author', 'em_author_list', 'entity', 'entity_poly', 'struct_ncs_ens', 'pdbx_refine_tls_group'];

    if (arrSortedCategories.indexOf(cifCtgry) >= 0) {
        return true;
    } else {
        return false;
    }
}

function getDisplayLength(cifCtgry) {
    /***************************************************************************
     * Putting in place until creating more ideal strategy for deriving this config behavior
     *****************************************************************************/
    if (cifCtgry == 'citation_author' || cifCtgry == 'audit_author') {
        return 25;
    } else {
        return EditorMod.iSrchHeadersThrshld;
    }
}

function getTrueColIdx_DataTable(oCtgryCnfg, iCol) {
    /***************************************************************************
     * Non-ideal means of keeping track of true column index of category field
     * as used server-side (i.e. before client UI reorders columns)
     * But resorting to this due to inability to find more satisfactory strategy
     * at current time for doing so within apparent DataTable plugin constraints.
     *****************************************************************************/
    // "trueColIdxDisplOrder" represents a sequence of values each of which is the true, original column index
    // of the cif category item as originally ordered in the datafile "record". The sequence
    // of the values indicates the preferred ordering of the cif items when displayed on screen
    var trueColIdxDisplOrder = oCtgryCnfg.getColDisplOrder();

    var iTrueColIdx;
    var ctgryNm = oCtgryCnfg.getCtgryName();
    //DEBUG: alert("in getTrueColIdx_DataTable and ctgry name is: "+ ctgryNm)

    /*** FOR DEBUGGING 
    if( ctgryNm == 'pdbx_database_status' && iCol < 3 ){
    	alert("in getTrueColIdx_DataTable for '"+ctgryNm+"' and trueColIdxDisplOrder is:"+trueColIdxDisplOrder);
    	alert("And iCol is:"+iCol);
    	alert("EditorMod.CtgryConfig[ctgryNm].iCnt_DrawBackCalledOnCurrentTbl is: "+EditorMod.CtgryConfig[ctgryNm].iCnt_DrawBackCalledOnCurrentTbl);
    	alert("And trueColIdxDisplOrder["+iCol+"] is:"+trueColIdxDisplOrder[iCol]);
    }
    ***/
    if (EditorMod.CtgryConfig[ctgryNm].iCnt_DrawBackCalledOnCurrentTbl == 0) {
        // way DataTables works is that on first call to fnCreatedCell (the callback in which we
        // require knowledge of the "true" column index of the current field), value of iCol is actually
        // equal to true column index, because iCol not yet modified to reflect any reordering
        iTrueColIdx = iCol;
    } else {
        //but on subsequent redraws, DataTables appears to use a modified value of iCol so that 
        //in subsequent calls to fnCreatedCell, the value is now equal to index of column as rendered
        //on screen, i.e. after reordering
        iTrueColIdx = trueColIdxDisplOrder[iCol];
    }
    return iTrueColIdx;
}

function getTrueRowIdx_DataTable(nTd, iRow) {
    /***************************************************************************
    	Function for keeping track of true row index of category record
    	as used server-side (i.e. before client UI reorders due to searching/filtering) 
    *****************************************************************************/
    var iTrueRowIdx;
    var DT_rowIdx = $(nTd).parent().attr('id');
    if (DT_rowIdx) {
        //if( iRow == 0 ) alert("getTrueRowIdx_DataTable, DT_rowIdx defined for iRow: "+iRow);
        iTrueRowIdx = DT_rowIdx.split('_')[1];
    } else {
        //if( iRow == 0 ) alert("getTrueRowIdx_DataTable, DT_rowIdx not defined for iRow: "+iRow);
        iTrueRowIdx = iRow;
    }
    //alert("getTrueRowIdx_DataTable, leaving with iTrueRowIdx value: "+iTrueRowIdx);
    return iTrueRowIdx;
}

function applySearchHeaderFunctions(targetDivId, cifCtgry, oTable) {
    /* Add the events etc before DataTables hides a column */
    $('#' + targetDivId + ' thead input').keyup(function() {
        /* Filter on the column (the index) of this element */
        oTable.fnFilter(this.value, getTrueColIdx_DataTable(EditorMod.CtgryConfig[cifCtgry], $('#' + targetDivId + ' thead input').index(this)));
    });

    /*
     * Support functions to provide a little bit of 'user friendliness' to the textboxes
     */
    $('#' + targetDivId + ' thead input').each(function(i) {
        this.initVal = this.value;
    });

    $('#' + targetDivId + ' thead input').focus(function() {
        if (this.className == "search_init") {
            this.className = "";
            this.value = "";
        }
    });

    $('#' + targetDivId + ' thead input').blur(function(i) {
        if (this.value == "") {
            this.className = "search_init";
            this.value = this.initVal;
        }
    });

}

function applyReadOnlyProtection(cifCtgry, $nTd, iTrueColIdx, protectHiddenCol) {
    /***************************************************************************
     * Enforce read-only behavior 
     ****************************************************************************/

    var readOnlyColsForAaTargets = EditorMod.CtgryConfig[cifCtgry].getReadOnlyColumns();

    if (readOnlyColsForAaTargets.indexOf(parseInt(iTrueColIdx)) >= 0 || ctgryIsReadOnly(cifCtgry) || protectHiddenCol) {
        //"immutable" class prevents editability
        $nTd.addClass('immutable');
    }

}

function applyMandatoryHighlight(cifCtgry, $nTd, iTrueColIdx) {
    /***************************************************************************
     * apply class to indicate as "mandatory"
     ****************************************************************************/

    var arrMandatoryCols = EditorMod.CtgryConfig[cifCtgry].getMandatoryColumns();

    if (arrMandatoryCols.indexOf(parseInt(iTrueColIdx)) >= 0) {
        $nTd.addClass('mndtry');
    }

}

function applyNewRecordAttrib(cifCtgry, $nTd, iTrueRowIdx, bTrnspsdTbl) {
    /***************************************************************************
     * For records added by user, this function allows tracking of such records
     * in the UI by tagging corresponding <td> elements with a custom class
     ****************************************************************************/
    //if( ( iTrueRowIdx > (EditorMod.CtgryConfig[cifCtgry].addingRowHwm - 1) ) && ( EditorMod.CtgryConfig[cifCtgry].bAddingNewRow == true ) ){
    if (EditorMod.CtgryConfig[cifCtgry].bAddingNewRow == true) {

        for (var i = 0; i < EditorMod.CtgryConfig[cifCtgry].addedRowIds.length; i++) {
            //alert("EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] is: "+EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] );
            if (Number(iTrueRowIdx) == Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i])) {
                //alert("EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] is: "+EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] + " and iTrueRowIdx is: "+iTrueRowIdx);
                if (!bTrnspsdTbl) {
                    $nTd.addClass('newrecord').removeClass('immutable');
                }

                if (bTrnspsdTbl) {
                    if ((EditorMod.CtgryConfig[cifCtgry].getPrimaryKey()).indexOf(parseInt(iTrueRowIdx)) > -1) {
                        $nTd.addClass('newrecord').removeClass('immutable');
                    }
                }
            }
        }
        //DEBUG alert("Inside fnCreatedCell for prmary keys and found bInsertingNewRow to be true.");
        //apply primary key flag via custom class
        /**if( !bTrnspsdTbl ){
        	$nTd.addClass('newrecord').removeClass('immutable');
        }

        if( bTrnspsdTbl ){
        	if(  ( EditorMod.CtgryConfig[cifCtgry].getPrimaryKey() ).indexOf( parseInt(iTrueRowIdx) ) > -1 ){
        		$nTd.addClass('newrecord').removeClass('immutable');
        	}
        }***/

    }
}

function updateAddedRowIndices(cifCtgry, targetRowIdx, actionMode, numRows) {
    /***************************************************************************
     * this function performs reinventory/tracking of added records
     * that is necessary when rows are deleted, added
     ****************************************************************************/
    //if( ( iTrueRowIdx > (EditorMod.CtgryConfig[cifCtgry].addingRowHwm - 1) ) && ( EditorMod.CtgryConfig[cifCtgry].bAddingNewRow == true ) ){

    numRows = typeof numRows !== 'undefined' ? Number(numRows) : 1;

    if (actionMode != "delRow") {

        if (EditorMod.CtgryConfig[cifCtgry].bAddingNewRow == true) {

            for (var i = 0; i < EditorMod.CtgryConfig[cifCtgry].addedRowIds.length; i++) {
                //alert("crrntCat: "+EditorMod.currentCtgryNm+" and crrnt arrValue is: "+EditorMod.arrCtgriesWth3Dcntxt[i]);
                if (Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) >= Number(targetRowIdx)) {

                    // if the newly added row is being inserted, we need to increment the rowId values of any rows that are ordered after the newly added row by rowId 
                    EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] = Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) + Number(numRows);
                }
            }

        }
    } else if (actionMode == "delRow") {
        //alert("crrnt targetRowIdx is: "+targetRowIdx);
        var rowIdCmpr;

        for (var n = 0; n < numRows; n++) {

            rowIdCmpr = Number(targetRowIdx) + n;
            //alert("rowIdCmpr is now: "+ Number(rowIdCmpr));

            for (var i = 0; i < EditorMod.CtgryConfig[cifCtgry].addedRowIds.length; i++) {
                //alert("crrntCat: "+EditorMod.currentCtgryNm+" and crrnt arrValue is: "+EditorMod.arrCtgriesWth3Dcntxt[i]);
                //alert("crrnt Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] is: "+Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) );

                if (Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) == Number(rowIdCmpr)) {

                    //alert("Found added row ID to remove: "+ Number(rowIdCmpr));

                    // for any row being deleted, if it corresponds to a row that was added during this session we need to remove the rowId from the inventory of added rows 
                    EditorMod.CtgryConfig[cifCtgry].addedRowIds.splice(i, 1);
                    break; //can  break since there should only be one instance of any matching rowId 
                }
            }
        }
        for (var i = 0; i < EditorMod.CtgryConfig[cifCtgry].addedRowIds.length; i++) {
            //alert("crrntCat: "+EditorMod.currentCtgryNm+" and crrnt arrValue is: "+EditorMod.arrCtgriesWth3Dcntxt[i]);
            //alert("crrnt Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] is: "+Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) );

            var idxMarker = Number(targetRowIdx) + Number(numRows);

            //alert("Looking to decrement if addedRowId is >= "+Number(idxMarker)  );
            //if( Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) > Number(targetRowIdx) ){
            if (Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) >= Number(idxMarker)) {

                //alert("Found addedRowId >= : "+ Number(idxMarker) +" and it is: "+Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) );
                // we need to decrement the rowId values of any rows that are ordered after the row being deleted
                //EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] = Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) - 1; 
                EditorMod.CtgryConfig[cifCtgry].addedRowIds[i] = Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds[i]) - Number(numRows);
            }
        }


    }
}

function getCrrntCtgryNames() {
    var separator = '';
    var categoryLst = '';
    var cifCtgry = '';
    for (var i = 0; i < EditorMod.currentCtgryNms.length; i++) {
        cifCtgry = EditorMod.currentCtgryNms[i];
        if (i > 0) separator = ' and ';
        categoryLst += (separator + "'" + cifCtgry + "'");
    }
    return categoryLst;
}

function showUndoBtns(cifCtgry) {
    $('#undobtns_grp').show();
    //$('.undo').show('slow').button();
    $('.undobtns_' + cifCtgry + ' .undo').show('slow').button();
}

function undoEdits(cifCtgry, mode) {
    if (mode == "total") {
        var okay = confirm('You have indicated you want to undo all edits since most recent loading of "' + cifCtgry + '" category onto the screen, yes?');
        if (okay) {
            submitUndo(cifCtgry, mode);
        } else {
            alert('Undo cancelled');
        }
    } else {
        submitUndo(cifCtgry, mode);
    }

}

function submitUndo(cifCtgry, mode) {
    /**************************************************************************************************************************
     * undo change(s) that took place during the current "fetch session"
     * 
     * a "fetch session" refers to duration of time that begins when user makes a nav tab selection that populates the webpage
     * with content from a group of cif categories and ends when the user decides to click on another nav tab selection for a
     * different set of cif categories to be loaded on the page, thereby launching another "fetch session"
     * 
     * params:
     * 		cifCtgry: 	name of cif category for which undo applies
     * 		mode:		incremental --> to undo last edit action
     * 					or
     * 					total --> to undo all edits that took place since start of current "fetch session"
     * 					
     ***************************************************************************************************************************/
    //EditorMod.CtgryConfig[cifCtgry].editLog.push({"rowidx": trueRowIdx, "colidx": trueColIdx, "origvalue": origValue });
    var editLogLength = EditorMod.CtgryConfig[cifCtgry].editLog.length;
    if (editLogLength > 0) {

        if (mode == "incremental") {
            var oLogEntry = EditorMod.CtgryConfig[cifCtgry].editLog.pop();
            EditorMod.editActnIndx -= 1;

            $('#hlprfrm').ajaxSubmit({
                url: EditorMod.URL.UNDO_CHANGES,
                clearForm: false,
                beforeSubmit: function(formData, jqForm, options) {
                    formData.push({
                        "name": "cifctgry",
                        "value": cifCtgry
                    });
                    formData.push({
                        "name": "rewind_idx",
                        "value": oLogEntry.rewind_idx
                    });
                },
                success: function(jsonObj) {

                    if (jsonObj.status == "OK") {

                        if (oLogEntry.type == "edit") {

                            //EditorMod.bResetDisplay = false;
                            ///$('#'+cifCtgry+'_tbl').dataTable().fnDraw();
                            //EditorMod.bResetDisplay = true;

                        } // end if type == "edit"
                        else if (oLogEntry.type == "addrow" || oLogEntry.type == "delrow" || oLogEntry.type == "insert") {

                            if (oLogEntry.type == "addrow" || oLogEntry.type == "insert") {

                                //DEBUG alert("addedRows count for "+cifCtgry+" is now: "+EditorMod.CtgryConfig[cifCtgry].addedRows);
                                ///// NEED TO DO THE BELOW IN ORDER TO PERFORM BOOKKEEPING FOR CATEGORY'S "HIGH WATER MARK" ////
                                EditorMod.CtgryConfig[cifCtgry].addedRows -= oLogEntry.num_rows;

                                for (var n = EditorMod.addRowActns.length - 1; n >= 0; n--) {
                                    if (cifCtgry == EditorMod.addRowActns[n].ctgryname && oLogEntry.rewind_idx == EditorMod.addRowActns[n].idx) {
                                        //DEBUG alert("addedRows count after match for '"+cifCtgry+"' is now: "+EditorMod.CtgryConfig[cifCtgry].addedRows);
                                        EditorMod.addRowActns.splice(n, 1);
                                        EditorMod.CtgryConfig[cifCtgry].addedRowIds = oLogEntry.addrow_rollback.slice();
                                        break;
                                    }
                                }
                            } else {
                                ///// NEED TO DO THE BELOW IN ORDER TO PERFORM BOOKKEEPING FOR CATEGORY'S "HIGH WATER MARK" ////
                                EditorMod.CtgryConfig[cifCtgry].deletedRows -= oLogEntry.num_rows;

                                for (var n = EditorMod.deleteRowActns.length - 1; n >= 0; n--) {
                                    if (cifCtgry == EditorMod.deleteRowActns[n].ctgryname && oLogEntry.rewind_idx == EditorMod.deleteRowActns[n].idx) {
                                        //DEBUG alert("deletedRows count for '"+cifCtgry+"' is now: "+EditorMod.CtgryConfig[cifCtgry].deletedRows);
                                        EditorMod.deleteRowActns.splice(n, 1);
                                        EditorMod.CtgryConfig[cifCtgry].addedRowIds = oLogEntry.addrow_rollback.slice();
                                        break;
                                    }
                                }

                            }

                            adjustDataBalance(cifCtgry, "undo");

                        } // end if "addrow" or "delrow"

                        if (EditorMod.CtgryConfig[cifCtgry].editLog.length == 0) {
                            $('.undobtns_' + cifCtgry + ' .undo').hide('slow');
                        }

                        EditorMod.CtgryConfig[cifCtgry].checkingMndtryItems = true;
                        EditorMod.CtgryConfig[cifCtgry].checkingDictViolations = true;
                        updtDictViolationFlags(cifCtgry);
                        updtMndtryViolationFlags(cifCtgry);

                    } // end if status == "OK"


                } // end of success block
            });
            return false;
        } // end if "incremental
        else if (mode == "total") {

            var iMinIdx = EditorMod.CtgryConfig[cifCtgry].editLog[0].rewind_idx;

            $('#hlprfrm').ajaxSubmit({
                url: EditorMod.URL.UNDO_CHANGES,
                clearForm: false,
                beforeSubmit: function(formData, jqForm, options) {
                    formData.push({
                        "name": "cifctgry",
                        "value": cifCtgry
                    });
                    formData.push({
                        "name": "rewind_idx",
                        "value": iMinIdx
                    });
                },
                success: function(jsonObj) {

                    if (jsonObj.status == "OK") {

                        //adjust edit log bookkeeping
                        EditorMod.editActnIndx = EditorMod.editActnIndx - editLogLength;
                        EditorMod.CtgryConfig[cifCtgry].editLog.length = 0;
                        EditorMod.CtgryConfig[cifCtgry].addedRowIds.length = 0;

                        //adjust deletedRows bookkeeping
                        EditorMod.CtgryConfig[cifCtgry].deletedRows = 0;
                        for (var n = 0; n < EditorMod.deleteRowActns.length; n++) {
                            if (cifCtgry == EditorMod.deleteRowActns[n].ctgryname) {
                                EditorMod.deleteRowActns.splice(n, 1);
                            }
                        }

                        //adjust addedRows bookkeeping
                        EditorMod.CtgryConfig[cifCtgry].addedRows = 0;
                        for (var n = 0; n < EditorMod.addRowActns.length; n++) {
                            if (cifCtgry == EditorMod.addRowActns[n].ctgryname) {
                                EditorMod.addRowActns.splice(n, 1);
                            }
                        }

                        adjustDataBalance(cifCtgry, "undo");

                        $('.undobtns_' + cifCtgry + ' .undo').hide('slow');

                        updtDictViolationFlags(cifCtgry);
                        updtMndtryViolationFlags(cifCtgry);

                    } // end if status == "OK"


                } // end of success block
            });
            return false;
        }

    } // end if editLog.length > 0
}

function propagateTitle(targetCtgry) {

    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.DTBL_PROPAGATE_TITLE,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": targetCtgry
            });
            formData.push({
                "name": "edit_actn_indx",
                "value": EditorMod.editActnIndx
            });
        },
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {

                origValue = jsonObj.orig_value;

                if (!EditorMod.CtgryConfig[targetCtgry].editLog) {
                    EditorMod.CtgryConfig[targetCtgry].editLog = [];
                }
                /*******************editLog strategy***********************************************************************************
                 * editLog to capture edit trail and serve as mechanism by which any edits for the fetch session can be rolled back
                 * 
                 *  every entry in editLog includes:
                 *  ---------------------------------
                 * 	type: 				edit | addrow | delrow | insertrow
                 * 	rowidx: 			unique id for row for which edit action originates
                 * 	rewind_idx: 		index capturing particular edit action, ordered to reflect temporal sequence
                 * 
                 * 	for row actions only:
                 *  -----------------------
                 * 	addrow_rollback:	snapshotted list of rowIds for any rows newly added to the cif table for the current fetch session
                 *  num_rows:			for row update actions only (insert row, delete row, add row) indicates number of rows affected
                 * 
                 *  for propagateTitle actions only:
                 *  --------------------------------
                 *  colidx:				column index of title item being updated
                 *  origvalue: 			original value of title being updated
                 *  
                 * a "fetch session" refers to duration of time that begins when user makes a nav tab selection that populates the webpage
                 * with content from a group of cif categories and ends when the user decides to click on another nav tab selection for a
                 * different set of cif categories to be loaded on the page, thereby launching another "fetch session"
                 ***************************************************************************************************************************/
                EditorMod.CtgryConfig[targetCtgry].editLog.push({
                    "type": "edit",
                    "rewind_idx": EditorMod.editActnIndx,
                    "rowidx": 0,
                    "colidx": EditorMod.CtgryConfig[targetCtgry].getColIdxForItemName("title"),
                    "origvalue": origValue
                });

                EditorMod.editActnIndx += 1;
                //DEBUG alert("EditorMod.editActnCnt incremented to: "+EditorMod.editActnIndx);

                showUndoBtns(targetCtgry);

                //must reDraw in order for reverted state to be shown to user, but keep at same page/position in recordset
                redrawTable(targetCtgry);

            } // end if status == "OK"
        }
    });

    return false;
}

function handleRowSelectForAction($thisRow, event) {
    //var divDTwrapperId = $('#dt_rslts_combo div.dataTables_wrapper').attr('id');
    var divDTwrapperId = $thisRow.parents('div.dataTables_wrapper').attr('id');
    //alert("divDTwrapperId is: "+divDTwrapperId)
    var cifCtgryNm = divDTwrapperId.split('_tbl_wrapper')[0];
    //	alert("DT_RowId is: "+$thisRow.attr("id"));
    var parentDiv = $thisRow.parents('.atomic_dt_container').attr('id');
    //alert("Parent Div is: "+parentDiv);


    var rowId = $thisRow.attr("id");
    if ($('#' + parentDiv + ' table.DTFC_Cloned #' + rowId).hasClass('row_selected') || $('#' + parentDiv + ' #' + cifCtgryNm + '_tbl #' + rowId).hasClass('row_selected')) {
        $('#' + parentDiv + ' table.DTFC_Cloned #' + rowId).removeClass('row_selected');
        $('#' + parentDiv + ' #' + cifCtgryNm + '_tbl #' + rowId).removeClass('row_selected');
        $('.' + cifCtgryNm + '_row_action.onrowselect').hide();
        $('#' + parentDiv + ' .help.unselect').hide();
        $('#' + parentDiv + ' .help.select_for_action').show();
        EditorMod.currentRowSlctd = "";
    } else {
        $('#' + parentDiv + ' tbody tr.row_selected').removeClass('row_selected');
        $('#' + parentDiv + ' table.DTFC_Cloned #' + rowId).addClass('row_selected');
        $('#' + parentDiv + ' #' + cifCtgryNm + '_tbl #' + rowId).addClass('row_selected');
        $('#' + cifCtgryNm + '_delete_row').show();
        $('#' + cifCtgryNm + '_insert_row').show();
        if (doesCrrntCtgryHave3DCntxt(cifCtgryNm)) {
            $('#' + cifCtgryNm + '_jmol_view').show();
        }
        $('#' + parentDiv + ' .help.unselect').show();
        $('#' + parentDiv + ' .help.select_for_action').hide();
        EditorMod.currentRowSlctd = rowId;
        EditorMod.currentRowSlctd_CtgryNm = cifCtgryNm;

        if ((!EditorMod.CtgryConfig[cifCtgryNm].unitCrdnlty && EditorMod.bUseContextMenu) || EditorMod.context == "editorconfig") {
            $("#context_menu").show();
            $("#context_menu").position({
                my: "left-2 top-2",
                of: event
            });

            $(document).on('click', function(event) {
                // this block of code allows us to hide the context menu when user clicks on any portion of the screen outside of the context menu
                if (!$(event.target).closest('#context_menu').length) {
                    $("#context_menu").hide();
                }
            });
        }
    }

    EditorMod.currentRowSlctd_TrNode = $('#' + parentDiv + ' #' + cifCtgryNm + '_tbl #' + rowId)[0];

}

function deleteRows(cifCtgry, rowId, numRows) {

    numRows = Number(numRows);

    var targetRowIdx = rowId.split('_')[1];

    if (targetRowIdx == 0 && !(EditorMod.arrAllowLastRowDeleteCtgries.indexOf(cifCtgry) >= 0)) {
        // if we're at the topmost row and this category is not one that allows deletion of all existing records,
        // we need to check that numRows being deleted doesn't result in 0 records left for the category

        var dataBalance = EditorMod.CtgryConfig[cifCtgry].addedRows - EditorMod.CtgryConfig[cifCtgry].deletedRows;
        var dataDeficit = dataBalance < 0 ? dataBalance : 0; // i.e. if we've deleted more rows than we've added at this point, we need to factor the deficit into the calculation below

        //DEBUG alert( "Number(EditorMod.CtgryConfig[cifCtgry].addingRowHwm) is: "+Number(EditorMod.CtgryConfig[cifCtgry].addingRowHwm)+ " and numRows is: "+numRows);
        //DEBUG alert( "addedRowIds.length is: "+Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds.length)+ " and deficit is: "+ dataDeficit );

        if ((dataDeficit - numRows) <= -(EditorMod.CtgryConfig[cifCtgry].originalTotalRows)) {
            // if number of rows being deleted drops total records to below 0, then we can't allow user to delete all existing records for this particular category

            alert("Cannot delete only remaining record in the category.");
            $('.' + cifCtgry + '_row_action.onrowselect').hide();
            return false;
        }

    }
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.DTBL_ACT_ON_ROW,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
            formData.push({
                "name": "action",
                "value": "delrow"
            });
            formData.push({
                "name": "row_idx",
                "value": rowId
            });
            formData.push({
                "name": "num_rows",
                "value": numRows
            });
            formData.push({
                "name": "edit_actn_indx",
                "value": EditorMod.editActnIndx
            });
        },
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {

                if (!EditorMod.CtgryConfig[cifCtgry].editLog) {
                    EditorMod.CtgryConfig[cifCtgry].editLog = [];
                }
                /*******************editLog strategy***********************************************************************************
                 * editLog to capture edit trail and serve as mechanism by which any edits for the fetch session can be rolled back
                 * 
                 *  every entry in editLog includes:
                 *  ---------------------------------
                 * 	type: 				edit | addrow | delrow | insertrow
                 * 	rowidx: 			unique id for row for which edit action originates
                 * 	rewind_idx: 		index capturing particular edit action, ordered to reflect temporal sequence
                 * 
                 * 	for row actions only:
                 *  -----------------------
                 * 	addrow_rollback:	snapshotted list of rowIds for any rows newly added to the cif table for the current fetch session
                 *  num_rows:			for row update actions only (insert row, delete row, add row) indicates number of rows affected
                 * 
                 *  for propagateTitle actions only:
                 *  --------------------------------
                 *  colidx:				column index of title item being updated
                 *  origvalue: 			original value of title being updated
                 *  
                 * a "fetch session" refers to duration of time that begins when user makes a nav tab selection that populates the webpage
                 * with content from a group of cif categories and ends when the user decides to click on another nav tab selection for a
                 * different set of cif categories to be loaded on the page, thereby launching another "fetch session"
                 ***************************************************************************************************************************/
                EditorMod.CtgryConfig[cifCtgry].editLog.push({
                    "type": "delrow",
                    "rowidx": rowId,
                    "rewind_idx": EditorMod.editActnIndx,
                    "addrow_rollback": EditorMod.CtgryConfig[cifCtgry].addedRowIds.slice(),
                    "num_rows": numRows
                }); //slice() --> quick means of creating shallow copy

                $('.' + cifCtgry + '_row_action.onrowselect').hide();
                //increment count of deleted rows for this cif category
                EditorMod.CtgryConfig[cifCtgry].deletedRows += numRows;
                //DEBUG alert("deleted rows count is now: "+EditorMod.CtgryConfig[cifCtgry].deletedRows);

                updateAddedRowIndices(cifCtgry, targetRowIdx, "delRow", numRows);

                //capture the editActnIndx as one corresponding to a "deleteRow" action
                EditorMod.deleteRowActns.push({
                    "idx": EditorMod.editActnIndx,
                    "ctgryname": cifCtgry
                });

                adjustDataBalance(cifCtgry, "edit");

                //DEBUG alert("EditorMod.CtgryConfig[cifCtgry].originalTotalRows is now: "+EditorMod.CtgryConfig[cifCtgry].originalTotalRows);
                //DEBUG alert("originalDataBalance is now: "+originalDataBalance);

                //DEBUG alert("EditorMod.editActnCnt on deleting row was: "+EditorMod.editActnIndx);
                EditorMod.editActnIndx += 1;
                //DEBUG alert("EditorMod.editActnCnt incremented to: "+EditorMod.editActnIndx);

                showUndoBtns(cifCtgry);

                // NEED TO DO BELOW TO PROPERLY REAPPLY HIGHLIGHTING TO CORRECT RECORDS (WHICH HAVE NEW POSITIONS ONSCREEN)
                if (EditorMod.context != "editorconfig") {
                    updateViolationFlagging(cifCtgry);
                }

                $('#unselect_' + cifCtgry).hide();
                $('#select_for_action_' + cifCtgry).show();
                $('#' + cifCtgry + '_jmol_view').hide();

            } else if (jsonObj.status == "ERROR") {
                alert(jsonObj.err_msg);
            }

        }
    });
    return false;
}

function insertRows(cifCtgry, rowId, cloneItemArr, numRows) {

    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.DTBL_ACT_ON_ROW,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
            formData.push({
                "name": "action",
                "value": "insert"
            });
            formData.push({
                "name": "row_idx",
                "value": rowId
            });
            formData.push({
                "name": "num_rows",
                "value": numRows
            });
            formData.push({
                "name": "edit_actn_indx",
                "value": EditorMod.editActnIndx
            });
            formData.push({
                "name": "clone_items",
                "value": cloneItemArr.join(":")
            });
        },
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {

                if (!EditorMod.CtgryConfig[cifCtgry].editLog) {
                    EditorMod.CtgryConfig[cifCtgry].editLog = [];
                }
                /*******************editLog strategy***********************************************************************************
                 * editLog to capture edit trail and serve as mechanism by which any edits for the fetch session can be rolled back
                 * 
                 *  every entry in editLog includes:
                 *  ---------------------------------
                 * 	type: 				edit | addrow | delrow | insertrow
                 * 	rowidx: 			unique id for row for which edit action originates
                 * 	rewind_idx: 		index capturing particular edit action, ordered to reflect temporal sequence
                 * 
                 * 	for row actions only:
                 *  -----------------------
                 * 	addrow_rollback:	snapshotted list of rowIds for any rows newly added to the cif table for the current fetch session
                 *  num_rows:			for row update actions only (insert row, delete row, add row) indicates number of rows affected
                 * 
                 *  for propagateTitle actions only:
                 *  --------------------------------
                 *  colidx:				column index of title item being updated
                 *  origvalue: 			original value of title being updated
                 *  
                 * a "fetch session" refers to duration of time that begins when user makes a nav tab selection that populates the webpage
                 * with content from a group of cif categories and ends when the user decides to click on another nav tab selection for a
                 * different set of cif categories to be loaded on the page, thereby launching another "fetch session"
                 ***************************************************************************************************************************/
                EditorMod.CtgryConfig[cifCtgry].editLog.push({
                    "type": "insert",
                    "rowidx": rowId,
                    "rewind_idx": EditorMod.editActnIndx,
                    "addrow_rollback": EditorMod.CtgryConfig[cifCtgry].addedRowIds.slice(),
                    "num_rows": numRows
                });

                //$('#'+cifCtgry+'_insert_row').hide();
                $('.' + cifCtgry + '_row_action.onrowselect').hide();

                //increment count of added rows for this cif category
                EditorMod.CtgryConfig[cifCtgry].addedRows += Number(numRows);
                //DEBUG alert("EditorMod.editActnCnt on adding row was: "+EditorMod.editActnIndx);

                var iRowIdx = rowId.split('_')[1];
                //alert("rowId: "+rowId+" and iRowIdx: "+iRowIdx);

                EditorMod.CtgryConfig[cifCtgry].bAddingNewRow = true;
                var newRowIdx = Number(iRowIdx) + 1;
                updateAddedRowIndices(cifCtgry, newRowIdx, "insertRow", numRows);

                for (var n = 0; n < numRows; n++) {
                    EditorMod.CtgryConfig[cifCtgry].addedRowIds.push(Number(newRowIdx) + Number(n));
                }

                //capture the editActnIndx as one corresponding to a "addNewRow" action
                EditorMod.addRowActns.push({
                    "idx": EditorMod.editActnIndx,
                    "ctgryname": cifCtgry
                });

                EditorMod.editActnIndx += 1;
                //DEBUG alert("EditorMod.editActnCnt incremented to: "+EditorMod.editActnIndx);

                showUndoBtns(cifCtgry);

                //NEED TO DO BELOW TO PROPERLY REAPPLY HIGHLIGHTING TO CORRECT RECORDS (WHICH HAVE NEW POSITIONS ONSCREEN)
                if (EditorMod.context != "editorconfig") {
                    updateViolationFlagging(cifCtgry); //this call results in table for cif category being redrawn
                }

                $('#unselect_' + cifCtgry).hide();
                $('#select_for_action_' + cifCtgry).show();
                $('#' + cifCtgry + '_jmol_view').hide();

            } else if (jsonObj.status == "ERROR") {
                alert(jsonObj.err_msg);
            }
        }
    });
    return false;
}


function addNewRow(cifCtgry) {
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.DTBL_ACT_ON_ROW,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
            formData.push({
                "name": "action",
                "value": "addrow"
            });
            formData.push({
                "name": "edit_actn_indx",
                "value": EditorMod.editActnIndx
            });
        },
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {
                if (!EditorMod.CtgryConfig[cifCtgry].editLog) {
                    EditorMod.CtgryConfig[cifCtgry].editLog = [];
                }
                /*******************editLog strategy***********************************************************************************
                 * editLog to capture edit trail and serve as mechanism by which any edits for the fetch session can be rolled back
                 * 
                 *  every entry in editLog includes:
                 *  ---------------------------------
                 * 	type: 				edit | addrow | delrow | insertrow
                 * 	rowidx: 			unique id for row for which edit action originates
                 * 	rewind_idx: 		index capturing particular edit action, ordered to reflect temporal sequence
                 * 
                 * 	for row actions only:
                 *  -----------------------
                 * 	addrow_rollback:	snapshotted list of rowIds for any rows newly added to the cif table for the current fetch session
                 *  num_rows:			for row update actions only (insert row, delete row, add row) indicates number of rows affected
                 * 
                 *  for propagateTitle actions only:
                 *  --------------------------------
                 *  colidx:				column index of title item being updated
                 *  origvalue: 			original value of title being updated
                 *  
                 * a "fetch session" refers to duration of time that begins when user makes a nav tab selection that populates the webpage
                 * with content from a group of cif categories and ends when the user decides to click on another nav tab selection for a
                 * different set of cif categories to be loaded on the page, thereby launching another "fetch session"
                 ***************************************************************************************************************************/
                EditorMod.CtgryConfig[cifCtgry].editLog.push({
                    "type": "addrow",
                    "rewind_idx": EditorMod.editActnIndx,
                    "addrow_rollback": EditorMod.CtgryConfig[cifCtgry].addedRowIds.slice(),
                    "num_rows": 1
                });

                EditorMod.CtgryConfig[cifCtgry].addedRows += 1;
                //DEBUG alert("EditorMod.editActnCnt on adding row was: "+EditorMod.editActnIndx);
                //DEBUG alert("EditorMod.CtgryConfig[cifCtgry].addedRows on adding row is: "+EditorMod.CtgryConfig[cifCtgry].addedRows);

                var newRowIdx = Number(EditorMod.CtgryConfig[cifCtgry].addingRowHwm) + Number(EditorMod.CtgryConfig[cifCtgry].addedRowIds.length);
                //DEBUG alert("addingRowHwm on adding a row is: "+EditorMod.CtgryConfig[cifCtgry].addingRowHwm);
                //DEBUG alert("newRowIdx on adding a row is: "+newRowIdx);

                EditorMod.CtgryConfig[cifCtgry].bAddingNewRow = true;

                updateAddedRowIndices(cifCtgry, newRowIdx, "addRow", 1);

                EditorMod.CtgryConfig[cifCtgry].addedRowIds.push(newRowIdx);

                //capture the editActnIndx as one corresponding to a "addNewRow" action
                EditorMod.addRowActns.push({
                    "idx": EditorMod.editActnIndx,
                    "ctgryname": cifCtgry
                });

                //adjustDataBalance(cifCtgry);

                EditorMod.editActnIndx += 1;
                //DEBUG alert("EditorMod.editActnCnt incremented to: "+EditorMod.editActnIndx);

                showUndoBtns(cifCtgry);

                //NEED TO DO BELOW TO PROPERLY REAPPLY HIGHLIGHTING TO CORRECT RECORDS (WHICH HAVE NEW POSITIONS ONSCREEN)
                //updateViolationFlagging(cifCtgry);
                // 2014-09-22, RPS commenting above call out for now as it is a big performance hit for large tables and 
                // may not bring any true value on adding of a new rows which are typically appended to end

                redrawTable(cifCtgry);

                $('#' + cifCtgry + '_tbl').dataTable().fnPageChange('last');
            }
        }
    });
    return false;
}


function createInitRollbackPoint() {
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.INIT_ROLLBACK_POINT,
        clearForm: false,
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {
                //
            }
        }
    });
    return false;
}

function skipCalc(task) {
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.SKIP_CALC,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "task",
                "value": task
            });
        },
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {
                //alert("Received request to skip "+task+" calculation.");
                var sTask = '';
                if (task == 'link') {
                    sTask = 'Link';
                } else if (task == 'site') {
                    sTask = 'Site';
                } else if (task == 'helix') {
                    sTask = 'Helix';
                } else if (task == 'sheet') {
                    sTask = 'Sheet';
                } else if (task == 'solventpos') {
                    sTask = 'Solvent Reposition';
                } else if (task == 'linkdisulf') {
                    sTask = 'Links/Disulf';
                }

                $('#skip_' + task).val('Undo Skip ' + sTask + ' Calc');
            }
        }
    });
    return false;
}

function undoSkipCalc(task) {
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.SKIP_CALC_UNDO,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "task",
                "value": task
            });
        },
        success: function(jsonObj) {
            if (jsonObj.status == "OK") {
                //alert("Received request to undo skip "+task+" calculation.");
                var sTask = '';
                if (task == 'link') {
                    sTask = 'Link';
                } else if (task == 'site') {
                    sTask = 'Site';
                } else if (task == 'helix') {
                    sTask = 'Helix';
                } else if (task == 'sheet') {
                    sTask = 'Sheet';
                } else if (task == 'solventpos') {
                    sTask = 'Solvent Reposition';
                } else if (task == 'linkdisulf') {
		    sTask = 'Links/Disulf';
                }

                $('#skip_' + task).val('Skip ' + sTask + ' Calc');
            }
        }
    });
    return false;
}

function checkSkipCalc(task) {
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.CHECK_SKIP_CALC,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "task",
                "value": task
            });
        },
        success: function(jsonObj) {

            var sTask = '';
            if (task == 'link') {
                sTask = 'Link';
            } else if (task == 'site') {
                sTask = 'Site';
            } else if (task == 'helix') {
                sTask = 'Helix';
            } else if (task == 'sheet') {
                sTask = 'Sheet';
            } else if (task == 'solventpos') {
                sTask = 'Solvent Reposition';
            } else if (task == 'linkdisulf') {
		    sTask = 'Links/Disulf';
            }

            if (jsonObj.status == "y") {
                $('#skip_' + task).val('Undo Skip ' + sTask + ' Calc');
            } else if (jsonObj.status == "n") {
                $('#skip_' + task).val('Skip ' + sTask + ' Calc');
            }
        }
    });
    return false;
}

function adjustDataBalance(cifCtgry, mode) {
    /****
     *	if user has deleted more rows than has added in the current screen/session (i.e. negative dataBalance),
     *	then we must adjust the "high water mark" value downward, because it is used for
     *	distinguishing new rows added by user from rows already existing in the datafile.
     **/

    //DEBUG alert("originalTotalRows is now: "+EditorMod.CtgryConfig[cifCtgry].originalTotalRows);
    //DEBUG alert("adjustDataBalance-->cifCtgry is: "+cifCtgry);
    //DEBUG alert("addedRows is now: "+EditorMod.CtgryConfig[cifCtgry].addedRows);
    //DEBUG	alert("deletedRows is now: "+EditorMod.CtgryConfig[cifCtgry].deletedRows);
    var dataBalance = Number(EditorMod.CtgryConfig[cifCtgry].addedRows) - Number(EditorMod.CtgryConfig[cifCtgry].deletedRows);
    //DEBUG alert("dataBalance is now: "+dataBalance);
    if (dataBalance < 0) {
        EditorMod.CtgryConfig[cifCtgry].addingRowHwm = EditorMod.CtgryConfig[cifCtgry].originalTotalRows + dataBalance;
    }

    if (mode == "undo") {
        //if we're "undo"ing edits, then we need to adjust the "high water mark" back up to the 
        //value of originalTotalRows when the dataBalance has climbed back up to a non-negative value
        if (dataBalance >= 0) {
            EditorMod.CtgryConfig[cifCtgry].addingRowHwm = EditorMod.CtgryConfig[cifCtgry].originalTotalRows;
        }
    }

    //DEBUG alert("addingRowHwm is now: "+EditorMod.CtgryConfig[cifCtgry].addingRowHwm);
}

/***function loadTestExampleSeeJson(cifCtgry) {
	$('#hlprfrm').ajaxSubmit({url: EditorMod.URL.SEE_RAW_JSON_FOR_DTBL, clearForm: false,
        target: '#rslts',
        beforeSubmit: function (formData, jqForm, options) {
        	formData.push({"name": "cifctgry", "value": cifCtgry});
        	formData.push({"name": "datafile", "value": DATAFILE});
        },
        success: function() {
			//PLACEHOLDER
        }
    });
    return false;
}****/

function showCheckViolButtons() {
    $("input.check_dict_violations.individual").hide(); //full sweep to clear all previously displayed buttons

    // then show buttons only for categories currently listed with violations	
    for (var cifNm in EditorMod.currentDictViolations) {
        if (EditorMod.currentDictViolations[cifNm].length > 0) {
            $('.chck_dict_vltns_' + cifNm).html('<input id="check_dict_violations-' + cifNm + '" name="check_dict_violations-' + cifNm + '" value="Check Dictionary Violations" class="fltlft check_dict_violations individual" type="button" style="margin-top: 8px; margin-right: 20px; font-size: .8em;" />');
            $('#check_dict_violations-' + cifNm).button();
        }
    }
}

function updateViolationFlagging(cifCtgry) {
    /***************************************************************
     *	NEED TO DO BELOW TO PROPERLY REAPPLY HIGHLIGHTING TO CORRECT
     *  RECORDS (WHICH HAVE NEW POSITIONS ONSCREEN)
     ***************************************************************/

    EditorMod.CtgryConfig[cifCtgry].checkingDictViolations = true;
    updtDictViolationFlags(cifCtgry);

    EditorMod.CtgryConfig[cifCtgry].checkingMndtryItems = true;
    updtMndtryViolationFlags(cifCtgry);

}

function sortViolationsDisplayList(listId) {
    // in "items" we will have list of handles to the existing <li> elements
    var items = $('#' + listId + ' li').get();

    //let's sort the <li> elems by alpha order
    items.sort(function(a, b) {
        var keyA = $(a).text();
        var keyB = $(b).text();

        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    var ul = $('#' + listId);

    //now we use append to put them back in the parent <ul> in alpha order
    //note: don't have to clear <ul> of the original set of <li> elements because if you use append() and pass in reference to an already existing DOM element,
    //that element is moved from it's original location to the new destination
    $.each(items, function(i, li) {
        ul.append(li);
    });
}

function processDictViolations(oViolations) {
    var ctgryArr = [];
    for (var ctgryName in oViolations) {
        //alert("ctgryName: "+ctgryName);
        if (typeof ctgryName != "undefined") {
            //alert("ctgryName is: " + ctgryName);
            for (var prop in oViolations[ctgryName]) {
                //alert(ctgryName+":"+prop);
                if (prop == "data_positions") {
                    //alert( "oViolations[ctgryName][data_positions] is: "+oViolations[ctgryName].data_positions );
                }
            }
            if (typeof oViolations[ctgryName].data_positions != "undefined" && oViolations[ctgryName].data_positions.length > 0) {
                ctgryArr.push(ctgryName);
                EditorMod.currentDictViolations[ctgryName] = oViolations[ctgryName].data_positions;
                if (typeof EditorMod.currentDictViolations[ctgryName].violtn_msgs == "undefined") {
                    EditorMod.currentDictViolations[ctgryName].violtn_msgs = new Array();
                }
                EditorMod.currentDictViolations[ctgryName].violtn_msgs = oViolations[ctgryName].violation_msgs;

            }

        }
    }
    if (ctgryArr.length == 0) {
        alert("No violations of the mmCIF dictionary found.");
    } else {
        var ctgryList = '<ul id="violtnlist">';
        for (var n = 0; n < ctgryArr.length; n++) {
            var ctgryName = ctgryArr[n];
            var topMenuLabel = "";
            if (typeof oViolations[ctgryName].top_menu_label != "undefined" && oViolations[ctgryName].top_menu_label.length > 0) {
                topMenuLabel = oViolations[ctgryName].top_menu_label;
            }
            ctgryList += "<li>" + topMenuLabel + " --> " + ctgryName + "</li>"
        }
        $('#dict_violation_rslts').html("<p>Please check the following for violations of dictionary constraints:</p>" + ctgryList + "</ul>");

        sortViolationsDisplayList('violtnlist');

        $('#dict_violation_rslts').dialog({
            width: 380,
            height: 350,
            position: {
                my: "center top",
                at: "center top+15%",
                of: window
            }
        });
        $('div.ui-dialog').css("z-index", "150");
        //alert("The following categories have records which are missing values for required fields. Please check your work:\n"+ctgryList);
    }

}

function checkForDictViolations(cifCtgry, mode) {
    if (cifCtgry == "all") {
        $("#progressbar").progressbar({
            value: false
        });
        $("#validationprogress").show();
    }
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.CHECK_DICT_VIOLATIONS,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
        },
        success: function(jsonObj) {
            //alert("cifCtgry is: "+cifCtgry);
            var violationsMap = new Object();
            if (cifCtgry == 'all') {
                violationsMap = eval("jsonObj.violation_map");
                processDictViolations(violationsMap);

            } else {
                violationsMap = eval("jsonObj.violation_map");
                var bCtgryHasViolations = false;
                for (var ctgryName in violationsMap) {
                    if (ctgryName == cifCtgry) {
                        var curDataPositions = eval("jsonObj.violation_map." + cifCtgry + ".data_positions");
                        var curVioltnMsgs = eval("jsonObj.violation_map." + cifCtgry + ".violation_msgs");
                        if (curDataPositions.length == 0) {
                            if (mode == "manual") {
                                alert("No violations of the mmCIF dictionary found for this CIF category.");
                            }
                            EditorMod.currentDictViolations[cifCtgry] = curDataPositions;
                        } else {
                            bCtgryHasViolations = true;
                            var oDTable = $('#' + cifCtgry + '_tbl').dataTable();
                            /***TRANSPOSE ***/
                            var bTranspose = oDTable.fnTransposeState();
                            if (mode == "manual") {
                                var list = '\n';
                                var curColNames = eval("jsonObj.violation_map." + cifCtgry + ".col_names");
                                for (var n = 0; n < curColNames.length; n++) {
                                    list += curColNames[n] + "\n";
                                }
                                alert("Some records are in violation of mmCIF dictionary constraints for the following required fields:\n" + list);
                            }
                            var sSuffix = '_tbl';
                            /***TRANSPOSE*/
                            if (bTranspose) {
                                sSuffix = '_tbl_transpose';
                            }
                            /***TRANSPOSE  END*/
                            EditorMod.currentDictViolations[cifCtgry] = curDataPositions;
                            EditorMod.currentDictViolations[cifCtgry].violtn_msgs = curVioltnMsgs;
                            for (var i = 0; i < EditorMod.currentDictViolations[cifCtgry].length; i++) {
                                $('#' + cifCtgry + sSuffix).find('td[true_row_idx="' + EditorMod.currentDictViolations[cifCtgry][i][0] + '"][true_col_idx="' + EditorMod.currentDictViolations[cifCtgry][i][1] + '"]').addClass('dict_violation');
                                if (typeof EditorMod.currentDictViolations[cifCtgry].violtn_msgs != "undefined") {
                                    $('#' + cifCtgry + sSuffix).find('td[true_row_idx="' + EditorMod.currentDictViolations[cifCtgry][i][0] + '"][true_col_idx="' + EditorMod.currentDictViolations[cifCtgry][i][1] + '"]').prop('title', EditorMod.currentDictViolations[cifCtgry].violtn_msgs[i]);
                                }
                            }
                            //EditorMod.currentDictViolations[cifCtgry] = jsonObj.data_positions;
                        }
                    }
                }
                if (!bCtgryHasViolations) {
                    if (mode == "manual") {
                        alert("No violations of the mmCIF dictionary found for this CIF category.");
                    }
                    EditorMod.currentDictViolations[cifCtgry] = [];
                }
                // ??? updtDictViolationFlags(cifCtgry);

            }
            if (cifCtgry == "all") {
                $("progressbar").progressbar("destroy");
                $("#validationprogress").hide();
            }
            showCheckViolButtons();
        }
    });
    return false;
}

function processMissingMandatoryItems(oViolations) {
    var ctgryArr = [];
    for (var ctgryName in oViolations) {
        //alert("ctgryName: "+ctgryName);
        if (typeof ctgryName != "undefined") {
            //alert("ctgryName is: " + ctgryName);
            for (var prop in oViolations[ctgryName]) {
                //alert(ctgryName+":"+prop);
                if (prop == "data_positions") {
                    //alert( "oViolations["+ctgryName+"].data_positions is: "+oViolations[ctgryName].data_positions );
                }
            }
            if (typeof oViolations[ctgryName].data_positions != "undefined" && oViolations[ctgryName].data_positions.length > 0) {
                //alert( "oViolations["+ctgryName+"].data_positions is: "+oViolations[ctgryName].data_positions );
                ctgryArr.push(ctgryName);
                EditorMod.currentMndtryViolations[ctgryName] = oViolations[ctgryName].data_positions;
                //alert( "EditorMod.currentMndtryViolations["+ctgryName+"].data_positions is: "+EditorMod.currentMndtryViolations[ctgryName].data_positions );
            }

        }
    }
    if (ctgryArr.length == 0) {
        alert("All required items have been populated.");
    } else {
        var ctgryList = '<ul id="missinglist">';

        for (var n = 0; n < ctgryArr.length; n++) {
            var ctgryName = ctgryArr[n];
            var topMenuLabel = "";
            if (typeof oViolations[ctgryName].top_menu_label != "undefined" && oViolations[ctgryName].top_menu_label.length > 0) {
                topMenuLabel = oViolations[ctgryName].top_menu_label;
            }
            ctgryList += "<li>" + topMenuLabel + " --> " + ctgryName + "</li>";
        }
        $('#mndtry_check_rslts').html("<p>Please check the following for absence of required fields:</p>" + ctgryList + "</ul>");

        sortViolationsDisplayList('missinglist');

        $('#mndtry_check_rslts').dialog({
            width: 460,
            height: 350,
            position: {
                my: "center top",
                at: "center+5% top+15%",
                of: window
            }
        });
        $('div.ui-dialog').css("z-index", "150");
        //alert("The following categories have records which are missing values for required fields. Please check your work:\n"+ctgryList);
    }

}


function checkForMandatoryItems(cifCtgry, mode) {
    if (cifCtgry == "all") {
        $("#progressbar").progressbar({
            value: false
        });
        $("#validationprogress").show();
    }
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.CHECK_MANDATORY_ITEMS,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
        },
        success: function(jsonObj) {
            //alert("cifCtgry is: "+cifCtgry);
            var violationsMap = new Object();
            if (cifCtgry == 'all') {
                violationsMap = eval("jsonObj.violation_map");
                processMissingMandatoryItems(violationsMap);

            } else {
                violationsMap = eval("jsonObj.violation_map");
                var bCtgryHasViolations = false;
                for (var ctgryName in violationsMap) {
                    if (ctgryName == cifCtgry) {
                        var curDataPositions = eval("jsonObj.violation_map." + cifCtgry + ".data_positions");
                        if (curDataPositions.length == 0) {
                            if (mode == "manual") {
                                alert("All required items have been populated for this CIF category.");
                            }
                            EditorMod.currentMndtryViolations[cifCtgry] = curDataPositions;
                        } else {
                            bCtgryHasViolations = true;
                            var oDTable = $('#' + cifCtgry + '_tbl').dataTable();
                            /***TRANSPOSE */
                            var bTranspose = oDTable.fnTransposeState();
                            if (mode == "manual") {
                                var list = '\n';
                                var curColNames = eval("jsonObj.violation_map." + cifCtgry + ".col_names");
                                for (var n = 0; n < curColNames.length; n++) {
                                    list += curColNames[n] + "\n";
                                }
                                alert("Some records are missing data for the following required fields:\n" + list);
                            }
                            var sSuffix = '_tbl';
                            /***TRANSPOSE*/
                            if (bTranspose) {
                                sSuffix = '_tbl_transpose';
                            } /***TRANSPOSE END*/
                            EditorMod.currentMndtryViolations[cifCtgry] = curDataPositions;
                            for (var i = 0; i < EditorMod.currentMndtryViolations[cifCtgry].length; i++) {
                                $('#' + cifCtgry + sSuffix).find('td[true_row_idx="' + EditorMod.currentMndtryViolations[cifCtgry][i][0] + '"][true_col_idx="' + EditorMod.currentMndtryViolations[cifCtgry][i][1] + '"]').addClass('mndtry_missing'); //.prop('title', "Must supply value for this required item.");
                            }

                        }
                    }
                }
                if (!bCtgryHasViolations) {
                    if (mode == "manual") {
                        alert("All required items have been populated for this CIF category.");
                    }
                    EditorMod.currentMndtryViolations[cifCtgry] = [];
                }
                // ??? updtDictViolationFlags(cifCtgry);

            }
            if (cifCtgry == "all") {
                $("progressbar").progressbar("destroy");
                $("#validationprogress").hide();
                $("ul.nav li.topnav a.chosen").trigger("click");
            }

            redrawTable(cifCtgry);
        }
    });
    return false;
}

function updtMndtryViolationFlags(cifCtgry) {
    var sSuffix = '_tbl';
    var oTable = $('#' + cifCtgry + '_tbl').dataTable();
    /***TRANSPOSE*/
    if (oTable.fnTransposeState()) {
        sSuffix = '_tbl_transpose';
    }
    /***TRANSPOSE END*/
    if (EditorMod.CtgryConfig[cifCtgry].checkingMndtryItems == true) {
        $('#' + cifCtgry + sSuffix + ' .mndtry_missing').removeClass('.mdntry_missing');
        checkForMandatoryItems(cifCtgry, "auto");
    }
}

function updtDictViolationFlags(cifCtgry) {
    var sSuffix = '_tbl';
    var oTable = $('#' + cifCtgry + '_tbl').dataTable();
    /***TRANSPOSE*/
    if (oTable.fnTransposeState()) {
        sSuffix = '_tbl_transpose';
    }
    /***TRANSPOSE END*/

    if (EditorMod.CtgryConfig[cifCtgry].checkingDictViolations == true) {
        $('#' + cifCtgry + sSuffix + ' .dict_violation').removeClass('dict_violation');
        checkForDictViolations(cifCtgry, "auto");
    }
}

function showHiddenCols(cifCtgryNm) {
    var iNumCols = EditorMod.CtgryConfig[cifCtgryNm].getNumCols();
    var bVis;
    var oDTable = $('#' + cifCtgryNm + '_tbl').dataTable();

    for (var iColIdx = 0; iColIdx < iNumCols; iColIdx++) {
        //bVis = EditorMod.oDataTable.fnSettings().aoColumns[iColIdx].bVisible;
        bVis = oDTable.fnSettings().aoColumns[iColIdx].bVisible;

        if (!bVis) {
            //EditorMod.oDataTable.fnSetColumnVis( iColIdx, true );
            oDTable.fnSetColumnVis(iColIdx, true);
        }
    }
}

function showJustPriorityCols(cifCtgryNm) {
    var arrPriorityCols = EditorMod.CtgryConfig[cifCtgryNm].getPriorityColumns();
    var iNumCols = EditorMod.CtgryConfig[cifCtgryNm].getNumCols();

    var oDTable = $('#' + cifCtgryNm + '_tbl').dataTable();

    for (var i = arrPriorityCols.length; i < iNumCols; i++) {
        //EditorMod.oDataTable.fnSetColumnVis( i, false );
        oDTable.fnSetColumnVis(i, false);
    }

    oDTable.fnDraw();
}

function toggleTransposeAllBtn() {
    if (EditorMod.currentCtgryNms.length > 1) {
        $("#transpose_vw_all").show().val("Transpose View (All)");
    } else {
        $("#transpose_vw_all").hide();
    }
}

function updateChosenHighlight($thisLink) {
    $('.cifctgry_submit').removeClass('chosen');
    $('.multi_cifctgry_submit').removeClass('chosen');
    $('li.topnav a').removeClass('chosen');
    $thisLink.addClass('chosen');
    $thisLink.parents('li.topnav').find('a:first').addClass('chosen');
}

////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// jEditable Helper Functions ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
function getTrueColIdx_jEditable(nTd) {
    var iTrueColIdx;
    if ($(nTd).hasClass('trnspsd')) {
        iTrueColIdx = nTd.getAttribute('true_row_idx');
    } else {
        iTrueColIdx = nTd.getAttribute('true_col_idx');
    }
    return iTrueColIdx;
}

function handleCifNull(value, settings) {
    var retval;
    if (value == "?" || value == ".") {
        retval = "";
    } else {
        retval = value;
    }
    return retval;
}

function applyJeditable(cifCtgry, oTable) {
    //define default jeditable settings
    var defaults = {
        cifname: cifCtgry,
        name: "new_value",
        event: "click",
        placeholder: "Click to edit",
        type: "text",
        onblur: "submit",
        logeditfxn: logEdit,
        //onblur: "cancel",
        //submit: "OK",
        //cancel: "Cancel",
        submitdata: function(value, settings) {
            // This is where jEditable provides us an opportunity to supply any additional query parameters to be sent to server
            return {
                sessionid: SESSION_ID,
                datafile: DATAFILE,
                cifctgry: cifCtgry,
                //"row_idx": oTable.fnGetPosition( this )[0],  # does not provide proper value when pagination is used
                row_idx: this.getAttribute('true_row_idx'),
                col_idx: this.getAttribute('true_col_idx'),
                filesource: FILE_SOURCE,
                edit_actn_indx: EditorMod.editActnIndx
            };
        },
        onsubmit: function(settings, td) {
            //THIS IS CALLED BEFORE "submit" HANDLER DEFINED IN CUSTOM INPUTTYPE DECLARATION

            //use of onsubmit property does not seem to be documented on jEditable website
            //but is seen in examples on the web for implementing field validation prior to persisting any edits
            //e.g. see  http://stackoverflow.com/questions/2425456/validate-jeditable-field

            var sRegexStatusMsg = "";
            var sBndryStatusMsg = "";
            var sBndryFailType = "";
            var trueColIdx = td.getAttribute('true_col_idx');
            var trueRowIdx = td.getAttribute('true_row_idx');
            var inputType = EditorMod.CtgryConfig[cifCtgry].getInputType(trueColIdx);
            var newValue;

            // for the edit action is currently being processed, we get the new value 
            // based on what type of input element was used to submit the change
            if (inputType.indexOf("select") != -1) {
                //in the case that new value was submitted via a drop-down select list control
                newValue = $(td).find('select').val();
                if (newValue.length == 0) {
                    // if the new value is an empty string (i.e. user deleted whatever value was there)
                    // then set value on screen to be default value for empty values
                    $(td).find('select').val("?");
                    newValue = '?';
                }
            } else {
                var bIsTextArea = false;
                if (inputType == "textarea") {
                    newValue = $(td).find('textarea').val();
                    bIsTextArea = true;
                } else {
                    //else the new value was submitted via a text input
                    newValue = $(td).find('input').val();
                }
                if (newValue.length == 0) {
                    // if the new value is an empty string (i.e. user deleted whatever value was there)
                    // then set value on screen to be default value for empty values
                    newValue = '?';
                    if (bIsTextArea) {
                        $(td).find('textarea').val(newValue);
                    } else {
                        $(td).find('input').val(newValue);
                    }

                }
            }
            var origValue = td.revert;

            if (newValue == origValue) {
                // DEBUG alert("newVal is same as origVal");
                td.reset();
                return false;
            } else { // else a value is being submitted that is actually different from the original value

                //alert( "newValue.length is: "+newValue.length);
                if (newValue.length == 0) {
                    // if the new value is an empty string (i.e. user deleted whatever value was there)
                    // then set value to be submitted for validation to be default value for empty values
                    newValue = "?";
                } else {
                    if ((cifCtgry == "citation_author" && trueColIdx == 2) || (cifCtgry == "audit_author" && trueColIdx == 1) || (cifCtgry == "em_author_list" && trueColIdx == 1)) {
                        // In the above cases, the value being edited is the author "ID". The value determines order in the list of authors.
                        // So we use this value to set "gotoRow" so that pagination will adjust to ensure that the record being edited is in view no
                        // matter what the new value may be.
                        EditorMod.gotoRow = newValue;
                        //alert("gotoRow is now: "+EditorMod.gotoRow);
                    }
                }

                settings.logeditfxn(settings.cifname, td, origValue); //2016-03-10: since adopting asynchronous validation check (see below), we are now logging every edit and then undoing if necessary

                if ((newValue == "?" || newValue == ".") || EditorMod.context == "editorconfig") {
                    // we can bypass validation check if newValue is one of above
                    return true;
                } else { // we need to perform validation check
                    $('#hlprfrm').ajaxSubmit({
                        url: EditorMod.URL.DTBL_VALIDATE_EDIT,
                        clearForm: false,
                        beforeSubmit: function(formData, jqForm, options) {
                            formData.push({
                                "name": "cifctgry",
                                "value": cifCtgry
                            });
                            formData.push({
                                "name": "row_idx",
                                "value": trueRowIdx
                            });
                            formData.push({
                                "name": "col_idx",
                                "value": trueColIdx
                            });
                            formData.push({
                                "name": "new_value",
                                "value": newValue
                            });
                            formData.push({
                                "name": "datafile",
                                "value": DATAFILE
                            });
                        },
                        success: function(jsonObj) {
                            //alert("return from EditorMod.URL.DTBL_VALIDATE_EDIT is: "+jsonObj.is_valid);
                            if (jsonObj.pass_regex_tst == "false" || jsonObj.pass_bndry_tst == "false") {

                                if (jsonObj.pass_regex_tst == "false") {
                                    sRegexStatusMsg = jsonObj.fail_msg_regex;
                                    sRegexFailType = jsonObj.fail_typ_regex;
                                }
                                if (jsonObj.pass_regex_tst == "true" && jsonObj.pass_bndry_tst == "false") {
                                    sBndryStatusMsg = jsonObj.fail_msg_bndry;
                                    sBndryFailType = jsonObj.fail_typ_bndry;
                                    // DEBUG alert("boundary fail type: "+ jsonObj.fail_typ_bndry);
                                }

                                //td.reset(); //have UI display original value --> doesn't work when validation check done as async call
                                if (sBndryFailType == "soft" || sRegexFailType == "soft") {
                                    var goAhead = confirm("Warning: " + sRegexStatusMsg + sBndryStatusMsg + "\nClick 'OK' to proceed with submitted value or 'Cancel' to abort.");
                                    if (!goAhead) {
                                        //undo
                                        undoEdits(cifCtgry, "incremental");
                                    }
                                } else { // hard boundary limit violated so must undo
                                    alert(sRegexStatusMsg + sBndryStatusMsg);
                                    //undo
                                    undoEdits(cifCtgry, "incremental");
                                }
                            }

                        },
                        error: function() {
                            alert("Problem on request to validate the new value being submitted.");
                        }
                    });

                } //end of if-else checking if we can bypass validation check

            } //end of else checking if value being submitted is actually different from original value
        },
        callback: function(sValue, y) {
            /***$('td.mndtry_missing').tooltip( {
				//track : true,
			    show : {
	        	effect: "slideDown",
	        	delay: 250},
	        	open: function( event, ui ) { EditorMod.mndtryViolationsTooltip = true; }
	        });***/

            showUndoBtns(cifCtgry);
            //DEBUG alert("EditorMod.editActnCnt on current submit was: "+EditorMod.editActnIndx);
            EditorMod.editActnIndx += 1;
            //DEBUG alert("EditorMod.editActnCnt incremented to: "+EditorMod.editActnIndx);

            if (EditorMod.dictViolationsTooltip == true) {
                $('td.dict_violation').tooltip("destroy"); //found the need to make this call, or else tooltip may linger after submitting edit if it was active during the edit
            }
            /***if( EditorMod.mndtryViolationsTooltip == true ){
            	$('td.mndtry_missing').tooltip( "destroy" ); //found the need to make this call, or else tooltip may linger after submitting edit if it was active during the edit
            }***/

            EditorMod.CtgryConfig[cifCtgry].checkingMndtryItems = true;
            updtMndtryViolationFlags(cifCtgry);

            if (EditorMod.gotoRow > 0) {
                var totalRows = oTable.fnSettings().fnRecordsDisplay();
                var displRowsPerPage = oTable.fnSettings()._iDisplayLength;
                var numPages = Math.ceil(totalRows / displRowsPerPage);

                if (numPages > 1) {
                    for (var i = 0; i < numPages; i++) {

                        if (EditorMod.gotoRow <= ((i + 1) * displRowsPerPage)) {
                            oTable.fnPageChange(i);
                            break;
                        }
                    }
                }
                EditorMod.gotoRow = -1;
            }
            /*** FOR DEBUGGING *********************
            for(var n=EditorMod.CtgryConfig[cifCtgry].editLog.length - 1; n >= 0; n--) {
            	value = EditorMod.CtgryConfig[cifCtgry].editLog[n].origvalue;
            	
            	alert("Rewind edit list for '"+cifCtgry+"' and 'gobackto' value at index["+n+"] is: "+value);
            	
            }
            *** FOR DEBUGGING *********************/
        },
        height: "14px",
        width: "100%"
    };

    // Apply the jEditable handlers to the table oTable.$('tr:odd')
    $('#' + cifCtgry + '_tbl_wrapper td:not(.immutable):not(.dataTables_empty)').each(function(index) {
        var optsTextArea = {
            type: "textarea",
            onblur: "submit",
            rows: 4,
            columns: 12, //not sure this is having any impact on UI
            data: handleCifNull
        };
        var optsCheckBox = {
            type: "checkbox",
            name: "",
            onblur: "",
            event: "mouseover",
            submit: "",
            cancel: "",
            submitdata: "",
            onsubmit: "",
            height: ""
        };
        var optsCalendar = {
            type: "calendar",
            onblur: "ignore"
        };
        var optsSlct = {
            type: "select",
            data: EditorMod.CtgryConfig[cifCtgry].getSelectOpts(getTrueColIdx_jEditable(this))
        };
        var optsSlctWthOthr = $.extend({}, optsSlct, {
            type: "select_w_other",
            select_w_other: {
                "id": cifCtgry + '_' + this.getAttribute('true_col_idx') + '_' + this.getAttribute('true_row_idx')
            },
            onsubmit: onSubmitSlctWithOther
        });
        var optsMultiSlct = $.extend({}, optsSlct, {
            type: "multiselect"
        });
        var optsMultiSlctWthOthr = $.extend({}, optsSlct, {
            type: "multiselect_w_other",
            select_w_other: {
                "id": cifCtgry + '_' + this.getAttribute('true_col_idx') + '_' + this.getAttribute('true_row_idx')
            },
            onsubmit: onSubmitSlctWithOther
        });
        var optsAutoCmplt = {
            type: "autocomplete",
            autocomplete: {
                source: EditorMod.CtgryConfig[cifCtgry].getAutoCmpltOpts(getTrueColIdx_jEditable(this))
            },
            submit: "OK",
            cancel: "Cancel",
            onsubmit: onSubmitAutoCmplt,
            data: handleCifNull
        };
        var optsAutoCmpltWthOthr = $.extend({}, optsAutoCmplt, {
            type: "autocomplete_w_other",
            onblur: "ignore",
            onsubmit: onSubmitAutoCmpltWithOther
        });
        var optsMultiAutoCmplt = $.extend({}, optsAutoCmplt, {
            type: "multi_autocomplete",
            onsubmit: onSubmitMultiAutoCmplt,
            data: handleCifNull
        });
        var optsMultiAutoCmpltWthOthr = $.extend({}, optsAutoCmplt, {
            type: "multi_autocomplete_w_other",
            onsubmit: onSubmitMultiAutoCmpltWthOthr
        });

        var inputType = EditorMod.CtgryConfig[cifCtgry].getInputType(getTrueColIdx_jEditable(this));
        var settings;
        switch (inputType) {
            case "checkbox":
                settings = $.extend({}, defaults, optsCheckBox);
                break;
            case "date-time":
                settings = $.extend({}, defaults, optsCalendar);
                break;
            case "select":
                settings = $.extend({}, defaults, optsSlct);
                break;
            case "select_w_other":
                settings = $.extend({}, defaults, optsSlctWthOthr);
                break;
            case "multiselect":
                settings = $.extend({}, defaults, optsMultiSlct);
                break;
            case "multiselect_w_other":
                settings = $.extend({}, defaults, optsMultiSlctWthOthr);
                break;
            case "autocomplete":
                settings = $.extend({}, defaults, optsAutoCmplt);
                break;
            case "autocomplete_w_other":
                settings = $.extend({}, defaults, optsAutoCmpltWthOthr);
                break;
            case "multi_autocomplete":
                settings = $.extend({}, defaults, optsMultiAutoCmplt);
                break;
            case "multi_autocomplete_w_other":
                settings = $.extend({}, defaults, optsMultiAutoCmpltWthOthr);
                break;
            case "textarea":
                settings = $.extend({}, defaults, optsTextArea);
                break;
            default:
                settings = $.extend({
                    data: handleCifNull
                }, defaults);
        }
        $(this).editable(EditorMod.URL.DTBL_SUBMIT_EDIT, settings);

    });
}

function logEdit(cifCtgry, td, origValue) {

    var trueColIdx = td.getAttribute('true_col_idx');
    var trueRowIdx = td.getAttribute('true_row_idx');

    if (!EditorMod.CtgryConfig[cifCtgry].editLog) {
        EditorMod.CtgryConfig[cifCtgry].editLog = [];
    }
    EditorMod.CtgryConfig[cifCtgry].editLog.push({
        "type": "edit",
        "rewind_idx": EditorMod.editActnIndx,
        "rowidx": trueRowIdx,
        "colidx": trueColIdx,
        "origvalue": origValue
    });

}

//////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// Transposed Table Helper Functions /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

function transposeTable(cifCtgryNm) {
    var oDTable = $('#' + cifCtgryNm + '_tbl').dataTable();
    var bCrrntlyTrnspsd = oDTable.fnTransposeState();

    if (bCrrntlyTrnspsd) { //toggle button label to indicate action on user's next button click
        $('#transposevw-' + cifCtgryNm).val("Transpose View");
    } else {
        $('#transposevw-' + cifCtgryNm).val("Default View");
    }

    oDTable.fnTranspose(!bCrrntlyTrnspsd); // alternate the rotation of the table and redraw
    if (oDTable.fnTransposeState()) {
        $('#' + cifCtgryNm + '_tbl_wrapper input.search_init').parent().hide();
    }



    oDTable.fnAdjustColumnSizing(); // this API call also takes care of redrawing the DataTable
    oDTable.width("100%");

}


//////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// Visualization Helper Functions /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

function launchJmol(cifCtgry, rowId) {

    var iPos = EditorMod.oDataTable.fnGetPosition(EditorMod.currentRowSlctd_TrNode);
    /**FOR DEBUGGING
	var names = "";
	for(var property in EditorMod.oDataTable.fnGetData(iPos)){
		if( property.indexOf("DT_") == -1 ){
			names += property + "\n";
		}
	}
	alert(names);
	***/
    var jsonObj = {};
    for (var property in EditorMod.oDataTable.fnGetData(iPos)) {
        if (property.indexOf("DT_") == -1) {
            jsonObj[property] = EditorMod.oDataTable.fnGetData(iPos)[property];
        }
    }
    var jsonStr = JSON.stringify(jsonObj);
    //alert("testing for jsonStr with value as: " + jsonStr);

    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.GET_JMOL_SETUP,
        clearForm: false,
        beforeSubmit: function(formData, jqForm, options) {
            formData.push({
                "name": "cifctgry",
                "value": cifCtgry
            });
            formData.push({
                "name": "row_idx",
                "value": rowId
            });
            formData.push({
                "name": "row_key_value_json",
                "value": jsonStr
            });
        },
        success: function(jsonObj) {
            try {
                //alert(jsonObj.htmlmrkup);
                //$('#jmol_viewer').show();
                $('#jmol_viewer').html(jsonObj.htmlmrkup).dialog({
                    width: 600,
                    height: 600,
                    position: {
                        my: "center top",
                        at: "center top+15%",
                        of: window
                    },
                    close: function(event, ui) {
                        $(".jmol_view").attr("disabled", false);
                        $('.cifctgry_add_row').attr("disabled", false);
                        $('.cifctgry_delete_row').attr("disabled", false);
                        $('.cifctgry_insert_row').attr("disabled", false);
                        $('#saveunfinished').attr("disabled", false);
                        $('#savedone').attr("disabled", false);
                    }
                });
                $('.jmol_view').attr("disabled", true);
                $('.cifctgry_add_row').attr("disabled", true);
                $('.cifctgry_delete_row').attr("disabled", true);
                $('.cifctgry_insert_row').attr("disabled", true);
                $('#saveunfinished').attr("disabled", true);
                $('#savedone').attr("disabled", true);
            } catch (err) {
                alert("error on launchJmol.");
                $('.errmsg').html(EditorMod.errStyle + 'Error: ' + JSON.stringify(jsonObj) + '<br />\n' + EditorMod.adminContact).show().delay(30000).slideUp(800);
            }
        }
    });
    return false;
}


function getListOfCategoriesWth3DCntxt() {
    $('#hlprfrm').ajaxSubmit({
        url: EditorMod.URL.GET_CATEGORIES_3D_CNTXT,
        clearForm: false,
        success: function(jsonObj) {
            try {
                //alert(jsonObj.categories);
                EditorMod.arrCtgriesWth3Dcntxt = jsonObj.categories.split(',');
            } catch (err) {
                alert("error on getListOfCategoriesWth3DCntxt().");
                $('.errmsg').html(EditorMod.errStyle + 'Error: ' + JSON.stringify(jsonObj) + '<br />\n' + EditorMod.adminContact).show().delay(30000).slideUp(800);
            }
        }
    });
}

function doesCrrntCtgryHave3DCntxt(cifCtgry) {
    for (var i = 0; i < EditorMod.arrCtgriesWth3Dcntxt.length; i++) {
        //alert("crrntCat: "+EditorMod.currentCtgryNm+" and crrnt arrValue is: "+EditorMod.arrCtgriesWth3Dcntxt[i]);
        if (cifCtgry == EditorMod.arrCtgriesWth3Dcntxt[i]) {
            return true;
        }
    }
    return false;
}

function ctgryIsReadOnly(cifCtgry) {
    for (var i = 0; i < EditorMod.arrReadOnlyCtgries.length; i++) {
        //alert("crrntCat: "+EditorMod.currentCtgryNm+" and crrnt arrValue is: "+EditorMod.arrCtgriesWth3Dcntxt[i]);
        if (cifCtgry == EditorMod.arrReadOnlyCtgries[i]) {
            return true;
        }
    }
    return false;
}
/////////////////////////////////////////////////////////////////////////////////////////////
///////////////// Navigation Helper Functions ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function closeWindow() {
    //uncomment to open a new window and close this parent window without warning
    //var newwin=window.open("popUp.htm",'popup','');
    if (navigator.appName == "Microsoft Internet Explorer") {
        this.focus();
        self.opener = this;
        self.close();
    } else {
        window.open('', '_parent', '');
        window.close();
    }
}

function iframeCloser() {
    // Check if we are living within an iframe and if so try to invoke the 
    // iframe close method in the parent window... 
    var isInIFrame = (window.location != window.parent.location) ? true : false;
    if (isInIFrame) {
        var parentWindow = null;
        if (window.parent != window.top) {
            parentWindow = window.top;
        } else {
            parentWindow = window.parent;
        }
        if ($.isFunction(parentWindow.hideEditFrame)) {
            console.log("Invoking iframe close method");
            parentWindow.hideEditFrame();
        } else {
            console.log(">>>WARNING -Can't find iframe destroy method");
        }
    }
}

function exitEditor(exitMode) {
    var exitURL;
    var msg;
    var bIsWorkflow = false;
    var bParentModuleContext = false; //i.e. CIF editor launched as child of parent module such as AddedAnnotMod, EntityFixerMod, etc.
    var fsrc = FILE_SOURCE.toLowerCase();
    if (fsrc.startsWith("wf") || fsrc == "archive") {
        bIsWorkflow = true;
    }
    if (DATAFILE.length > 1 && fsrc != "upload") {
        bParentModuleContext = true;
    }
    if (exitMode == "done") {
        exitURL = EditorMod.URL.EXIT_FINISHED;
        if (bIsWorkflow) {
            msg = ">>> Work will be saved and mmCIF editor processing now complete.";
        } else {
            msg = ">>> Saving. mmCIF file saved with any updates on server.";
        }
    }
    if (exitMode == "abort") {
        exitURL = EditorMod.URL.EXIT_ABORT;
        //msg = ">>> Any changes made during this session have been aborted.";		
    }
    /***
    else if( exitMode = "unfinished" ){
    	exitURL = EditorMod.URL.EXIT_NOT_FINISHED;
    	if( bIsWorkflow ){
    		msg = ">>> Work will be saved and can be resumed at a later point.";
    	}
    	else{
    		msg = ">>>Saving your edits.";
    	}
    }***/
    $('#hlprfrm').ajaxSubmit({
        url: exitURL,
        clearForm: false,
        success: function() {
            if (EditorMod.context != "editorconfig" && exitMode != "abort") {
                alert(msg);
            }
            if (!bIsWorkflow && !bParentModuleContext) {
                if (EditorMod.context == "editorconfig") {
                    $("#postSaveContent").show();
                    $("#mainContent").hide();
                } else {
                    if (exitMode != "abort") {
                        $('html').html('<br /><br /><div><p>You may right-click on this link to download the updated cif file:</p><p><a href="' + SESS_PATH_PREFIX + '/' + DATAFILE + '" >' + DATAFILE + '</a></div>');
                    } else {
                        $('html').html('');
                    }
                }
            } else {
                iframeCloser();
                closeWindow();
            }
        }
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////END: FUNCTION DEFINITIONS /////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
