import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Button,
	Col,
	FormGroup,
	Card,
	CardHeader,
	CardBody,
	Row,
	TabContent,
	TabPane,
	Nav,
	NavItem,
	NavLink,
	Form,
	Label,
	Table,
	Input
} from 'reactstrap';
import Select from 'react-select';
import { AuthActions, CommonActions } from 'services/global';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from "yup";
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { Formik } from 'formik';
import './style.scss';
import * as VatreportAction from './actions';
import { selectOptionsFactory } from 'utils';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { isDate, upperFirst } from 'lodash-es';

import logo from 'assets/images/brand/logo.png';
import styled from 'styled-components';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import moment from 'moment';
import { Date } from 'core-js';
import download from 'downloadjs';
import { align } from '@progress/kendo-drawing';
import { AgGridReact, AgGridColumn } from 'ag-grid-react/lib/agGridReact';
const mapStateToProps = (state) => {
	return {
		version: state.common.version,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
		vatreport: bindActionCreators(VatreportAction, dispatch),
	};
};


class VatPaymentRecord extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initValue: {},
			loading: false,
			fileName: '',
			disabled: false,
			productName: '',
			version: '',
			type: '',
			upload: false,
			file_data_list: [],
			openModal: false,
			vatReportDataList: 
				[
					{
					taxReturns:"Sept 2021",dateOfFiling:"1st Jan 2022",amountPaid:3600,amountReclaimed:"---"
					},
					{
					taxReturns:"Oct 2021",dateOfFiling:"1st Jan 2022",amountPaid:"---",amountReclaimed:7300},
					{
					taxReturns:"Nov 2021",dateOfFiling:"1st Jan 2022",amountPaid:"---",amountReclaimed:3500},
					{
					taxReturns:"Dec 2021",dateOfFiling:"1st Jan 2022",amountPaid:5000,amountReclaimed:"---"
					}
				],
				paginationPageSize:10,
			
		};
	}
    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.gridApi.paginationSetPageSize(Number(value));
      };
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
      };
      
    onBtnExport = () => {
        this.gridApi.exportDataAsCsv();
      };

    onBtnExportexcel= () => {
        this.gridApi.exportDataAsExcel();
      };
	componentDidMount = () => {
		this.getInitialData();

	};

	getInitialData = () => {
		this.props.vatreport
			.getVatPaymentHistoryList()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ vatReportDataList: res.data }) // comment for dummy
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
			});
	};


	renderDate = (cell, row) => {
		return cell ? moment(cell)
			// .format('DD/MM/YYYY') 
			.format('LL')
			: '-';
	};


	render() {
		const { vatReportDataList, csvFileNamesData ,company_profile} = this.state;
		return (
			<div className="import-bank-statement-screen">
				<div className="animated fadeIn">
					<Card>
						<CardHeader>
							<Row>
								<Col lg={12}>


									<div
										className="h4 mb-0 d-flex align-items-center"
										style={{ justifyContent: 'space-between' }}
									>
										<div>
											<p
												className="mb-0"
												style={{
													cursor: 'pointer',
													fontSize: '1rem',
													paddingLeft: '15px',
												}}
												onClick={this.viewFilter}
											>
												<i className="fa fa-history mr-2"></i>Vat Payment Record
											</p>
										</div>
										<div className="d-flex">



											<Button
												className="mr-2 print-btn-cont"
												onClick={() => {
													this.props.history.push('/admin/report/vatreports');
												}}
												style={{cursor: 'pointer'}}
											>
												<span>X</span>
											</Button>

										</div>
									</div>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							
							<div style={{										
									// display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '1rem'}}>
									<div>
									<img
										src={ 
											company_profile &&
											company_profile.companyLogoByteArray
												? 'data:image/jpg;base64,' +
											company_profile.companyLogoByteArray
												: logo
										}
										className=""
										alt=""
										style={{ width: ' 150px' }}></img>
								
									
									</div>			
									<div style={{textAlign:'center'}} >
								
										<h2>
										{company_profile &&
											company_profile['companyName']
												? company_profile['companyName']
												: 'ABC GROUP'}
											</h2>	
										
											<b style ={{ fontSize: '18px'}}>Vat Payment Record</b>
											<br/>
											<br/>
										
										
											
									</div>
									
								
							</div>
							<div className="ag-theme-alpine mb-3" style={{ height: 600, width: "100%" }}>
								
								<AgGridReact
									rowData={
										vatReportDataList
											? vatReportDataList
											: []}
									pagination={true}
									rowSelection="multiple"
									paginationPageSize={this.state.paginationPageSize}
									floatingFilter={true}
									defaultColDef={{
										resizable: true,
										flex: 1,
										sortable: true
									}}
									sideBar="columns"
									onGridReady={this.onGridReady}
								>

									<AgGridColumn field="taxReturns"
										headerName="Tax Return"
										sortable={true}
										filter={true}
										checkboxSelection={true}
										enablePivot={true}
									></AgGridColumn>

									<AgGridColumn field="dateOfFiling"
										headerName="Date Of Filing"
										sortable={true}
										filter={true}
										enablePivot={true}	
										cellRendererFramework={(params) =>
											<>
												{this.renderDate(params.value, params)}
											</>
										}							
									></AgGridColumn>

									<AgGridColumn field="amountPaid"
										headerName="Amount Paid"
										sortable={true}
										filter={true}
										enablePivot={true}
									></AgGridColumn>

									<AgGridColumn field="amountReclaimed"

										headerName="Amount Reclaimed"
										sortable={true}
										enablePivot={true}
										filter={true}
						
									></AgGridColumn>

								</AgGridReact>
								<div className="example-header mt-1">
									Page Size:
									<select onChange={() => this.onPageSizeChanged()} id="page-size">
										<option value="10" selected={true}>
											10
										</option>
										<option value="100">100</option>
										<option value="500">500</option>
										<option value="1000">1000</option>
									</select>
								</div>
							</div>

						</CardBody>
					</Card>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(VatPaymentRecord);
