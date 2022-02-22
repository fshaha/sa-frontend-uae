import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	UncontrolledTooltip,
} from 'reactstrap';
import Select from 'react-select';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import DatePicker from 'react-datepicker';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import * as CreditNotesCreateActions from './actions';
import * as CreditNotesActions from '../../actions';
import * as ProductActions from '../../../product/actions';
import * as CurrencyConvertActions from '../../../currencyConvert/actions';
import { CustomerModal, ProductModal,InvoiceNumberModel} from '../../sections';
import { MultiSupplierProductModal } from '../../sections';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { CommonActions } from 'services/global';
import { selectCurrencyFactory, selectOptionsFactory } from 'utils';

import './style.scss';
import moment from 'moment';
import {data}  from '../../../Language/index'
import LocalizedStrings from 'react-localization';
import Switch from "react-switch";
import { Checkbox } from '@material-ui/core';

const mapStateToProps = (state) => {
	return {
		currency_list: state.customer_invoice.currency_list,
		invoice_list:state.creditNote.invoice_list,
		vat_list: state.customer_invoice.vat_list,
		product_list: state.customer_invoice.product_list,
		customer_list: state.customer_invoice.customer_list,
		excise_list: state.customer_invoice.excise_list,
		country_list: state.customer_invoice.country_list,
		product_category_list: state.product.product_category_list,
		universal_currency_list: state.common.universal_currency_list,
		currency_convert_list: state.currencyConvert.currency_convert_list,
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		creditNotesActions: bindActionCreators(
			CreditNotesActions,
			dispatch,
		),
		currencyConvertActions: bindActionCreators(CurrencyConvertActions, dispatch),
		creditNotesCreateActions: bindActionCreators(
			CreditNotesCreateActions,
			dispatch,
		),
		productActions: bindActionCreators(ProductActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

const customStyles = {
	control: (base, state) => ({
		...base,
		borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		boxShadow: state.isFocused ? null : null,
		'&:hover': {
			borderColor: state.isFocused ? '#2064d8' : '#c7c7c7',
		},
	}),
};

const invoiceimage = require('assets/images/invoice/invoice.png');

let strings = new LocalizedStrings(data);
class CreateCreditNote extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			customer_currency_symbol:'',
			loading: false,
			disabled: false,
			discountOptions: [
				{ value: 'FIXED', label: 'Fixed' },
				{ value: 'PERCENTAGE', label: 'Percentage' },
			],
			disabledDate: true,
			data: [
				{
					id: 0,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					exciseTaxId:'',
					exciseAmount:'',
					subTotal: 0,
					vatAmount:0,
					productId: '',
					isExciseTaxExclusive:'',
					discountType: 'FIXED',
					discount: 0,
				},
			],
			idCount: 0,
			initValue: {
				invoiceNumber:'',
				receiptAttachmentDescription: '',
				receiptNumber: '',
				contact_po_number: '',
				currency: '',
				// invoiceDueDate: '',
				creditNoteDate: new Date(),
				contactId: '',
				// placeOfSupplyId: '',
				project: '',
				term: '',
				// exchangeRate:'',
				lineItemsString: [
					{
						id: 0,
						description: '',
						quantity: 1,
						unitPrice: '',
						vatCategoryId: '',
						productId: '',
						subTotal: 0,
					},
				],
				creditNoteNumber: '',
				total_net: 0,
				invoiceVATAmount: 0,
				totalVatAmount: 0,
				totalAmount: 0,
				notes: '',
				email:'',
				discount: 0,
				discountPercentage: '',
				discountType: 'FIXED',
				creditAmount:0,
				total_excise: 0,
			},
			total_excise: 0,
			// excisetype: { value: 'Inclusive', label: 'Inclusive' },
			currentData: {},
			contactType: 2,
			openMultiSupplierProductModal: false,
			openCustomerModal: false,
			openProductModal: false,
			openInvoiceNumberModel: false,
			selectedContact: '',
			createMore: false,
			fileName: '',
			term: '',
			selectedType: { value: 'FIXED', label: 'Fixed' },
			discountPercentage: '',
			discountAmount: 0,
			exist: false,
			prefix: '',
			purchaseCategory: [],
			salesCategory: [],
			// exchangeRate:'',		
			basecurrency:[],
			inventoryList:[],
            remainingInvoiceAmount:'',
			invoiceSelected:false,
			isCreatedWIWP:false,
			quantityExceeded:'',
			isCreatedWithoutInvoice:false
		};

		this.formRef = React.createRef();

		this.file_size = 1024000;
		this.supported_format = [
			'image/png',
			'image/jpeg',
			'text/plain',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		];

		this.termList = [
			{ label: 'Net 7 Days', value: 'NET_7' },
			{ label: 'Net 10 Days', value: 'NET_10' },
			{ label: 'Net 30 Days', value: 'NET_30' },
			{ label: 'Due on Receipt', value: 'DUE_ON_RECEIPT' },
		];
			this.placelist = [
			{ label: 'Abu Dhabi', value: '1' },
			{ label: 'Dubai', value: '2' },
			{ label: 'Sharjah', value: '3' },
			{ label: 'Ajman', value: '4' },
			{ label: 'Umm Al Quwain', value: '5' },
			{ label: 'Ras al-Khaimah', value: '6' },
			{ label: 'Fujairah', value: '7' },
		];
		this.regEx = /^[0-9\b]+$/;
		this.regExBoth = /[a-zA-Z0-9]+$/;
		this.regDecimal = /^[0-9][0-9]*[.]?[0-9]{0,2}$$/;
		this.regDecimalP = /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/;
	}

	// renderActions (cell, row) {
	//   return (
	//     <Button
	//       size="sm"
	//       color="primary"
	//       className="btn-brand icon"
	//     >
	//       <i className="fas fa-trash"></i>
	//     </Button>
	//   )
	// }

	renderProductName = (cell, row) => {
		return (
			<div className="d-flex align-items-center">
				<Input type="hidden" className="mr-1"></Input>
			</div>
		);
	};

	renderDescription = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.description`}
				render={({ field, form }) => (
					<Input
					disabled
						type="text"
						maxLength="250"
						value={row['description'] !== '' ? row['description'] : ''}
						onChange={(e) => {
							this.selectItem(e.target.value, row, 'description', form, field);
						}}
						placeholder={strings.Description}
						className={`form-control ${props.errors.lineItemsString &&
								props.errors.lineItemsString[parseInt(idx, 10)] &&
								props.errors.lineItemsString[parseInt(idx, 10)].description &&
								Object.keys(props.touched).length > 0 &&
								props.touched.lineItemsString &&
								props.touched.lineItemsString[parseInt(idx, 10)] &&
								props.touched.lineItemsString[parseInt(idx, 10)].description
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderQuantity = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.quantity`}
				render={({ field, form }) => (
					<div>
						<Input
							type="text"
							min="0"
							maxLength="10"
							value={row['quantity'] !== 0 ? row['quantity'] : 0}
							onChange={(e) => {
								if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
									this.selectItem(
										e.target.value,
										row,
										'quantity',
										form,
										field,
										props,
									);

									this.setState({currentRow:row})
								}

							}}
							placeholder={strings.Quantity}
							className={`form-control  ${props.errors.lineItemsString &&
									props.errors.lineItemsString[parseInt(idx, 10)] &&
									props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
									Object.keys(props.touched).length > 0 &&
									props.touched.lineItemsString &&
									props.touched.lineItemsString[parseInt(idx, 10)] &&
									props.touched.lineItemsString[parseInt(idx, 10)].quantity
									? 'is-invalid'
									: ''
							}`}
						/>
						{props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].quantity &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].quantity && (
								<div className="invalid-feedback">
									{props.errors.lineItemsString[parseInt(idx, 10)].quantity}
								</div>
							)}
					</div>
				)}
			/>
		);
	};

	renderUnitPrice = (cell, row, props) => {
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.unitPrice`}
				render={({ field, form }) => (
					<Input
					disabled
					type="text"
					min="0"
						maxLength="14,2"
						value={row['unitPrice'] !== 0 ? row['unitPrice'] : 0}
						onChange={(e) => {
							if (
								e.target.value === '' ||
								this.regDecimal.test(e.target.value)
							) {
								this.selectItem(
									e.target.value,
									row,
									'unitPrice',
									form,
									field,
									props,
								);
							}
						}}
						placeholder={strings.UnitPrice}
						className={`form-control ${props.errors.lineItemsString &&
								props.errors.lineItemsString[parseInt(idx, 10)] &&
								props.errors.lineItemsString[parseInt(idx, 10)].unitPrice &&
								Object.keys(props.touched).length > 0 &&
								props.touched.lineItemsString &&
								props.touched.lineItemsString[parseInt(idx, 10)] &&
								props.touched.lineItemsString[parseInt(idx, 10)].unitPrice
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};

	renderSubTotal = (cell, row, extraData) => {
		return row.subTotal === 0 ? this.state.customer_currency_symbol +" "+ row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 }) : this.state.customer_currency_symbol +" "+ row.subTotal.toLocaleString(navigator.language, { minimumFractionDigits: 2 });

}

renderVatAmount = (cell, row,extraData) => {
	return row.vatAmount === 0 ? this.state.customer_currency_symbol +" "+  row.vatAmount.toLocaleString(navigator.language,{ minimumFractionDigits: 2 }): this.state.customer_currency_symbol +" "+ row.vatAmount.toLocaleString(navigator.language,{ minimumFractionDigits: 2 });

}

renderDiscount = (cell, row, props) => {
	const { discountOptions } = this.state;
   let idx;
   this.state.data.map((obj, index) => {
	   if (obj.id === row.id) {
		   idx = index;
	   }
	   return obj;
   });

   return (
	   <Field
			name={`lineItemsString.${idx}.discountType`}
		   render={({ field, form }) => (
		   <div>
		   <div  class="input-group">
			   <Input
			         disabled
					 type="text"
					   min="0"
					maxLength="14,2"
					value={row['discount'] !== 0 ? row['discount'] : 0}
					onChange={(e) => {
					   if (e.target.value === '' || this.regDecimal.test(e.target.value)) {
						   this.selectItem(
							   e.target.value,
							   row,
							   'discount',
							   form,
							   field,
							   props,
						   );
					   }
				   
						   this.updateAmount(
							   this.state.data,
							   props,
						   );
				   
				   }}
				   placeholder={strings.discount}
				   className={`form-control 
	   ${
					   props.errors.lineItemsString &&
					   props.errors.lineItemsString[parseInt(idx, 10)] &&
					   props.errors.lineItemsString[parseInt(idx, 10)].discount &&
					   Object.keys(props.touched).length > 0 &&
					   props.touched.lineItemsString &&
					   props.touched.lineItemsString[parseInt(idx, 10)] &&
					   props.touched.lineItemsString[parseInt(idx, 10)].discount
						   ? 'is-invalid'
						   : ''
				   }`}
type="text"
/>
<div class="dropdown open input-group-append">

	<div 	style={{width:'100px'}}>
	<Select

                                                                                       isDisabled={true}
																					   options={discountOptions}
																					   id="discountType"
																					   name="discountType"
																					   value={
																					discountOptions &&
																						selectOptionsFactory
																							.renderOptions('label', 'value', discountOptions, 'discount')
																							.find((option) => option.value == row.discountType)
																					   }
																					   onChange={(e) => {
																						   this.selectItem(
																							   e.value,
																							   row,
																							   'discountType',
																							   form,
																							   field,
																							   props,
																						   );
																						   this.updateAmount(
																							   this.state.data,
																							   props,
																						   );
																					   }}
																				   />
		 </div>
		  </div>
		  </div>
		   </div>

			   )}

	   />
   );
}

discountType = (row) =>

{
	 
	
		return this.state.discountOptions &&
		selectOptionsFactory
			.renderOptions('label', 'value', this.state.discountOptions, 'discount')
			.find((option) => option.value === +row.discountType)
}

	setDate = (props, value) => {
		const { term } = this.state;
		const val = term ? term.value.split('_') : '';
		const temp = val[val.length - 1] === 'Receipt' ? 1 : val[val.length - 1];
		const values = value
			? value
			: moment(props.values.creditNoteDate, 'DD-MM-YYYY').toDate();
		// if (temp && values) {
		// 	const date = moment(values)
		// 		.add(temp - 1, 'days')
		// 		.format('DD-MM-YYYY');
		// 	props.setFieldValue('invoiceDueDate', date, true);
		// }
	};

	// setExchange = (value) => {
	// 	let result = this.props.currency_convert_list.filter((obj) => {
	// 	return obj.currencyCode === value;
	// 	});
	// 	console.log('currency result', result)
	// 	this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
	// 	};

	setCurrency = (value) => {
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === value;
		});
		this.formRef.current.setFieldValue('curreancyname', result[0].currencyName, true);
	};

	validationCheck = (value) => {
		const data = {
			moduleType: 6,
			name: value,
		};
		this.props.creditNotesCreateActions
			.checkValidation(data)
			.then((response) => {
				if (response.data === 'Invoice Number Already Exists') {
					this.setState(
						{
							exist: true,
						},
						() => {},
					);
				} else {
					this.setState({
						exist: false,
					});
				}
			});
	};

	componentDidMount = () => {
		this.getInitialData();
	};

	getInitialData = () => {
		this.getInvoiceNo();
		this.props.creditNotesActions.getInvoiceListForDropdown();
		this.props.creditNotesActions.getCustomerList(this.state.contactType);
		this.props.creditNotesActions.getCountryList();
		this.props.creditNotesActions.getExciseList();
		this.props.creditNotesActions.getVatList();
		this.props.creditNotesActions.getProductList();
		this.props.productActions.getProductCategoryList();
		this.props.currencyConvertActions.getCurrencyConversionList().then((response) => {
			this.setState({
				initValue: {
					...this.state.initValue,
					...{
						currency: response.data
							? parseInt(response.data[0].currencyCode)
							: '',
					},
				},
			});
			// this.formRef.current.setFieldValue(
			// 	'currency',
			// 	response.data[0].currencyCode,
			// 	true,
			// );
		});
		// this.props.creditNotesActions.getInvoicePrefix().then((response) => {
		// 	this.setState({
		// 		prefixData: response.data

		// 	});
		// });
		this.getCompanyCurrency();
		this.salesCategory();
		this.purchaseCategory();
	};

	getCompanyCurrency = (basecurrency) => {
		this.props.currencyConvertActions
			.getCompanyCurrency()
			.then((res) => {
				if (res.status === 200) {
					this.setState({ basecurrency: res.data });
				}
			})
			.catch((err) => {
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'Something Went Wrong',
				);
				this.setState({ loading: false });
			});
	};	
	salesCategory = () => {
		try {
			this.props.productActions
				.getTransactionCategoryListForSalesProduct('2')
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								salesCategory: res.data,
							},
							() => {

							},
						);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};
	purchaseCategory = () => {
		try {
			this.props.productActions
				.getTransactionCategoryListForPurchaseProduct('10')
				.then((res) => {
					if (res.status === 200) {
						this.setState(
							{
								purchaseCategory: res.data,
							},
							() => {},
						);
					}
				});
		} catch (err) {
			console.log(err);
		}
	};

	renderExcise = (cell, row, props) => {
		const { excise_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.exciseTaxId`}
				render={({ field, form }) => (
					<Select
						styles={customStyles}
						isDisabled={true}
						options={
							excise_list
								? selectOptionsFactory.renderOptions(
										'name',
										'id',
										excise_list,
										'Excise',
								  )
								: []
						}
						value={
				
							excise_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', excise_list, 'Excise')
								.find((option) => option.value === +row.exciseTaxId)
						}
						id="exciseTaxId"
						placeholder={strings.Select+strings.Vat}
						onChange={(e) => {
							
							this.selectItem(
								e.value,
								row,
								'exciseTaxId',
								form,
								field,
								props,
							);
							
							this.updateAmount(
								this.state.data,
								props,
							);
						}}
						className={`${
							props.errors.lineItemsString &&
							props.errors.lineItemsString[parseInt(idx, 10)] &&
							props.errors.lineItemsString[parseInt(idx, 10)].exciseTaxId &&
							Object.keys(props.touched).length > 0 &&
							props.touched.lineItemsString &&
							props.touched.lineItemsString[parseInt(idx, 10)] &&
							props.touched.lineItemsString[parseInt(idx, 10)].exciseTaxId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};
	addRow = () => {
		const data = [...this.state.data];
		this.setState(
			{
				data: data.concat({
					id: this.state.idCount + 1,
					description: '',
					quantity: 1,
					unitPrice: '',
					vatCategoryId: '',
					productId: '',
					subTotal: 0,
					discountType:'FIXED',
					discount: 0,
					exciseTaxId:'',
				}),
				idCount: this.state.idCount + 1,
			},
			() => {
				this.formRef.current.setFieldValue(
					'lineItemsString',
					this.state.data,
					true,
				);
				this.formRef.current.setFieldTouched(
					`lineItemsString[${this.state.data.length - 1}]`,
					false,
					true,
				);
			},
		);
	};

	selectItem = (e, row, name, form, field, props) => {
		//e.preventDefault();
		let data = this.state.data;
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				obj[`${name}`] = e;
				idx = index;
			}
			return obj;
		});
		if (
			name === 'unitPrice' ||
			name === 'vatCategoryId' ||
			name === 'quantity'
		) {
			form.setFieldValue(
				field.name,
				this.state.data[parseInt(idx, 10)][`${name}`],
				true,
			);
			this.updateAmount(data, props);
		} else {
			this.setState({ data }, () => {
				form.setFieldValue(
					field.name,
					this.state.data[parseInt(idx, 10)][`${name}`],
					true,
				);
			});
		}
	};

	renderVat = (cell, row, props) => {
		const { vat_list } = this.props;
		let vatList = vat_list.length
			? [{ id: '', vat: 'Select Vat' }, ...vat_list]
			: vat_list;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});

		return (
			<Field
				name={`lineItemsString.${idx}.vatCategoryId`}
				render={({ field, form }) => (
					<Select
					isDisabled
						styles={customStyles}
						options={
							vat_list
								? selectOptionsFactory.renderOptions(
										'name',
										'id',
										vat_list,
										'Vat',
								  )
								: []
						}
						value={
							vat_list &&
							selectOptionsFactory
								.renderOptions('name', 'id', vat_list, 'Vat')
								.find((option) => option.value === +row.vatCategoryId)
						}
						id="vatCategoryId"
						placeholder={strings.Select+strings.Vat}
						onChange={(e) => {
							this.selectItem(
								e.value,
								row,
								'vatCategoryId',
								form,
								field,
								props,
							);
						}}
						className={`${props.errors.lineItemsString &&
								props.errors.lineItemsString[parseInt(idx, 10)] &&
								props.errors.lineItemsString[parseInt(idx, 10)].vatCategoryId &&
								Object.keys(props.touched).length > 0 &&
								props.touched.lineItemsString &&
								props.touched.lineItemsString[parseInt(idx, 10)] &&
								props.touched.lineItemsString[parseInt(idx, 10)].vatCategoryId
								? 'is-invalid'
								: ''
						}`}
					/>
				)}
			/>
		);
	};
	prductValue = (e, row, name, form, field, props) => {
		const { product_list } = this.props;
		let data = this.state.data;
		const result = product_list.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				console.log(result);
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				obj['exciseTaxId'] = result.exciseTaxId;
				obj['discountType'] = result.discountType;
				obj['isExciseTaxExclusive'] = result.isExciseTaxExclusive
				idx = index;
			}
			return obj;
		});
		form.setFieldValue(
			`lineItemsString.${idx}.vatCategoryId`,
			result.vatCategoryId,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.unitPrice`,
			result.unitPrice,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.exciseTaxId`,
			result.exciseTaxId,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.description`,
			result.description,
			true,
		);
		form.setFieldValue(
			`lineItemsString.${idx}.discountType`,
			result.discountType,
			true,
		);
		this.updateAmount(data, props);
	};

	setValue = (value) => {
		this.setState((prevState) => ({
			...prevState,
			initValue: [],
		}));
	};

	renderProduct = (cell, row, props) => {
		const { product_list } = this.props;
		let idx;
		this.state.data.map((obj, index) => {
			if (obj.id === row.id) {
				idx = index;
			}
			return obj;
		});
		//	if (product_list.length > 0) {
		return (
			<Field
				name={`lineItemsString.${idx}.productId`}
				render={({ field, form }) => (
					<Select
					isDisabled
						styles={customStyles}
						options={
							product_list
								? selectOptionsFactory.renderOptions(
									'name',
									'id',
									product_list,
									'Product',
								)
								: []
						}
						id="productId"
						placeholder={strings.Select+strings.Product}
						onChange={(e) => {
							if (e && e.label !== 'Select Product') {
								this.selectItem(
									e.value,
									row,
									'productId',
									form,
									field,
									props,
								);
								this.prductValue(
									e.value,
									row,
									'productId',
									form,
									field,
									props,
								);
								// this.props.creditNotesActions.getInventoryByProductId(e.value).then((response) => {
								// 	this.setState({
								// 		inventoryList: response.data
								// 	});
								// 	if (response.data.length !== 0 && response.data.length !== 1) {
								// 		this.openMultiSupplierProductModal(response);
								// 	}
								// });
							} else {
								form.setFieldValue(
									`lineItemsString.${idx}.productId`,
									e.value,
									true,
								);
								this.setState({
									data: [
										{
											id: 0,
											description: '',
											quantity: 1,
											unitPrice: '',
											vatCategoryId: '',
											subTotal: 0,
											productId: '',
										},
									],
								});
							}
						}}
						value={
							product_list && row.productId
								? selectOptionsFactory
									.renderOptions('name', 'id', product_list, 'Product')
									.find((option) => option.value === +row.productId)
								: []
						}
						className={`${props.errors.lineItemsString &&
								props.errors.lineItemsString[parseInt(idx, 10)] &&
								props.errors.lineItemsString[parseInt(idx, 10)].productId &&
								Object.keys(props.touched).length > 0 &&
								props.touched.lineItemsString &&
								props.touched.lineItemsString[parseInt(idx, 10)] &&
								props.touched.lineItemsString[parseInt(idx, 10)].productId
								? 'is-invalid'
								: ''
							}`}
					/>
				)}
			/>
		);
		// } else {
		// 	return (
		// 		<Button
		// 			type="button"
		// 			color="primary"
		// 			className="btn-square mr-3 mb-3"
		// 			onClick={(e, props) => {
		// 				this.openProductModal(props);
		// 			}}
		// 		>
		// 			<i className="fa fa-plus"></i> Add a Product
		// 		</Button>
		// 	);
		// }
	};

	deleteRow = (e, row, props) => {
		const id = row['id'];
		let newData = [];
		e.preventDefault();
		const data = this.state.data;
		newData = data.filter((obj) => obj.id !== id);
		props.setFieldValue('lineItemsString', newData, true);
		this.updateAmount(newData, props);
	};

	renderActions = (cell, rows, props) => {
		return (
			<Button
				size="sm"
				className="btn-twitter btn-brand icon mt-1"
				disabled={this.state.data.length === 1 ? true : false}
				onClick={(e) => {
					this.deleteRow(e, rows, props);
				}}
			>
				<i className="fas fa-trash"></i>
			</Button>
		);
	};

	renderAddProduct = (cell, rows, props) => {
		return (
			<Button
				color="primary"
				className="btn-twitter btn-brand icon"
				onClick={(e, props) => {
					this.openProductModal(props);
				}}
			>
				<i className="fas fa-plus"></i>
			</Button>
		);
	};

	checkedRow = () => {
		if (this.state.data.length > 0) {
			let length = this.state.data.length - 1;
			let temp = Object.values(this.state.data[`${length}`]).indexOf('');
			if (temp > -1) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	updateAmount = (data, props) => {
		const { vat_list , excise_list} = this.props;
		const { discountPercentage, discountAmount } = this.state;
		let total_net = 0;
		let total_excise = 0;
		let total = 0;
		let total_vat = 0;
		let net_value = 0;
		let discount = 0;
		data.map((obj) => {
			const index =
				obj.vatCategoryId !== ''
					? vat_list.findIndex((item) => item.id === +obj.vatCategoryId)
					: '';
			const vat = index !== '' ? vat_list[`${index}`].vat : 0;

			//Excise calculation
			if(obj.exciseTaxId !=  0){
				if(obj.isExciseTaxExclusive === true){
				if(obj.exciseTaxId === 1){
				const value = +(obj.unitPrice) / 2 ;
					net_value = parseFloat(obj.unitPrice) + parseFloat(value) ;
					obj.exciseAmount = parseFloat(value) * obj.quantity;
				}else if (obj.exciseTaxId === 2){
					const value = obj.unitPrice;
					net_value = parseFloat(obj.unitPrice) +  parseFloat(value) ;
					obj.exciseAmount = parseFloat(value) * obj.quantity;
				}
				else{
					net_value = obj.unitPrice
				}
			}	else{
				if(obj.exciseTaxId === 1){
					const value = obj.unitPrice / 3
					obj.exciseAmount = parseFloat(value) * obj.quantity;
				net_value = obj.unitPrice}
				else if (obj.exciseTaxId === 2){
					const value = obj.unitPrice / 2
					obj.exciseAmount = parseFloat(value) * obj.quantity;
				net_value = obj.unitPrice}
				else{
					net_value = obj.unitPrice
				}
			}
		}else{
			net_value = obj.unitPrice;
			obj.exciseAmount = 0
		}
			//vat calculation
			if (obj.discountType === 'PERCENTAGE') {
				var val =
				((+net_value -
				 (+((net_value * obj.discount)) / 100)) *
					vat *
					obj.quantity) /
				100;

				var val1 =
				((+net_value -
				 (+((net_value * obj.discount)) / 100)) * obj.quantity ) ;
			} else if (obj.discountType === 'FIXED') {
				var val =
						 (net_value * obj.quantity - obj.discount ) *
					(vat / 100);

					var val1 =
					((net_value * obj.quantity )- obj.discount )

			} else {
				var val = (+net_value * vat * obj.quantity) / 100;
				var val1 = net_value * obj.quantity
			}

			//discount calculation
			discount = +(discount +(net_value * obj.quantity)) - parseFloat(val1)
			total_net = +(total_net + net_value * obj.quantity);
			total_vat = +(total_vat + val);
			obj.vatAmount = val
			obj.subTotal =
			net_value && obj.vatCategoryId ? parseFloat(val1) + parseFloat(val) : 0;
			total_excise = +(total_excise + obj.exciseAmount)
			total = total_vat + total_net;
			return obj;
		});

		// const discount =
		// 	props.values.discountType.value === 'PERCENTAGE'
		// 		? +((total_net * discountPercentage) / 100)
		// 		: discountAmount;
		this.setState(
			{
				data,
				initValue: {
					...this.state.initValue,
					...{
						total_net: discount ? total_net - discount : total_net,
						invoiceVATAmount: total_vat,
						discount:  discount ? discount : 0,
						totalAmount: total_net > discount ? total - discount : total - discount,
						total_excise: total_excise
					},

				},
			},

		);
	};

	handleFileChange = (e, props) => {
		e.preventDefault();
		let reader = new FileReader();
		let file = e.target.files[0];
		if (file) {
			reader.onloadend = () => { };
			reader.readAsDataURL(file);
			props.setFieldValue('attachmentFile', file, true);
		}
	};

	handleSubmit = (data, resetForm) => {
		
		this.setState({ disabled: true });
		const {
			receiptAttachmentDescription,
			receiptNumber,
			contact_po_number,
			currency,
			invoiceNumber,
			// exchangeRate,
			// invoiceDueDate,
			creditNoteDate,
			contactId,
			creditNoteNumber,
			discount,
			discountType,
			discountPercentage,
			notes,
			email,
			creditAmount
		} = data;
		const { term } = this.state;
		const formData = new FormData();

		formData.append('isCreatedWithoutInvoice',this.state.isCreatedWIWP);
		


			// formData.append('invoiceNumber',this.state.referenceNumber !== null ? this.state.selectedData.referenceNumber : '');

		formData.append(
			'creditNoteNumber',
			creditNoteNumber !== null ? this.state.prefix + creditNoteNumber : '',
		);
		formData.append(
			'email',
			email !== null ? email : '',
		);
		// formData.append(
		// 	'invoiceDueDate',
		// 	invoiceDueDate ? moment(invoiceDueDate, 'DD-MM-YYYY').toDate() : null,
		// );
		formData.append(
			'creditNoteDate',
			creditNoteDate
				?
						moment(creditNoteDate,'DD-MM-YYYY')
						.toDate()
				: null,
		);
		formData.append(
			'receiptNumber',
			receiptNumber !== null ? receiptNumber : '',
		);
		// formData.append(
		// 	'exchangeRate',
		// 	exchangeRate !== null ? exchangeRate : '',
		// );
		formData.append(
			'contactPoNumber',
			contact_po_number !== null ? contact_po_number : '',
		);
		formData.append(
			'receiptAttachmentDescription',
			receiptAttachmentDescription !== null ? receiptAttachmentDescription : '',
		);
		formData.append('notes', notes !== null ? notes : '');
		formData.append('email', email !== null ? email : '');
		formData.append('type', 7);
		if(this.state.isCreatedWIWP ===true)
		formData.append('totalAmount', creditAmount);

if (invoiceNumber && invoiceNumber.value) {
	formData.append('invoiceId', invoiceNumber.value);
	formData.append('cnCreatedOnPaidInvoice','1');
	}	
		if(this.state.isCreatedWIWP ===false)
		{
							
				formData.append('lineItemsString', JSON.stringify(this.state.data));
				formData.append('totalVatAmount', this.state.initValue.totalVatAmount);
				formData.append('totalAmount', this.state.initValue.totalAmount);
				formData.append('discount', this.state.initValue.discount);
				
				formData.append('totalExciseTaxAmount', this.state.initValue.total_excise);
		}
		// if (term && term.value) {
		// 	formData.append('term', term.value);
		// }
	
		if (contactId && contactId.value) {
			formData.append('contactId', contactId.value);
		}
		// if (placeOfSupplyId && placeOfSupplyId.value) {
		// 	formData.append('placeOfSupplyId', placeOfSupplyId.value);
		// }
		if (currency !== null && currency) {
			formData.append('currencyCode', this.state.customer_currency);
		}
		// if (project !== null && project.value) {
		// 	formData.append('projectId', project.value);
		// }
		if (this.uploadFile && this.uploadFile.files && this.uploadFile.files[0]) {
			formData.append('attachmentFile', this.uploadFile.files[0]);
		}
	
		this.props.creditNotesCreateActions
			.createCreditNote(formData)
			.then((res) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'success',
					res.data ? res.data.message :'New Tax Credit Note Created Successfully.'
				);
				if (this.state.createMore) {
					this.setState(
						{
							createMore: false,
							selectedContact: '',
							term: '',
							exchangeRate:'',
							data: [
								{
									id: 0,
									description: '',
									quantity: 1,
									unitPrice: '',
									vatCategoryId: '',
									subTotal: 0,
									productId: '',
								},
							],
							initValue: {
								...this.state.initValue,
								...{
									total_net: 0,
									totalVatAmount: 0,
									totalAmount: 0,
									discountType: '',
									discount: 0,
									discountPercentage: '',
								},
							},
						},
						() => {
							resetForm(this.state.initValue);
							this.getInvoiceNo();
							this.formRef.current.setFieldValue(
								'lineItemsString',
								this.state.data,
								false,
							);
						},
					);
				} else {
					this.props.history.push('/admin/income/credit-notes');
				}
			})
			.catch((err) => {
				this.setState({ disabled: false });
				this.props.commonActions.tostifyAlert(
					'error',
					err && err.data ? err.data.message : 'New Tax Credit Note Created Unsuccessfully.',
				);
			});
	};
	openInvoiceNumberModel = (props) => {
		this.setState({ openInvoiceNumberModel : true });
	};
	openCustomerModal = (props) => {
		this.setState({ openCustomerModal: true });
	};
	openProductModal = (props) => {
		this.setState({ openProductModal: true });
	};
	openMultiSupplierProductModal = (props) => {
		this.setState({ openMultiSupplierProductModal: true });
	};
	closeMultiSupplierProductModal = (props) => {
		this.setState({ openMultiSupplierProductModal: false });
	};

	openInvoicePreviewModal = (props) => {
		this.setState({ openInvoicePreviewModal: true });
	};

	// getCurrentUser = (data) => {
	// 	let option;
	// 	console.log('data', data)
	// 	if (data.label || data.value) {
	// 		option = data;
	// 	} else {
	// 		option = {
	// 			label: `${data.fullName}`,
	// 			value: data.id,
	// 		};
	// 	}
	// 	this.formRef.current.setFieldValue('contactId', option, true);
	// };
	
	getCurrentUser = (data) => {
		let option;
		if (data.label || data.value) {
			option = data;
		} else {
			option = {
				label: `${data.fullName}`,
				value: data.id,
			};
		}
		
		let result = this.props.currency_convert_list.filter((obj) => {
			return obj.currencyCode === data.currencyCode;
		});
		
	    this.formRef.current.setFieldValue('currency', result[0].currencyCode, true);
		this.formRef.current.setFieldValue('exchangeRate', result[0].exchangeRate, true);
		
		this.setState({
			customer_currency: data.currencyCode,
			customer_currency_des: result[0].currencyName,
		})
		
		// this.setState({
			//   selectedContact: option
			// })
			console.log('data11', option)
		this.formRef.current.setFieldValue('contactId', option, true);
	};

	getCurrentNumber = (data) => {
		this.getInvoiceNo();
	};

	getCurrentProduct = () => {
		this.props.creditNotesActions.getProductList().then((res) => {
			this.setState(
				{
					data: [
						{
							id: 0,
							discount:0,
							description: res.data[0].description,
							quantity: 1,
							unitPrice: res.data[0].unitPrice,
							vatCategoryId: res.data[0].vatCategoryId,
							subTotal: res.data[0].unitPrice,
							productId: res.data[0].id,
							discountType: res.data[0].discountType,
							exciseTaxId: res.data[0].exciseTaxId,
						},
					],
				},
				() => {
					const values = {
						values: this.state.initValue,
					};
					this.updateAmount(this.state.data, values);
				},
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.unitPrice`,
				res.data[0].unitPrice,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.quantity`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.vatCategoryId`,
				res.data[0].vatCategoryId,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.productId`,
				res.data[0].id,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.discountType`,
				1,
				true,
			);
			this.formRef.current.setFieldValue(
				`lineItemsString.${0}.exciseTaxId`,
				1,
				true,
			);
		});
	};

	closeCustomerModal = (res) => {
		this.setState({ openCustomerModal: false });
	};
	closeInvoiceNumberModel = (res) => {
		this.setState({ openInvoiceNumberModel: false });
	};
	closeProductModal = (res) => {
		this.setState({ openProductModal: false });
	};

	closeInvoicePreviewModal = (res) => {
		this.setState({ openInvoicePreviewModal: false });
	};

	getInvoiceNo = () => {
		this.props.creditNotesCreateActions.getInvoiceNo().then((res) => {
			if (res.status === 200) {
				this.setState({
					initValue: {
						...this.state.initValue,
						...{ creditNoteNumber: res.data },
					},
				});
				this.formRef.current.setFieldValue('creditNoteNumber', res.data, true,this.validationCheck(res.data));
			}
		});
	};

	getCurrency = (opt) => {
		let customer_currencyCode = 0;
		let customer_item_currency = ''
		this.props.customer_list.map(item => {
			if(item.label.contactId == opt) {
				this.setState({
					customer_currency: item.label.currency.currencyCode,
					customer_currency_des: item.label.currency.currencyName,
					customer_currency_symbol: item.label.currency.currencyIsoCode,
				});

				customer_currencyCode = item.label.currency.currencyCode;
				customer_item_currency = item.label.currency
			}
		})
	
		return customer_currencyCode;
	}
	getTaxTreatment= (opt) => {
		
		let customer_taxTreatmentId = 0;
		let customer_item_taxTreatment = ''
		this.props.customer_list.map(item => {
			if(item.label.contactId == opt) {
				this.setState({
					customer_taxTreatment: item.label.taxTreatment.id,
					customer_taxTreatment_des: item.label.taxTreatment.taxTreatment,
					// customer_currency_symbol: item.label.currency.currencyIsoCode,
				});

				customer_taxTreatmentId = item.label.taxTreatment.id;
				customer_item_taxTreatment = item.label.currency
			}
		})
	
		return customer_taxTreatmentId;
	}

	invoiceValue = (e, row, name, form, field, props) => {
		const { invoice_list } = this.props;
		let data = this.state.data;
		const result = invoice_list.data.find((item) => item.id === parseInt(e));
		let idx;
		data.map((obj, index) => {
			if (obj.id === row.id) {
				console.log(result);
				obj['unitPrice'] = result.unitPrice;
				obj['vatCategoryId'] = result.vatCategoryId;
				obj['description'] = result.description;
				idx = index;
			}
			return obj;
		});

		this.updateAmount(data, props);
	};

	getInvoiceDetails = (e, row, props,form,field) => {
		let option;
		const { invoice_list,selectedData } = this.props;
			let idx;
			this.state.data.map((obj, index) => {
				if (obj.id === row.id) {
					idx = index;
				}
				return obj;
			});
		if (e && e.label !== 'Select invoiceNumber') {
	
			this.invoiceValue(
				e.value,
				row,
				'invoiceNumber',
				form,
				field,
				props,
			);
			this.props.creditNotesCreateActions
			.getInvoiceById(e.value).then((response) => {
				this.setState(
					{
						option : {
							label: response.data.organisationName === '' ?  response.data.name : response.data.organisationName,
							value: response.data.contactId,
						},
					data:response.data.invoiceLineItems ,
					totalAmount:response.data.totalAmount,
					customer_currency:response.data.currencyCode,
					remainingInvoiceAmount:response.data.remainingInvoiceAmount,
				
					initValue: {
						...this.state.initValue,
						...{
							totalVatAmount: response.data.totalVatAmount,
							totalAmount: response.data.totalAmount,
							total_net: response.data.totalAmount -response.data.totalVatAmount ,
							discount:response.data.discount,
							total_excise:response.data.totalExciseAmount,
						},
					},
	
				//	data1:response.data.supplierId,
				},() => {
					this.formRef.current.setFieldValue(
						'lineItemsString',
						this.state.data,
						true,
					);
					this.formRef.current.setFieldTouched(
						`lineItemsString[${this.state.data.length - 1}]`,
						false,
						true,
					);
					// this.formRef.current.setFieldValue(
						
					// 	totalAmount,
					// 	true,
					// );
				},
				// () => {
				// 	this.formRef.current.setFieldValue('supplierId',
				// 	this.state.option.value,
				// 	true,)
				// },
	
				);
				this.formRef.current.setFieldValue('contactId', this.state.option, true);
				this.formRef.current.setFieldValue('remainingInvoiceAmount', this.state.remainingInvoiceAmount, true);
				
				this.formRef.current.setFieldValue('currencyCode', this.state.customer_currency, true);
				this.getCurrency(this.state.option.value)	
				this.getTaxTreatment(this.state.option.value)	
				console.log(this.state.data,"api")
				console.log("option ",this.state.option)
				console.log(this.state.initValue.totalAmount,"this.state.initValue.totalAmount+++++++")
				console.log(this.state.initValue.totalVatAmount,"this.state.initValue.totalVatAmount+++++++")
			});
		}
	}
	
	
	render() {
		strings.setLanguage(this.state.language);
		const { data, discountOptions, initValue, exist, prefix } = this.state;
		const {
			customer_list,
			invoice_list,
			universal_currency_list,
			currency_convert_list,
		} = this.props;

		
		let tmpCustomer_list = []

		customer_list.map(item => {
			let obj = {label: item.label.contactName, value: item.value}
			tmpCustomer_list.push(obj)
		})

		return (
			<div className="create-customer-invoice-screen">
				<div className="animated fadeIn">
					<Row>
						<Col lg={12} className="mx-auto">
							<Card>
								<CardHeader>
									<Row>
										<Col lg={12}>
											<div className="h4 mb-0 d-flex align-items-center">
												<img
													alt="invoiceimage"
													src={invoiceimage}
													style={{ width: '40px' }}
												/>
												<span className="ml-2">{strings.CreateCreditNote}</span>
											</div>
										</Col>
									</Row>
								</CardHeader>
								<CardBody>
									<Row>
										<Col lg={12}>
											<Formik
												initialValues={initValue}
												ref={this.formRef}
												onSubmit={(values, { resetForm }) => {
													this.handleSubmit(values, resetForm);
												}}
												validate={(values) => {
													let errors = {};
													 
													if (exist === true) 
													{
														errors.creditNoteNumber ='Tax Credit Note Number cannot be same';
													}	
													
													if(this.state.isCreatedWIWP==false && !values.invoiceNumber)
													{
														errors.invoiceNumber =	'Invoice Number is Required';}
													if(this.state.isCreatedWIWP==true && this.state.invoiceSelected ==true && !values.creditAmount)
														{
															errors.creditAmount =	'Credit Amount is Required';}
													// if(this.state.invoiceSelected && this.state.initValue.totalAmount>this.state.remainingInvoiceAmount)
													// {
													// 	errors.remainingInvoiceAmount =	'Invoice Total Amount Cannot be greater than  Remaining Invoice Amount';
													// }	
													// if(this.state.remainingInvoiceAmount && values.creditAmount<this.state.remainingInvoiceAmount)		
													// {
													// 	errors.creditAmount = 'Credit Amount Cannot be less than Remaining Invoice Amount';
													// }														
													return errors;
												}}
												validationSchema={Yup.object().shape({
													// invoiceNumber: Yup.string().required(
													// 	'Invoice Number is Required',
													// ),
													creditNoteNumber: Yup.string().required(
														'Tax Credit Note Number is Required',
													),
													contactId: Yup.string().required(
															'Customer Name is Required',
														),
													// contactId: Yup.string().required(
													// 	'Customer is Required',
													// ),
													// placeOfSupplyId: Yup.string().required('Place of supply is Required'),
													// term: Yup.string().required('Term is Required'),
													// currency: Yup.string().required(
													// 	'Currency is Required',
													// ),
													creditNoteDate: Yup.string().required(
														'Tax Credit Note Date is Required',
													),
													// lineItemsString: Yup.array()
													// 	.required(
													// 		'Atleast one Tax Credit Note sub detail is mandatory',
													// 	)
													// 	.of(
													// 		Yup.object().shape({
													// 			quantity: Yup.string()
													// 				.required('Value is Required')
													// 				.test(
													// 					'quantity',
													// 					'Quantity should be greater than 0',
													// 					(value) => {
													// 						if (value > 0) {
													// 							return true;
													// 						} else {
													// 							return false;
													// 						}
													// 					},
													// 				),
													// 			unitPrice: Yup.string()
													// 				.required('Value is Required')
													// 				.test(
													// 					'Unit Price',
													// 					'Unit Price Should be Greater than 1',
													// 					(value) => {
													// 						if (value > 0) {
													// 							return true;
													// 						} else {
													// 							return false;
													// 						}
													// 					},
													// 				),
													// 			vatCategoryId: Yup.string().required(
													// 				'Value is Required',
													// 			),
													// 			productId: Yup.string().required(
													// 				'Product is Required',
													// 			),
													// 		}),
													// 	),
													attachmentFile: Yup.mixed()
														.test(
															'fileType',
															'*Unsupported File Format',
															(value) => {
																value &&
																	this.setState({
																		fileName: value.name,
																	});
																if (
																	!value ||
																	(value &&
																		this.supported_format.includes(value.type))
																) {
																	return true;
																} else {
																	return false;
																}
															},
														)
														.test(
															'fileSize',
															'*File Size is too large',
															(value) => {
																if (
																	!value ||
																	(value && value.size <= this.file_size)
																) {
																	return true;
																} else {
																	return false;
																}
															},
														),
												})}
											>
												{(props) => (
													<Form onSubmit={props.handleSubmit}>

																<Row  style={{display:this.state.invoiceSelected===true ? '':'none'}}>
																			<Col lg={4}>
																				<Checkbox 
																				checked={this.state.isCreatedWIWP}
																				onChange={(check)=>{
																					this.setState({isCreatedWIWP:!this.state.isCreatedWIWP})
																				}}
																				/>	Create Credit Note Without Product 
																				</Col>
																				</Row>
																{this.state.invoiceSelected==false &&(<Row  >
																			<Col lg={4}>
																				<Checkbox 
																				checked={this.state.isCreatedWithoutInvoice}
																				onChange={(check)=>{
																					this.setState({isCreatedWithoutInvoice:!this.state.isCreatedWithoutInvoice})
																					this.setState({isCreatedWIWP:!this.state.isCreatedWIWP})
																				}}
																				/>	Create Credit Note Without Invoice
																				</Col>
																				</Row>)}
																				<hr />

														<Row>
														{this.state.isCreatedWithoutInvoice===false &&(<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="invoiceNumber"><span className="text-danger">* </span>
																	{strings.InvoiceNumber}
																	</Label>
																	<Select
																		id="invoiceNumber"
																		name="invoiceNumber"
																		placeholder={strings.Select+strings.InvoiceNumber}
																		options={
																			invoice_list.data
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						invoice_list.data,
																						'Invoice Number',
																				  )
																				: []
																		}
																		value={props.values.invoiceNumber}

																		onChange={(option) => {
																			if (option && option.value) {
																				 this.getInvoiceDetails(option, option.value, props)
																				 props.handleChange('invoiceNumber')(option);
																				this.setState({invoiceSelected :true})
																			} else {
																				this.setState({invoiceSelected :false})
																				props.handleChange('invoiceNumber')('');
																			}

																				// if(!this.state.data1){
																				// 	this.state.supplierList = this.state.data1
																				// }else{
																				// 	this.state.supplierList =	props.values.supplierId
																				// }

																		}}
                                                                        // onChange={() => {
                                                                        //     this.getrfqDetails
                                                                        // }}
																		className={
																			props.errors.invoiceNumber &&
																			props.touched.invoiceNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.invoiceNumber &&
																		props.touched.invoiceNumber && (
																			<div className="invalid-feedback">
																				{props.errors.invoiceNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>)}

														</Row>
														<Row>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="creditNoteNumber">
																		<span className="text-danger">* </span>
																		 {strings.CreditNoteNumber}
																	</Label>
																	<Input
																		maxLength="50"
																		type="text"
																		id="creditNoteNumber"
																		name="creditNoteNumber"
																		placeholder={strings.CreditNoteNumber}
																		value={props.values.creditNoteNumber}
																		onBlur={props.handleBlur('creditNoteNumber')}
																		onChange={(option) => {
																			props.handleChange('creditNoteNumber')(
																				option,
																			);
																			this.validationCheck(option.target.value);
																		}}
																		className={
																			props.errors.creditNoteNumber &&
																			props.touched.creditNoteNumber
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.creditNoteNumber &&
																		props.touched.creditNoteNumber && (
																			<div className="invalid-feedback">
																				{props.errors.creditNoteNumber}
																			</div>
																		)}
																</FormGroup>
															</Col>
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="contactId">
																		<span className="text-danger">* </span>
																		 {strings.CustomerName}
																	</Label>
																	<Select
																		id="contactId"
																		name="contactId"
																		placeholder={strings.Select+strings.CustomerName}
																		options={
																			tmpCustomer_list
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						tmpCustomer_list,
																						'Customer',
																				  )
																				: []
																		}
																		value={props.values.contactId}
																		
																		// isDisabled={this.state.invoiceSelected}
																		onChange={(option) => {
																			if (option && option.value) {
																				this.formRef.current.setFieldValue('currency', this.getCurrency(option.value), true);
																				this.formRef.current.setFieldValue('taxTreatmentid', this.getTaxTreatment(option.value), true);
																				// this.setExchange( this.getCurrency(option.value) );
																				props.handleChange('contactId')(option);
																			} else {
																				props.handleChange('contactId')('');
																			}
																		}}
																		className={
																			props.errors.contactId &&
																			props.touched.contactId
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.contactId &&
																		props.touched.contactId && (
																			<div className="invalid-feedback">
																				{props.errors.contactId}
																			</div>
																		)}
																</FormGroup>
															</Col>
															
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="taxTreatmentid">
																		Tax Treatment
																	</Label>
																	<Input
																	disabled
																		styles={customStyles}
																		id="taxTreatmentid"
																		name="taxTreatmentid"
																		placeholder='Tax Treatment'
																		value={
																		this.state.customer_taxTreatment_des
																	 	
																		}
																		className={
																			props.errors.taxTreatmentid &&
																			props.touched.taxTreatmentid
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																		props.handleChange('taxTreatmentid')(option);
																		
																	    }}

																	/>
																	{props.errors.taxTreatmentid &&
																		props.touched.taxTreatmentid && (
																			<div className="invalid-feedback">
																				{props.errors.taxTreatmentid}
																			</div>
																		)}
																</FormGroup>
															</Col>

															{/* <Col>
																<Label
																	htmlFor="contactId"
																	style={{ display: 'block' }}
																>
																	 {strings.AddNewCustomer}
																</Label>
																<Button
																	type="button"
																	color="primary"
																	className="btn-square mr-3 mb-3"
																	onClick={(e, props) => {
																		this.openCustomerModal(props);
																	}}
																>
																	<i className="fa fa-plus"></i> {strings.AddACustomer}
																</Button>
															</Col> */}
															{/* <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="placeOfSupplyId">
																		<span className="text-danger">*</span>
																		Place of Supply
																	</Label>
																	<Select
																		styles={customStyles}
																		id="placeOfSupplyId"
																		name="placeOfSupplyId"
																		placeholder="Select Place of Supply"
																		options={
																			this.placelist
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						this.placelist,
																						'Place of Supply',
																						
																				  )
																				: []
																		}
																		value={this.state.placelist}
																		className={
																			props.errors.placeOfSupplyId &&
																			props.touched.placeOfSupplyId
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) =>
																			props.handleChange('placeOfSupplyId')(
																				option,
																			)
																		}
																	/>
																	{props.errors.placeOfSupplyId &&
																		props.touched.placeOfSupplyId && (
																			<div className="invalid-feedback">
																				{props.errors.placeOfSupplyId}
																			</div>
																		)}
																</FormGroup>
															</Col> */}
														</Row>
														<hr />
														<Row>
															{/* <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="term">
																		<span className="text-danger">*</span>Terms{' '}
																		<i
																			id="UncontrolledTooltipExample"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="UncontrolledTooltipExample"
																		>
																			<p>
																				{' '}
																				Terms- The duration given to a buyer for
																				payment.
																			</p>

																			<p>
																				Net 7 – payment due in 7 days from
																				invoice date{' '}
																			</p>

																			<p>
																				{' '}
																				Net 10 – payment due in 10 days from
																				invoice date{' '}
																			</p>

																			<p>
																				{' '}
																				Net 30 – payment due in 30 days from
																				invoice date{' '}
																			</p>
																		</UncontrolledTooltip>
																	</Label>
																	<Select
																		styles={customStyles}
																		options={
																			this.termList
																				? selectOptionsFactory.renderOptions(
																						'label',
																						'value',
																						this.termList,
																						'Terms',
																				  )
																				: []
																		}
																		id="term"
																		name="term"
																		placeholder="Select Terms "
																		value={this.state.term}
																		onChange={(option) => {
																			props.handleChange('term')(option);
																			if (option.value === '') {
																				this.setState({
																					term: option,
																				});
																				props.setFieldValue(
																					'invoiceDueDate',
																					'',
																				);
																			} else {
																				this.setState(
																					{
																						term: option,
																					},
																					() => {
																						this.setDate(props, '');
																					},
																				);
																			}
																		}}
																		className={`${
																			props.errors.term && props.touched.term
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.term && props.touched.term && (
																		<div className="invalid-feedback">
																			{props.errors.term}
																		</div>
																	)}
																</FormGroup>
															</Col> */}
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="date">
																		<span className="text-danger">* </span>
																		 {strings.CreditNoteDate}
																	</Label>
																	<DatePicker
																		id="creditNoteDate"
																		name="creditNoteDate"
																		placeholderText={strings.CreditNoteDate}
																		showMonthDropdown
																		showYearDropdown
																		dateFormat="dd-MM-yyyy"
																		dropdownMode="select"
																		value={props.values.creditNoteDate}
																		selected={props.values.creditNoteDate}
																		onChange={(value) => {
																			props.handleChange('creditNoteDate')(value);
																			this.setDate(props, value);
																		}}
																		className={`form-control ${props.errors.creditNoteDate &&
																				props.touched.creditNoteDate
																				? 'is-invalid'
																				: ''
																		}`}
																	/>
																	{props.errors.creditNoteDate &&
																		props.touched.creditNoteDate && (
																			<div className="invalid-feedback">
																				{props.errors.creditNoteDate.includes("nullable()") ? "Tax Credit Note Date is Required" :props.errors.creditNoteDate}		
																			</div>
																		)}
																</FormGroup>
															</Col>
															{/* <Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="due_date">
																		Invoice Due Date
																	</Label>
																	<div>
																		<DatePicker
																			className="form-control"
																			id="invoiceDueDate"
																			name="invoiceDueDate"
																			placeholderText="Invoice Due Date"
																			showMonthDropdown
																			showYearDropdown
																			disabled
																			dateFormat="dd-MM-yyyy"
																			dropdownMode="select"
																			value={props.values.invoiceDueDate}
																			onChange={(value) => {
																				props.handleChange('invoiceDueDate')(
																					value,
																				);
																			}}
																			// className={`form-control ${props.errors.invoiceDueDate && props.touched.invoiceDueDate ? "is-invalid" : ""}`}
																		/>
																		
																	</div>
																</FormGroup>
															</Col> */}
															<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="currency">
																		<span className="text-danger">* </span>
																		 {strings.Currency}
																	</Label>
																	<Select
																	isDisabled={true}
																		styles={customStyles}
																		placeholder={strings.Select+strings.Currency}
																		options={
																			currency_convert_list
																				? selectCurrencyFactory.renderOptions(
																					'currencyName',
																					'currencyCode',
																					currency_convert_list,
																					'Currency',
																				)
																				: []
																		}
																		id="currency"
																		name="currency"
																		value={
																	 	currency_convert_list &&
																			selectCurrencyFactory
																			.renderOptions(
																					'currencyName',
																		 			'currencyCode',
																					currency_convert_list,
																		 			'Currency',
																				)
																		 		.find(
																					(option) =>
																		 				option.value ===
																	 				+this.state.customer_currency,
																	 		)
																		}
																		className={
																			props.errors.currency &&
																			props.touched.currency
																				? 'is-invalid'
																				: ''
																		}
																		onChange={(option) => {
																		props.handleChange('currency')(option);
																		// this.setExchange(option.value);
																		this.setCurrency(option.value)
																	    }}

																	/>
																	{props.errors.currency &&
																		props.touched.currency && (
																			<div className="invalid-feedback">
																				{props.errors.currency}
																			</div>
																		)}
																</FormGroup>
															</Col>
															
															{(this.state.isCreatedWIWP===false || this.state.invoiceSelected==true) &&(<Col lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="remainingInvoiceAmount">
																
																	Remaining Invoice Amount
																	</Label>
																	<Input
																		type="text"
																		id="remainingInvoiceAmount"
																		name="remainingInvoiceAmount"
																		placeholder='Remaining invoice Amount'
																		disabled={true}
																		value={this.state.remainingInvoiceAmount}																							
																	/>
																	{props.errors.remainingInvoiceAmount &&
																	 (
																			<div className="text-danger">
																				{props.errors.remainingInvoiceAmount}
																			</div>
																		)}
																</FormGroup>
															</Col>)}
                                                            
															{this.state.isCreatedWIWP===true &&(<Col  lg={3}>
																<FormGroup className="mb-3">
																	<Label htmlFor="creditAmount"><span className="text-danger">* </span>
																	Credit Amount
																	</Label>
																	<Input
																		type="text"
																		id="creditAmount"
																		name="creditAmount"
																		placeholder={strings.Enter+" Credit Amount"}																		
																		value={this.state.creditAmount}
																		// onBlur={props.handleBlur('currencyCode')}
																		onChange={(value) => {
																			props.handleChange('creditAmount')(
																				value,
																			);
																		}}
																		className={
																			props.errors.creditAmount &&
																			props.touched.creditAmount
																				? 'is-invalid'
																				: ''
																		}
																	/>
																	{props.errors.creditAmount &&
																	 (
																			<div className="invalid-feedback">
																				{props.errors.creditAmount}
																			</div>
																		)}
																</FormGroup>
															</Col>)}

															{/* <Col lg={3}>
												<FormGroup>
													<Label htmlFor="email">
														{strings.SalesPerson}
													</Label>
													<Input
														type="text"
														maxLength="80"
														id="email"
														name="email"
														onChange={(value) => {
															props.handleChange('email')(value);
														}}
														value={props.values.email}
														className={
															props.errors.email && props.touched.email
																? 'is-invalid'
																: ''
														}
														placeholder="Enter email"
													/>
													{props.errors.email && props.touched.email && (
														<div className="invalid-feedback">
															{props.errors.email}
														</div>
													)}
												</FormGroup>
											</Col> */}
														</Row>
														<hr />
																{/* <Row style={{display: props.values.exchangeRate === 1 ? 'none' : ''}}>
																<Col>
																<Label >
																		Currency Exchange Rate
																	</Label>	
																</Col>
																</Row>
																
																<Row style={{display: props.values.exchangeRate === 1 ? 'none' : ''}}>
																<Col md={1}>
																<Input
																		disabled
																				id="1"
																				name="1"
																				value=	{
																					1 }
																				
																			/>
																</Col>
																<Col md={2}>
																<FormGroup className="mb-3">
																
																	<div>
																		<Input
																		disabled	
																			className="form-control"
																			id="curreancyname"
																			name="curreancyname"
																			
																			value={this.state.customer_currency_des}
																			onChange={(value) => {
																				props.handleChange('curreancyname')(
																					value,
																				);
																			}}
																		/>
																	</div>
																</FormGroup>
															</Col>
															<FormGroup className="mt-2"><label><b>=</b></label>	</FormGroup>
															<Col lg={2}>
																<FormGroup className="mb-3">
																
																	<div>
																		<Input
																			type="number"
min="0"
																			className="form-control"
																			id="exchangeRate"
																			name="exchangeRate"
																			
																			value={props.values.exchangeRate}
																			onChange={(value) => {
																				props.handleChange('exchangeRate')(
																					value,
																				);
																			}}
																		/>
																	</div>
																</FormGroup>
															</Col>
															<Col md={2}>
															<Input
																		disabled
																				id="currencyName"
																				name="currencyName"
																				value=	{
																					this.state.basecurrency.currencyName }
																				
																			/>
														</Col>
														</Row> */}
													
														{/* <Col lg={8} className="mb-3">
															<Button
																color="primary"
																className={`btn-square mr-3 ${
																	this.checkedRow() ? `disabled-cursor` : ``
																} `}
																onClick={this.addRow}
																title={
																	this.checkedRow()
																		? `Please add detail to add more`
																		: ''
																}
																disabled={this.checkedRow() ? true : false}
															>
																<i className="fa fa-plus"></i> {strings.Addmore}
															</Button>
															<Button
																color="primary"
																className= "btn-square mr-3"
																onClick={(e, props) => {
																	this.openProductModal(props);
																	}}
																
															>
																<i className="fa fa-plus"></i> {strings.Addproduct}
															</Button>
														</Col> */}
														
													
														{this.state.isCreatedWIWP===false &&(<Row>
															{props.errors.lineItemsString &&
																typeof props.errors.lineItemsString ===
																	'string' && (
																	<div
																		className={
																			props.errors.lineItemsString
																				? 'is-invalid'
																				: ''
																		}
																	>
																		<div className="invalid-feedback">
																			{props.errors.lineItemsString}
																		</div>
																	</div>
																)}
															<Col lg={12}>
																<BootstrapTable
																	options={this.options}
																	data={data}
																	version="4"
																	hover
																	keyField="id"
																	className="invoice-create-table"
																>
																	<TableHeaderColumn
																		width="55"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderActions(cell, rows, props)
																		}
																	></TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="product"
																		width="20%"
																		dataFormat={(cell, rows) =>
																			this.renderProduct(cell, rows, props)
																		}
																	>
																		{strings.PRODUCT}
																	</TableHeaderColumn>
																	{/* <TableHeaderColumn
																		width="55"
																		dataAlign="center"
																		dataFormat={(cell, rows) =>
																			this.renderAddProduct(cell, rows, props)
																		}
																	></TableHeaderColumn> */}
																	<TableHeaderColumn
																		dataField="description"
																		dataFormat={(cell, rows) =>
																			this.renderDescription(cell, rows, props)
																		}
																	>
																		{strings.DESCRIPTION}
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="quantity"
																		dataFormat={(cell, rows) =>
																			this.renderQuantity(cell, rows, props)
																		}
																	>
																		{strings.QUANTITY}
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="unitPrice"
																		dataFormat={(cell, rows) =>
																			this.renderUnitPrice(cell, rows, props)
																		}
																	>
																		 {strings.UNITPRICE}
																		<i
																			id="UnitPriceTooltip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="UnitPriceTooltip"
																		>
																			Unit Price – Price of a single product or
																			service
																		</UncontrolledTooltip>
																	</TableHeaderColumn>
																	<TableHeaderColumn
																	width="10%"
																		dataField="exciseTaxId"
																		dataFormat={(cell, rows) =>
																			this.renderExcise(cell, rows, props)
																		}
																	>
																	Excise
																	<i
																			id="ExiseTooltip"
																			className="fa fa-question-circle ml-1"
																		></i>
																		<UncontrolledTooltip
																			placement="right"
																			target="ExiseTooltip"
																		>
																			If Exise Type for a product is Inclusive
																			then the Excise dropdown will be Disabled
																		</UncontrolledTooltip>
																	</TableHeaderColumn> 
																	<TableHeaderColumn
																		width="12%"
																		dataField="discount"
																		dataFormat={(cell, rows) =>
																			this.renderDiscount(cell, rows, props)
																		}
																	>
																	DisCount
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="vat"
																		dataFormat={(cell, rows) =>
																			this.renderVat(cell, rows, props)
																		}
																	>
																		{strings.VAT}
																	</TableHeaderColumn>
																	<TableHeaderColumn

																		dataField="vat_amount"
																		dataFormat={this.renderVatAmount}
																		className="text-right"
																		columnClassName="text-right"
																		formatExtraData={universal_currency_list}
																	>
																		Vat amount
																	</TableHeaderColumn>
																	<TableHeaderColumn
																		dataField="sub_total"
																		dataFormat={this.renderSubTotal}
																		className="text-right"
																		columnClassName="text-right"
																		formatExtraData={universal_currency_list}
																	>
																		 {strings.SUBTOTAL}
																	</TableHeaderColumn>
																</BootstrapTable>
															</Col>
															</Row>)}
														{this.state.data.length > 0 ? (
															<Row>
																<Col lg={8}>
																	<FormGroup className="py-2">
																		<Label htmlFor="notes">{strings.Notes}</Label>
																		<Input
																			type="textarea"
																			maxLength="250"
																			name="notes"
																			id="notes"
																			rows="6"
																			placeholder={strings.Notes}
																			onChange={(option) =>
																				props.handleChange('notes')(option)
																			}
																			value={props.values.notes}
																		/>
																	</FormGroup>
																	<Row>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Label htmlFor="receiptNumber">
																					 {strings.ReceiptNumber}
																				</Label>
																				<Input
																					type="text"
																					maxLength="100"
																					id="receiptNumber"
																					name="receiptNumber"
																					value={props.values.receiptNumber}
																					placeholder={strings.ReceiptNumber}
																					onChange={(value) => {
																						props.handleChange('receiptNumber')(value);

																					}}
																					className={props.errors.receiptNumber && props.touched.receiptNumber ? "is-invalid" : " "}
																				/>
																				{props.errors.receiptNumber && props.touched.receiptNumber && (
																					<div className="invalid-feedback">{props.errors.receiptNumber}</div>
																				)}
																				{/* <Input
																					type="text"
																					maxLength="100"
																					id="receiptNumber"
																					name="receiptNumber"
																					placeholder={strings.ReceiptNumber}
																					onChange={(option) => {
																						if (
																							option.target.value === '' ||
																							this.regExBoth.test(
																								option.target.value,
																							)
																						) {
																							props.handleChange(
																								'receiptNumber',
																							)(option);
																						}
																					}}
																					value={props.values.receiptNumber}
																				/> */}
																			</FormGroup>
																		</Col>
																		<Col lg={6}>
																			<FormGroup className="mb-3">
																				<Field
																					name="attachmentFile"
																					render={({ field, form }) => (
																						<div>
																							<Label>{strings.ReceiptAttachment}</Label>{' '}
																							<br />
																							<Button
																								color="primary"
																								onClick={() => {
																									document
																										.getElementById('fileInput')
																										.click();
																								}}
																								className="btn-square mr-3"
																							>
																								<i className="fa fa-upload"></i>{' '}
																								{strings.upload}
																							</Button>
																							<input
																								id="fileInput"
																								ref={(ref) => {
																									this.uploadFile = ref;
																								}}
																								type="file"
																								style={{ display: 'none' }}
																								onChange={(e) => {
																									this.handleFileChange(
																										e,
																										props,
																									);
																								}}
																							/>
																							{this.state.fileName && (
																								<div>
																									<i
																										className="fa fa-close"
																										onClick={() =>
																											this.setState({
																												fileName: '',
																											})
																										}
																									></i>{' '}
																									{this.state.fileName}
																								</div>
																							)}
																						</div>
																					)}
																				/>
																				{props.errors.attachmentFile &&
																					props.touched.attachmentFile && (
																						<div className="invalid-file">
																							{props.errors.attachmentFile}
																						</div>
																					)}
																			</FormGroup>
																		</Col>
																	</Row>
																	<FormGroup className="mb-3">
																		<Label htmlFor="receiptAttachmentDescription">
																			 {strings.AttachmentDescription}
																		</Label>
																		<Input
																			type="textarea"
																			maxLength="250"
																			name="receiptAttachmentDescription"
																			id="receiptAttachmentDescription"
																			rows="5"
																			placeholder={strings.ReceiptAttachmentDescription}
																			onChange={(option) =>
																				props.handleChange(
																					'receiptAttachmentDescription',
																				)(option)
																			}
																			value={
																				props.values
																					.receiptAttachmentDescription
																			}
																		/>
																	</FormGroup>
																</Col>
																<Col lg={4}>
																{this.state.isCreatedWIWP===false &&(	<div className="">
																		<div className="total-item p-2">
																			{/* <Row>
																				<Col lg={6}>
																					<FormGroup>
																						<Label htmlFor="discountType">
																							 {strings.DiscountType}
																						</Label>
																						<Select
																							styles={customStyles}
																							className="select-default-width"
																							options={discountOptions}
																							id="discountType"
																							name="discountType"
																							value={props.values.discountType}
																							onChange={(item) => {
																								props.handleChange(
																									'discountType',
																								)(item);
																								props.handleChange(
																									'discountPercentage',
																								)('');
																								props.setFieldValue(
																									'discount',
																									0,
																								);
																								this.setState(
																									{
																										discountPercentage: '',
																										discountAmount: 0,
																									},
																									() => {
																										this.updateAmount(
																											this.state.data,
																											props,
																										);
																									},
																								);
																							}}
																						/>
																					</FormGroup>
																				</Col>
																				{props.values.discountType.value ===
																				'PERCENTAGE' ? (
																					<Col lg={6}>
																						<FormGroup>
																							<Label htmlFor="discountPercentage">
																							{strings.Percentage}
																							</Label>
																							<div className="discountPercent">
																							<Input
																								id="discountPercentage"
																								name="discountPercentage"
																								placeholder="Discount Percentage"
																								type="number"
min="0"
																								maxLength="5"
																								value={
																									props.values
																										.discountPercentage
																							}
																								onChange={(e) => {
																									if (
																										e.target.value === '' ||
																										this.regDecimal.test(
																											e.target.value,
																										)
																									) {
																										props.handleChange(
																											'discountPercentage',
																										)(e);
																										this.setState(
																											{
																												discountPercentage:
																													e.target.value,
																											},
																											() => {
																												this.updateAmount(
																													this.state.data,
																													props,
																												);
																											},
																										);
																									}
																								}}
																							/> <span className = "percentSymbol">%</span></div>
																						
																						</FormGroup>
																					</Col>
																				) : null}
																			</Row> */}
																			{/* <Row>
																				<Col lg={6} className="mt-4">
																					<FormGroup>
																						<Label htmlFor="discount">
																							 {strings.DiscountAmount}
																						</Label>
																						<Input
																							id="discount"
																							type="number"
min="0"
																							name="discount"
																							maxLength="10"
																							
																							disabled={
																								props.values.discountType &&
																								props.values.discountType
																									.value === 'Percentage'
																									? true
																									: false
																							}
																							placeholder="Discount Amounts"
																							value={props.values.discount}
																							onChange={(option) => {
																								if (
																									option.target.value === '' ||
																									this.regDecimal.test(
																										option.target.value,
																									)
																								) {
																									props.handleChange(
																										'discount',
																									)(option);
																									this.setState(
																										{
																											discountAmount: +option
																												.target.value,
																										},
																										() => {
																											this.updateAmount(
																												this.state.data,
																												props,
																											);
																										},
																									);
																								}
																							}}
																						/>
																					</FormGroup>
																				</Col>
																			</Row> */}
																		</div>
																		<div className="total-item p-2" >
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																					Total Excise
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">

																						{this.state.customer_currency_symbol} &nbsp;
																						{initValue.total_excise.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
																			<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						 {strings.Discount}
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																				
																						{this.state.customer_currency_symbol} &nbsp;
																							{initValue.discount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																					
																					</label>
																				</Col>
																			</Row>
																		</div>
																		
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						 {strings.TotalNet}
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																					{/* {universal_currency_list[0] && (
																						<Currency
																					value={initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																						currencySymbol={this.state.customer_currency_IsoCode
																							}
																							/>
																							)} */}
																							{this.state.customer_currency_symbol} &nbsp;
																							{initValue.total_net.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																					
																					</label>
																				</Col>
																			</Row>
																		</div>
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																					{strings.TotalVat}
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																					{/* {universal_currency_list[0] && (
																						<Currency
																						value={initValue.totalVatAmount.toFixed(
																									2,
																							)}
																							currencySymbol={this.state.customer_currency_IsoCode}
																							/>
																							)} */}
																							{this.state.customer_currency_symbol} &nbsp;
																							{initValue.totalVatAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
																	
																		<div className="total-item p-2">
																			<Row>
																				<Col lg={6}>
																					<h5 className="mb-0 text-right">
																						 {strings.Total}
																					</h5>
																				</Col>
																				<Col lg={6} className="text-right">
																					<label className="mb-0">
																					{this.state.customer_currency_symbol} &nbsp;
																							{initValue.totalAmount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
																					</label>
																				</Col>
																			</Row>
																		</div>
																	</div>)}
																</Col>
															</Row>
														) : null}
														<Row>
															<Col
																lg={12}
																className="mt-5 d-flex flex-wrap align-items-center justify-content-between"
															>
																<FormGroup className="text-right w-100">
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			this.setState(
																				{ createMore: false },
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-dot-circle-o"></i>{' '}
																		{this.state.disabled
																			? 'Creating...'
																			: strings.Create}
																	</Button>
																	<Button
																		type="button"
																		color="primary"
																		className="btn-square mr-3"
																		disabled={this.state.disabled}
																		onClick={() => {
																			this.setState(
																				{
																					createMore: true,
																				},
																				() => {
																					props.handleSubmit();
																				},
																			);
																		}}
																	>
																		<i className="fa fa-repeat"></i>{' '}
																		{this.state.disabled
																			? 'Creating...'
																			: strings.CreateandMore}
																	</Button>
																	<Button
																		color="secondary"
																		className="btn-square"
																		onClick={() => {
																			this.props.history.push(
																				'/admin/income/credit-notes',
																			);
																		}}
																	>
																		<i className="fa fa-ban"></i> {strings.Cancel}
																	</Button>
																</FormGroup>
															</Col>
														</Row>
													</Form>
												)}
											</Formik>
										</Col>
									</Row>
								</CardBody>
							</Card>
						</Col>
					</Row>
				</div>
				<CustomerModal
					openCustomerModal={this.state.openCustomerModal}
					closeCustomerModal={(e) => {
						this.closeCustomerModal(e);
					}}
					getCurrentUser={(e) => this.getCurrentUser(e)}
					createCustomer={this.props.creditNotesActions.createCustomer}
					currency_list={this.props.currency_convert_list}
					currency={this.state.currency}
					country_list={this.props.country_list}
					getStateList={this.props.creditNotesActions.getStateList}
				/>
				<ProductModal
					openProductModal={this.state.openProductModal}
					closeProductModal={(e) => {
						this.closeProductModal(e);
					}}
					getCurrentProduct={(e) => this.getCurrentProduct(e)}
					createProduct={this.props.productActions.createAndSaveProduct}
					vat_list={this.props.vat_list}
					product_category_list={this.props.product_category_list}
					salesCategory={this.state.salesCategory}
					purchaseCategory={this.state.purchaseCategory}
				/>
				{
				<MultiSupplierProductModal
					openMultiSupplierProductModal={this.state.openMultiSupplierProductModal}
					closeMultiSupplierProductModal={(e) => {
						this.closeMultiSupplierProductModal(e);
					}}
					inventory_list={this.state.inventoryList}
				/>}
				{/* <InvoiceNumberModel
					openInvoiceNumberModel={this.state.openInvoiceNumberModel}
					closeInvoiceNumberModel={(e) => {
						this.closeInvoiceNumberModel(e);
					}}
					getCurrentNumber={(e) => this.getCurrentNumber(e)}
						prefix ={this.state.prefixData}
						updatePrefix={this.props.creditNotesActions.updateInvoicePrefix}
					
				/> */}
			</div>
		);
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(CreateCreditNote);
