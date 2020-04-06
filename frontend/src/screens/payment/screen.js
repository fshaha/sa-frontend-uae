import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  ButtonGroup,
  Input,
} from 'reactstrap'
import { selectOptionsFactory } from 'utils'
import Select from 'react-select'
// import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn,  } from 'react-bootstrap-table'
import {
  Loader,
  ConfirmDeleteModal
} from 'components'
import DatePicker from 'react-datepicker'

import 'react-datepicker/dist/react-datepicker.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
import 'bootstrap-daterangepicker/daterangepicker.css'

import {
  CommonActions
} from 'services/global'
import * as PaymentActions from './actions'
import moment from 'moment'
import { CSVLink } from "react-csv";

import './style.scss'

const mapStateToProps = (state) => {
  return ({
    payment_list: state.payment.payment_list,
    supplier_list: state.payment.supplier_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    paymentActions: bindActionCreators(PaymentActions, dispatch)
  })
}

class Payment extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      selectedRows: [],
      dialog: null,
      contactType: 1,
      filterData: {
        supplierId: '',
        paymentDate: '',
        invoiceAmount: ''
      },
      csvData: [],
      view: false
    }

    this.options = {
      onRowClick: this.goToDetail,
      paginationPosition: 'top',
      page: 1,
      sizePerPage: 10,
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
      sortName: '',
      sortOrder: '',
      onSortChange: this.sortColumn
    }

    this.selectRowProp = {
      mode: 'checkbox',
      bgColor: 'rgba(0,0,0, 0.05)',
      clickToSelect: false,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }
    this.csvLink = React.createRef()
  }

  componentDidMount = () => {
    this.props.paymentActions.getSupplierContactList(this.state.contactType);
    this.initializeData()
  }

  initializeData = () => {
    const { filterData } = this.state
    const paginationData = {
      pageNo: this.options.page ? this.options.page - 1 : 0,
      pageSize: this.options.sizePerPage
    }
    const sortingData = {
      order: this.options.sortOrder ? this.options.sortOrder : '',
      sortingCol: this.options.sortName ? this.options.sortName : ''
    }
    const postData = { ...filterData, ...paginationData , ...sortingData}

    this.props.paymentActions.getPaymentList(postData).then(res => {
      if (res.status === 200) {
        this.setState({ loading: false })
      }
    }).catch(err => {
      this.setState({ loading: false })
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : null)
    })
  }


  goToDetail = (row) => {
    this.props.history.push('/admin/expense/payment/detail', { id: row.paymentId })
  }

  bulkDeletePayments = () => {
    let {
      selectedRows
    } = this.state
    if (selectedRows.length > 0) {
      this.setState({
        dialog: <ConfirmDeleteModal
          isOpen={true}
          okHandler={this.removeBulkPayments}
          cancelHandler={this.removeDialog}
        />
      })
    } else {
      this.props.commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.')
    }
  }

  removeDialog = () => {
    this.setState({
      dialog: null
    })
  }

  removeBulkPayments = () => {
    this.removeDialog()
    let {
      selectedRows
    } = this.state
    let obj = {
      ids: selectedRows
    }
    const { payment_list } = this.props;
    this.props.paymentActions.removeBulkPayments(obj).then((res) => {
      this.props.commonActions.tostifyAlert('success', 'Payment Deleted Successfully')
      this.initializeData();
      if (payment_list.length > 0) {
        this.setState({
          selectedRows: []
        })
      }
    }).catch(err => {
      this.props.commonActions.tostifyAlert('error', err && err.data ? err.data.message : null)
    })
  }


  onRowSelect = (row, isSelected, e) => {
    let temp_list = []
    if (isSelected) {
      temp_list = Object.assign([], this.state.selectedRows)
      temp_list.push(row.paymentId)
    } else {
      this.state.selectedRows.map(item => {
        if (item !== row.paymentId) {
          temp_list.push(item)
        }
        return item
      })
    }
    this.setState({
      selectedRows: temp_list
    })
  }
  onSelectAll = (isSelected, rows) => {
    let temp_list = []
    if (isSelected) {
      rows.map(item => {
        temp_list.push(item.paymentId)
        return item
      })
    }
    this.setState({
      selectedRows: temp_list
    })
  }

  renderDate = (cell, rows) => {
    return rows['paymentDate'] !== null ? moment(rows['paymentDate']).format('DD/MM/YYYY') : ''
  }

  renderAmount = (cell,row) => {
    return row.invoiceAmount ? (row.invoiceAmount).toFixed(2) : ''
  }  

  handleChange = (val, name) => {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: val
      })
    })
  }

  handleSearch = () => {
    this.initializeData()
  }

  onSizePerPageList = (sizePerPage) => {
    if (this.options.sizePerPage !== sizePerPage) {
      this.options.sizePerPage = sizePerPage
      this.initializeData()
    }
  }

  onPageChange = (page, sizePerPage) => {
    if (this.options.page !== page) {
      this.options.page = page
      this.initializeData()
    }
  }

  sortColumn = (sortName,sortOrder) => {
      this.options.sortName = sortName
      this.options.sortOrder = sortOrder
      this.initializeData()
  }

  getCsvData = () => {
       if(this.state.csvData.length === 0) {
      let obj = {
        paginationDisable: true
      }
      this.props.paymentActions.getPaymentList(obj).then(res => {
        if (res.status === 200) {
          this.setState({ csvData: res.data.data, view: true }, () => {
            setTimeout(() => {
              this.csvLink.current.link.click()
            }, 0)
          });
        }
      })
    } else {
      this.csvLink.current.link.click()
    }
  }

  render() {
    const { loading, dialog, filterData, selectedRows,csvData,view } = this.state
    const { payment_list, supplier_list } = this.props
    // const containerStyle = {
    //   zIndex: 1999
    // }
    return (
      <div className="payment-screen">
        <div className="animated fadeIn">
          {dialog}
          {/* <ToastContainer position="top-right" autoClose={5000} style={containerStyle} /> */}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="fas fa-money-check" />
                    <span className="ml-2">Payments</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {
                loading ?
                  <Row>
                    <Col lg={12}>
                      <Loader />
                    </Col>
                  </Row>
                  :
                  <Row>
                    <Col lg={12}>
                      <div className="d-flex justify-content-end">
                        <ButtonGroup size="sm">
                        <Button
                            color="success"
                            className="btn-square"
                            onClick={() => this.getCsvData()}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />Export To CSV
                          </Button>
                           {view && <CSVLink
                            data={csvData}
                            filename={'Payment.csv'}
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank"
                          />}
                          <Button
                            color="primary"
                            className="btn-square"
                            onClick={() => this.props.history.push(`/admin/expense/payment/create`)}
                          >
                            <i className="fas fa-plus mr-1" />
                            New Payment
                          </Button>
                          <Button
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDeletePayments}
                            disabled={selectedRows.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button>
                        </ButtonGroup>
                      </div>
                      <div className="py-3">
                        <h5>Filter : </h5>
                        <Row>
                          <Col lg={2} className="mb-1">
                            <Select
                              className="select-default-width"
                              placeholder="Select Supplier"
                              id="supplier"
                              name="supplier"
                              options={supplier_list ? selectOptionsFactory.renderOptions('label', 'value', supplier_list, 'Supplier Name') : []}
                              value={filterData.supplierId}
                              onChange={(option) => {
                                if (option && option.value) {
                                  this.handleChange(option.value, 'supplierId')
                                } else {
                                  this.handleChange('', 'supplierId')
                                }
                              }}
                            />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <DatePicker
                              className="form-control"
                              id="date"
                              name="paymentDate"
                              placeholderText="Payment Date"
                              selected={filterData.paymentDate}
                              showMonthDropdown
                              showYearDropdown
                              dateFormat="dd/MM/yyyy"
                              dropdownMode="select"
                              value={filterData.paymentDate}
                              onChange={(value) => {
                                this.handleChange(value, "paymentDate")
                              }}
                            />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <Input
                              type="text"
                              placeholder="Invoice Amount"
                              value={filterData.invoiceAmount}
                              onChange={e => this.handleChange(e.target.value, 'invoiceAmount')}
                            />
                          </Col>
                          <Col lg={1} className="mb-1">
                            <Button type="button" color="primary" className="btn-square" onClick={this.handleSearch}>
                              <i className="fa fa-search"></i>
                            </Button>
                          </Col>
                        </Row>
                      </div>
                      <div>
                        <BootstrapTable
                          selectRow={this.selectRowProp}
                          search={false}
                          options={this.options}
                          data={payment_list && payment_list.data? payment_list.data : []}
                          version="4"
                          hover
                          keyField="paymentId"
                          pagination = {payment_list && payment_list.data && payment_list.data.length > 0 ? true : false}
                          remote
                          fetchInfo={{ dataTotalSize: payment_list.count ? payment_list.count : 0 }}
                          className="payment-table"
                          trClassName="cursor-pointer"
                          csvFileName="payment_list.csv"
                          ref={node => {
                            this.table = node
                          }}
                        >
                          <TableHeaderColumn
                            dataField="supplierName"
                            dataSort
                          >
                            Supplier Name
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="invoiceReferenceNo"
                            dataSort
                          >
                            Reference #
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="invoiceAmount"
                            dataSort
                            dataFormat={this.renderAmount}
                            dataAlign="right"
                            width="10%"
                          >
                            Amount
                          </TableHeaderColumn>
                          <TableHeaderColumn

                            dataField="paymentDate"
                            dataSort
                            dataFormat={this.renderDate}
                            dataAlign="center"
                          >
                            Date
                          </TableHeaderColumn>
                        </BootstrapTable>
                      </div>
                    </Col>
                  </Row>
              }
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Payment)
