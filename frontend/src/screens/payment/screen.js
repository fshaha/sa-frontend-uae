import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap'
import { selectOptionsFactory } from 'utils'
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn, SearchField } from 'react-bootstrap-table'
import DateRangePicker from 'react-bootstrap-daterangepicker'
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
      filterData: {
        supplierId: '',
        paymentDate: '',
        invoiceAmount: ''
      }
    }
    this.removeDialog = this.removeDialog.bind(this)
    this.bulkDeletePayments = this.bulkDeletePayments.bind(this)
    this.removeBulkPayments = this.removeBulkPayments.bind(this)
    this.initializeData = this.initializeData.bind(this)
    this.onRowSelect = this.onRowSelect.bind(this)
    this.onSelectAll = this.onSelectAll.bind(this)
    this.goToDetail = this.goToDetail.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onSizePerPageList = this.onSizePerPageList.bind(this)

    this.options = {
      onRowClick: this.goToDetail,
      paginationPosition: 'top',
      onSizePerPageList: this.onSizePerPageList,
      onPageChange: this.onPageChange,
    }


    this.selectRowProp = {
      mode: 'checkbox',
      bgColor: 'rgba(0,0,0, 0.05)',
      clickToSelect: false,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }

  }

  componentDidMount() {
    this.initializeData()
  }

  initializeData() {
    const { filterData } = this.state
    const paginationData = {
      pageNo: this.options.page ? this.options.page : 1,
      pageSize: this.options.sizePerPage ? this.options.sizePerPage : 10
    }
    const postData = { ...filterData, ...paginationData }
    this.props.paymentActions.getPaymentList(postData).then(res => {
      if (res.status === 200) {
        this.props.paymentActions.getSupplierList()
        this.setState({ loading: false })
      }
    }).catch(err => {
      this.setState({ loading: false })
      this.props.commonActions.tostifyAlert('error', err.data ? err.data.message : null)

    })
  }


  goToDetail(row) {
    this.props.history.push('/admin/expense/payment/detail', { id: row.paymentId })
  }

  bulkDeletePayments() {

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

  removeDialog() {
    this.setState({
      dialog: null
    })
  }

  removeBulkPayments() {
    this.removeDialog()
    let {
      selectedRows
    } = this.state
    let obj = {
      ids: selectedRows
    }
    const { payment_list } = this.props;
    this.props.paymentActions.removeBulkPayments(obj).then((res) => {
      this.props.commonActions.tostifyAlert('success', 'Removed Successfully')
      this.initializeData();
      if (payment_list.length > 0) {
        this.setState({
          selectedRows: []
        })
      }
    }).catch(err => {
      this.props.commonActions.tostifyAlert('error', err.data ? err.data.message : null)
    })
  }


  onRowSelect(row, isSelected, e) {
    let temp_list = []
    if (isSelected) {
      temp_list = Object.assign([], this.state.selectedRows)
      temp_list.push(row.paymentId)
    } else {
      this.state.selectedRows.map(item => {
        if (item != row.paymentId) {
          temp_list.push(item)
        }
      })
    }
    this.setState({
      selectedRows: temp_list
    })
  }
  onSelectAll(isSelected, rows) {
    let temp_list = []
    if (isSelected) {
      rows.map(item => {
        temp_list.push(item.paymentId)
      })
    }
    this.setState({
      selectedRows: temp_list
    })
  }

  renderDate(cell, rows) {
    return rows['paymentDate'] !== null ? moment(rows['paymentDate']).format('DD-MM-YYYY') : ''
  }

  handleChange(val, name) {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: val
      })
    })
  }

  handleSearch() {
    this.initializeData()
  }

  onPageChange = (page, sizePerPage) => {
    this.options.page = page
  }

  onSizePerPageList = (sizePerPage) => {
    this.options.sizePerPage = sizePerPage
  }

  render() {
    const { loading, dialog, filterData,selectedRows} = this.state
    const { payment_list, supplier_list } = this.props
    const containerStyle = {
      zIndex: 1999
    }
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
                            onClick={() => this.table.handleExportCSV()}
                            disabled={payment_list.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                            Export to CSV
                          </Button>
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
                              options={supplier_list ? selectOptionsFactory.renderOptions('label', 'value', supplier_list) : []}
                              value={filterData.supplierId}
                              onChange={(option) => { this.handleChange(option.value, 'supplierId') }}
                            />
                          </Col>
                          <Col lg={2} className="mb-1">
                            <DatePicker
                              className="form-control"
                              id="date"
                              name="paymentDate"
                              placeholderText="Payment Date"
                              selected={filterData.paymentDate}
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
                          data={payment_list ? payment_list : []}
                          version="4"
                          hover
                          keyField="paymentId"
                          pagination
                          totalSize={payment_list ? payment_list.length : 0}
                          className="payment-table"
                          trClassName="cursor-pointer"
                          csvFileName="payment.csv"
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
                          >
                            Amount
                          </TableHeaderColumn>
                          <TableHeaderColumn

                            dataField="paymentDate"
                            dataSort
                            dataFormat={this.renderDate}
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
