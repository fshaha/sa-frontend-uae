import React, { Component } from 'react';
import { Card, CardBody, Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import '../style.scss';
import logo from 'assets/images/brand/logo.png';
import { Currency } from 'components';
import { toInteger, upperCase } from 'lodash';

var converter = require('number-to-words');
class SalarySlipTemplate extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	getRibbonColor = (invoiceData) => {
		if (invoiceData.status == 'Draft') {
			return 'pending-color';
		} else if (invoiceData.status == 'Sent') {
			return 'saved-color';
		} else {
			return 'saved-color';
		}
	};

	render() {
		const { invoiceData, currencyData, totalNet, companyData } = this.props;
		return (
			<div>
				<Card id="singlePage" className="box">
					<div
						className={`ribbon ribbon-top-left ${this.getRibbonColor(
							invoiceData,
						)}`}
					>
						<span>{invoiceData.status}</span>
					</div>

					<CardBody style={{ marginTop: '7rem' }}>
						<div
							style={{
								width: '100%',
								display: 'flex',
								border:'1px solid',
								padding:'7px',borderColor:'#c8ced3'
							}}
						>
							<div style={{ width: '150%' }}>
								<div className="companyDetails">
									<img
										src={
											companyData &&
											companyData.company &&
											companyData.company.companyLogo
												? 'data:image/jpg;base64,' +
												  companyData.company.companyLogo
												: logo
										}
										className=""
										alt=""
										style={{ width: ' 100px' }}
									/>
								</div>
							</div>
							<div style={{ width: '130%',justifyContent:'center' }}>
								<table>
							<tbody>
								<tr style={{
									width: '50%',
									margin:'0.5rem',
									marginTop:'2.5rem',
									marginLeft:'6rem'
								}}>
									<td
										style={{
											width: '130%',
											fontSize: '2rem',
											fontWeight: '700',
											textTransform: 'uppercase',
											color: 'black',
										}}
									>
										Salary Slip 
									</td>
								</tr>
								<tr style={{
									width: '50%',
									margin:'0.5rem',
									marginTop:'2.5rem',
									marginLeft:'6rem'
								}}>
									<td className="text-center"
										style={{
											width: '130%',
											fontSize: '1rem',
											fontWeight: '500',
									
											color: 'black',
										}}
									>
										FOR <u>23/12/2020</u>
									</td>
								</tr>
								</tbody>
								</table>
							</div>
							<div
								style={{
									width: '70%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'right',
								}}
							>
								<div 	style={{
									width: '62%',
									margin:'0.5rem',
									// border:'1px solid',
									marginTop:'2.5rem',
									marginLeft:'6rem'
								}}>
								<h4 className="mb-1 ml-2"><b>{companyData && companyData.company
											? companyData.company.companyName
											: ''}</b></h4>
								<h6 className="mb-1 ml-2">#{invoiceData.referenceNumber}</h6>
								<h6 className="mb-1 ml-2"><b>{invoiceData.dueAmount ? (
														<Currency
															value={invoiceData.dueAmount}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}</b></h6>
								</div>
								</div>
							</div>
					

						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: '1rem',
								borderLeft:'1px solid',
									borderRight:'1px solid',
									borderBottom:'1px solid',borderColor:'#c8ced3'
							}}
						>
							<div style={{width: '444%'}}>
								<div
									style={{
										width: '41%',
										margin:'0.5rem',
										border:'1px solid',borderColor:'#c8ced3'
									}}
								>
							
									<h6 className="mb-1 ml-2"><b>Person Name:</b> {invoiceData.name}</h6>
									<h6 className="mb-1 ml-2"><b>Designation:</b> {invoiceData.organisationName}</h6>
									<h6 className="mb-1 ml-2"><b>Address:</b> {invoiceData.email}</h6>
									<h6 className="mb-1 ml-2"><b>Date of Joining:</b> {invoiceData.address}</h6>
									<h6 className="mb-1 ml-2"><b>Mobile Number:</b> {invoiceData.email}</h6>
									<h6 className="mb-1 ml-2"><b>Email :</b> {invoiceData.email}</h6>
								</div>
							</div>
							<div
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
								}}
							>
								<div style={{ width: '80%' }}>
									<Table className="table table-bordered" style={{width: '90%',margin:'0.5rem',border:'1px solid',width:'250px', textAlign: 'center' ,border:'1px solid',borderColor:'#c8ced3'}}>
										<tbody>
											<tr style={{ textAlign: 'right' }}>
												<td  style={{backgroundColor:'#e3e3e3' ,width:'104px'  }}>Date</td>
												<td style={{ width:'143px'  }}>
													{' '}
													{moment(invoiceData.invoiceDate).format(
														'DD MMM YYYY',
													)}
												</td>
											</tr>
											<tr style={{ textAlign: 'right',width:'143px' }}>
												<td style={{width:'109px' ,backgroundColor:'#e3e3e3' }}>Worked Days</td>
												<td style={{width:'143px'}}>{invoiceData.term}</td>
											</tr>
											
										</tbody>
									</Table>
								</div>
							</div>
						</div>
						<Table  >
							<thead className="header-row">
								<tr>
									<th className="center" style={{ padding: '0.5rem',    width: "40px" }}>
										#
									</th>
									{/* <th style={{ padding: '0.5rem' }}>Item</th> */}
									<th style={{ padding: '0.5rem' }}>Structure Name</th>
									<th style={{ padding: '0.5rem' }}>Component Name</th>
									<th className="center" style={{ padding: '0.5rem' }}>
									Amount
									</th>
									
								</tr>
							</thead>
							<tbody className=" table-bordered table-hover">
								{invoiceData.invoiceLineItems &&
									invoiceData.invoiceLineItems.length &&
									invoiceData.invoiceLineItems.map((item, index) => {
										return (
											<tr key={index}>
												<td className="center">{index + 1}</td>
												<td>{item.productName}</td>
												<td>{item.description}</td>
												<td>{item.quantity}</td>
												<td style={{ textAlign: 'right', width: '20%' }}>
													<Currency
														value={item.unitPrice}
														currencySymbol={
															currencyData[0]
																? currencyData[0].currencyIsoCode
																: 'USD'
														}
													/>
												</td>
												<td
													style={{ textAlign: 'right' }}
												>{`${item.vatPercentage}%`}</td>
												<td style={{ textAlign: 'right' }}>
													<Currency
														value={item.subTotal}
														currencySymbol={
															currencyData[0]
																? currencyData[0].currencyIsoCode
																: 'USD'
														}
													/>
												</td>
											</tr>
										);
									})}
							</tbody>
						</Table>
						<div 
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'space-between',
								marginBottom: '1rem',border:'solid 1px',borderColor:'#c8ced3',
								fontSize: "12px"
							}}
						>
								<div
								style={{
									width: '200%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
								}}
							>
								<div className="pl-5 pb-2">Gross Salary In Words:<br/>
									<b> {upperCase(converter.toWords(toInteger(invoiceData.totalAmount)))}
									{/* <b> {parseInt(invoiceData.dueAmount)} */}
									</b></div>
								<div className="pl-5 pb-2">Gross Salary  In Words:
										<br/>
									<b> {upperCase(converter.toWords(toInteger(invoiceData.totalVatAmount)))}</b>
									{/* <b> {invoiceData.totalVatAmount}</b> */}
								</div>
							<div className="pl-5" style={{borderTop:'1px solid',borderColor:'#c8ced3'}}>

								<h6 className="mb-0 pt-2">
									<b>Notes:</b>
								</h6>
								<h6 className="mb-0">{invoiceData.notes}</h6>
							</div>
							
							</div>
							<div
								style={{
									width: '100%',
									display: 'flex',
									justifyContent: 'space-between',
								
								}}
							>
								<div style={{ width: '100%' }}>
								<Table className="table-clear cal-table">
									<tbody>
										<tr >
											<td style={{ width: '40%' }}>
												<strong>Subtotal</strong>
											</td>
											<td
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}
											>
												<span style={{ marginLeft: '2rem' }}></span>
												<span>
													{totalNet ? (
														<Currency
															value={totalNet.toFixed(2)}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}
												</span>
											</td>
										</tr>
									

										<tr >
											<td style={{ width: '40%' }}>
												<strong>Gross salary </strong>
											</td>
											<td
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}
											>
												<span style={{ marginLeft: '2rem' }}></span>
												<span>
													{invoiceData.totalAmount ? (
														<Currency
															value={invoiceData.totalAmount.toFixed(2)}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													) : (
														<Currency
															value={0}
															currencySymbol={
																currencyData[0]
																	? currencyData[0].currencyIsoCode
																	: 'USD'
															}
														/>
													)}
												</span>
											</td>
										</tr>
										<tr style={{ background: '#f2f2f2' }}>
											<td style={{ width: '40%' }}>
												<strong>Total Salary </strong>
											</td>
											<td>
												<b
													style={{
														fontWeight: '600',
														display: 'flex',
														justifyContent: 'space-between',
													}}
												>
													<span style={{ marginLeft: '2rem' }}></span>
													<span>
														{invoiceData.dueAmount ? (
															<Currency
																value={invoiceData.dueAmount.toFixed(2)}
																currencySymbol={
																	currencyData[0]
																		? currencyData[0].currencyIsoCode
																		: 'USD'
																}
															/>
														) : (
															<Currency
																value={0}
																currencySymbol={
																	currencyData[0]
																		? currencyData[0].currencyIsoCode
																		: 'USD'
																}
															/>
														)}
													</span>
												</b>
											</td>
										</tr>
									</tbody>
								</Table>
								</div>		
							</div>
						</div>												
					</CardBody>
				</Card>
			</div>
		);
	}
}

export default SalarySlipTemplate;
