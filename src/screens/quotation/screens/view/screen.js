import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Row, Col } from 'reactstrap';
import * as SupplierInvoiceDetailActions from './actions';
import * as SupplierInvoiceActions from '../../actions';
import * as QuotationDetailsAction from '../detail/actions';
import * as PurchaseOrderDetailsAction from '../detail/actions';
import ReactToPrint from 'react-to-print';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';

import './style.scss';
import { PDFExport } from '@progress/kendo-react-pdf';

import './style.scss';
import { RFQTemplate } from './sections';

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		supplierInvoiceActions: bindActionCreators(
			SupplierInvoiceActions,
			dispatch,
		),
		supplierInvoiceDetailActions: bindActionCreators(
			SupplierInvoiceDetailActions,
			dispatch,
		),
		quotationDetailsAction: bindActionCreators(
			QuotationDetailsAction,
			dispatch,
		),
		purchaseOrderDetailsAction: bindActionCreators(
			PurchaseOrderDetailsAction,
			dispatch,
		)
		//commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class ViewQuotation extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			QuotationData: {},
			totalNet: 0,
			currencyData: {},
			id: '',
		};

		this.formRef = React.createRef();
		this.termList = [
			{ label: 'Net 7', value: 'NET_7' },
			{ label: 'Net 10', value: 'NET_10' },
			{ label: 'Net 30', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
	}

	componentDidMount = () => {
		this.initializeData();
	};

	initializeData = () => {
		if (this.props.location.state && this.props.location.state.id) {
			this.props.quotationDetailsAction
				.getQuotationById(this.props.location.state.id)
				.then((res) => {
					let val = 0;
					if (res.status === 200) {
						res.data.poQuatationLineItemRequestModelList.map((item) => {
							val = val + item.subTotal;
							return item;
						});
						this.setState(
							{
								QuotationData: res.data,
								totalNet: val,
								id: this.props.location.state.id,
							},
							() => {
								// if (this.state.RFQData.currencyCode) {
								// 	this.props.supplierInvoiceActions
								// 		.getCurrencyList()
								// 		.then((res) => {
								// 			if (res.status === 200) {
								// 				const temp = res.data.filter(
								// 					(item) =>
								// 						item.currencyCode ===
								// 						this.state.invoiceData.currencyCode,
								// 				);
								// 				this.setState({
								// 					currencyData: temp,
								// 				});
								// 			}
								// 		});
								// }
							},
						);
					}
				});
		}
	};

	exportPDFWithComponent = () => {
		this.pdfExportComponent.save();
	};

	render() {
		const { QuotationData, currencyData, id } = this.state;

		const { profile } = this.props;
		return (
			<div className="view-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<div className="action-btn-container">
								<Button
									className="btn btn-sm pdf-btn"
									onClick={() => {
										this.exportPDFWithComponent();
									}}
								>
									<i className="fa fa-file-pdf-o"></i>
								</Button>
								<ReactToPrint
									trigger={() => (
										<Button
											type="button"
											className="btn btn-sm print-btn"
											onClick={() => window.print()}
										>
											<i className="fa fa-print"></i>
										</Button>
									)}
									content={() => this.componentRef}
								/>

								<p
									className="close"
									onClick={() => {
										this.props.history.push('/admin/expense/purchase-order');
									}}
								>
									X
								</p>
							</div>
							<div>
								<PDFExport
									ref={(component) => (this.pdfExportComponent = component)}
									scale={0.8}
									paperSize="A3"
								>
									<RFQTemplate
										QuotationData={QuotationData}
										currencyData={currencyData}
										ref={(el) => (this.componentRef = el)}
										totalNet={this.state.totalNet}
										companyData={profile}
									/>
								</PDFExport>
							</div>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewQuotation);
