/***********************************************************************************************************
File:		category.js
Author:		rsala (rsala@rcsb.rutgers.edu)
Date:		2012-03-12
Version:	0.0.1

JavaScript defining Category object used to encapsulate management of cif category data for in
General Annotation Editor Module web interface 

2012-03-12, RPS: Created
2012-04-02, RPS: Updated to support propagation of config settings required by jQuery DataTable plugin
2012-04-09, RPS: Adding support for addition of new records by user.
2012-04-10, RPS: Introduced support for deleting a record.
2012-08-01, RPS: Augmented handling for hidden columns.
2012-08-10, RPS: Added getPriorityColumns() function.
2013-02-01, RPS: Added support for enforcing read-only columns.
2013-03-06, RPS: Introduced support for implementing sortable columns.
2013-03-18, RPS: "sortable" columns property correctly renamed to "presorted" columns
2013-04-24, RPS: Support for managing MANDATORY columns
2013-05-17, RPS: Removed obsolete code for handling transposed data that had been constructed server-side (strategy now abandoned)
2014-07-10, RPS: Added "addedRowIds" property for Category in support of "insertRow" functionality.
2015-06-12, RPS: Added this.sort_asc_col_idx / getSortAscColIdx() which will now be provided by server-side intelligence for determining 
					column on which to sort ascending (if any)
*************************************************************************************************************/

function Category(){
	
	this.loadFromJson = function(json){
		this.name = json.NAME;
		this.display_name = json.DISPLAY_NAME;
		this.inpt_types = json.INPUT_TYPES;
		this.enum_opts = json.COLUMN_ENUMS;
		this.prmry_ky = json.PRIMARY_KEYS;
		this.col_cnt = json.COLUMN_COUNT;
		this.col_displ_ordr = json.COLUMN_DISPLAY_ORDER;
		this.col_displ_ordr_item_names = json.COLUMN_DISPLAY_ORDER_AS_ITEM_NAMES;
		this.sort_asc_col_idx = json.SORT_ASC_COL_IDX;
		this.priority_cols = json.PRIORITY_COLUMNS;
		this.read_only_cols = json.READ_ONLY_COLUMNS;
		this.hidden_cols = json.HIDDEN_COLUMNS;
		this.mandatory_cols = json.MANDATORY_COLUMNS;
		this.presorted_cols = [];
		this.vldt_err_flgs = json.VLDT_ERR_FLAGS;
		this.vldt_err_flg_cols = json.VLDT_ERR_FLAGS_COLS;
		this.dtbl_aocolumns = json.DTBL_AOCOLUMNS;
		this.bAddingNewRow = false;
		this.originalTotalRows = null;
		this.addingRowHwm = null;
		this.addedRows = 0;
		this.deletedRows = 0;
		this.addedRowIds = [];
		this.iCnt_DrawBackCalledOnCurrentTbl = 0;
	};

}
Category.prototype.getCtgryName = function(){
	return this.name;
};
Category.prototype.getInputType = function(colIndx){
	var type = "text";
	if( this.inpt_types[colIndx] && this.inpt_types[colIndx].length > 0 ) type = this.inpt_types[colIndx];
	return type;
};
Category.prototype.getSubmitType = function(colIndx){
	var sbmtType = "";
	if( this.inpt_types[colIndx] && (this.inpt_types[colIndx] == 'select' /**|| this.inpt_types[colIndx] == 'autocomplete'**/) ) sbmtType = 'OK';
	return sbmtType;
};
Category.prototype.getSelectOpts = function(colIndx){
	var opts = "";
	
	if( this.enum_opts[colIndx] ){
		opts = "{";
        var sep = '';
        var thisArray = this.enum_opts[colIndx];
		for( var idx in thisArray ){
			if( idx > 0 ) sep = ', ';
			opts += (sep+"'"+thisArray[idx] + "': '"+thisArray[idx]+"'");
		}
		opts += "}";
	}
    //alert("opts: "+opts);
	return opts;
};
Category.prototype.getAutoCmpltOpts = function(colIndx){
	var choices = "";
	if( this.enum_opts[colIndx] ) choices = this.enum_opts[colIndx];
	return choices;
};
Category.prototype.getVldtFlags = function(colIndx,rowIndx){
	var vldtFlgs;
	if( this.vldt_err_flgs[colIndx] && this.vldt_err_flgs[colIndx][rowIndx] ) vldtFlgs = this.vldt_err_flgs[colIndx][rowIndx];
	return vldtFlgs;
};
Category.prototype.getVldtFlagCols = function(){
	if( typeof(this.vldt_err_flg_cols) != "undefined" ){
		return this.vldt_err_flg_cols;
	}
	else return [];
};
Category.prototype.getPrimaryKey = function(){
	if( typeof(this.prmry_ky) != "undefined" ){
		return this.prmry_ky;
	}
	else return [0];
};
Category.prototype.getNumCols = function(){
	if( typeof(this.col_cnt) != "undefined" ){
		return this.col_cnt;
	}
	else return 0;
};
Category.prototype.getColDisplOrder = function(){
	if( typeof(this.col_displ_ordr) != "undefined" ){
		return this.col_displ_ordr;
	}
	else return [0];
};
Category.prototype.getColDisplOrderAsItemNames = function(){
	if( typeof(this.col_displ_ordr_item_names) != "undefined" ){
		return this.col_displ_ordr_item_names;
	}
	else return [0];
};
Category.prototype.getColIdxForItemName = function(colName){
	
	if( typeof(this.col_displ_ordr_item_names) != "undefined" ){
		for(var x=0; x < this.col_displ_ordr_item_names.length; x++){
			if( this.col_displ_ordr_item_names[x] == colName ){
				return x;
			}
		}
	}
	return -1;
};
Category.prototype.getSortAscColIdx = function(){
	if( typeof(this.sort_asc_col_idx) != "undefined" ){
		return this.sort_asc_col_idx;
	}
	else return -1;
};
Category.prototype.getPriorityColumns = function(){
	if( typeof(this.priority_cols) != "undefined" ){
		return this.priority_cols;
	}
	else return [0];
};
Category.prototype.getReadOnlyColumns = function(){
	if( typeof(this.read_only_cols) != "undefined" ){
		return this.read_only_cols;
	}
	else return [0];
};
Category.prototype.getPreSortedColumns = function(){
	if( typeof(this.presorted_cols) != "undefined" ){
		return this.presorted_cols;
	}
	else return [];
};
Category.prototype.getHiddenColumns = function(){
	if( typeof(this.hidden_cols) != "undefined" ){
		return this.hidden_cols;
	}
	else return [0];
};
Category.prototype.getMandatoryColumns = function(){
	if( typeof(this.mandatory_cols) != "undefined" ){
		return this.mandatory_cols;
	}
	else return [0];
};
Category.prototype.getDataTblaoColumns = function(){
	if( typeof(this.dtbl_aocolumns) != "undefined" ){
		return this.dtbl_aocolumns;
	}
	else return [];
};
/********END OF CATEGORY OBJECT DEFINITION***********************************************************************************/
