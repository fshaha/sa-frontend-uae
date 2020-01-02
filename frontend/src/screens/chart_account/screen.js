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
  Input
} from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn, SearchField } from 'react-bootstrap-table'
import Select from 'react-select'

import { Loader, ConfirmDeleteModal } from 'components'

import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'

import * as ChartAccountActions from './actions'
import { selectOptionsFactory } from 'utils'
import {
  CommonActions
} from 'services/global'

import './style.scss'

const mapStateToProps = (state) => {
  return ({
    transaction_category_list: state.chart_account.transaction_category_list,
    transaction_type_list: state.chart_account.transaction_type_list

  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    chartOfAccountActions: bindActionCreators(ChartAccountActions, dispatch)
  })
}

class ChartAccount extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      selectedRows: [],
      dialog: null,
      filterData: {
        transactionCategoryCode: '',
        transactionCategoryName: '',
        transactionType: ''
      },
      selectedTransactionType: ''
    }

    this.initializeData = this.initializeData.bind(this)
    this.onRowSelect = this.onRowSelect.bind(this)
    this.onSelectAll = this.onSelectAll.bind(this)
    this.goToDetailPage = this.goToDetailPage.bind(this)
    this.goToCreatePage = this.goToCreatePage.bind(this)
    this.typeFormatter = this.typeFormatter.bind(this);
    this.bulkDelete = this.bulkDelete.bind(this);
    this.removeBulk = this.removeBulk.bind(this);
    this.removeDialog = this.removeDialog.bind(this);

    this.handleChange = this.handleChange.bind(this)
    this.handleSearch = this.handleSearch.bind(this)

    this.onPageChange = this.onPageChange.bind(this);
    this.onSizePerPageList = this.onSizePerPageList.bind(this)

    this.options = {
      onRowClick: this.goToDetailPage,
      paginationPosition: 'top',
      page: 1,
      sizePerPage: 10,
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

  componentWillUnmount() {
    this.setState({
      selectedRows: []
    })
  }

  initializeData() {
    let { filterData } = this.state
    const data = {
      pageNo: this.options.page,
      pageSize: this.options.sizePerPage 
    }
    filterData = { ...filterData, ...data }
    this.props.chartOfAccountActions.getTransactionCategoryList(filterData).then(res => {
      if (res.status === 200) {
        this.props.chartOfAccountActions.getTransactionTypes();
        this.setState({ loading: false });
      }
    }).catch(err => {
      this.props.commonActions.tostifyAlert('error', err && err !== undefined ? err.data.message : '');
      this.setState({ loading: false })
    })

  }

  goToDetailPage(row) {
    this.props.history.push(`/admin/master/chart-account/detail`, { id: row.transactionCategoryId })
  }

  goToCreatePage() {
    this.props.history.push('/admin/master/chart-account/create')
  }

  onPageChange = (page, sizePerPage) => {
    this.options.page = page
  }

  onSizePerPageList = (sizePerPage) => {
    this.options.sizePerPage = sizePerPage
  }

  onRowSelect(row, isSelected, e) {
    let temp_list = []
    if (isSelected) {
      temp_list = Object.assign([], this.state.selectedRows)
      temp_list.push(row.transactionCategoryId);
    } else {
      this.state.selectedRows.map(item => {
        if (item !== row.transactionCategoryId) {
          temp_list.push(item)
        }
      });
    }
    this.setState({
      selectedRows: temp_list
    })
  }
  onSelectAll(isSelected, rows) {
    let temp_list = []
    if (isSelected) {
      rows.map(item => {
        temp_list.push(item.transactionCategoryId)
      })
    }
    this.setState({
      selectedRows: temp_list
    })
  }

  bulkDelete() {
    const {
      selectedRows
    } = this.state
    if (selectedRows.length > 0) {
      this.setState({
        dialog: <ConfirmDeleteModal
          isOpen={true}
          okHandler={this.removeBulk}
          cancelHandler={this.removeDialog}
        />
      })
    } else {
      this.props.commonActions.tostifyAlert('info', 'Please select the rows of the table and try again.')
    }
  }

  removeBulk() {
    this.removeDialog()
    let { selectedRows } = this.state;
    const { transaction_category_list } = this.props
    let obj = {
      ids: selectedRows
    }
    this.props.chartOfAccountActions.removeBulk(obj).then(() => {
      this.initializeData();
      this.props.commonActions.tostifyAlert('success', 'Removed Successfully')
      if (transaction_category_list && transaction_category_list.length > 0) {
        this.setState({
          selectedRows: []
        })
      }
    }).catch(err => {
      this.props.commonActions.tostifyAlert('error', err.data ? err.data.message : null)
    })
  }

  removeDialog() {
    this.setState({
      dialog: null
    })
  }

  typeFormatter(cell, row) {
    return row['transactionTypeName'] ? row['transactionTypeName'] : ''

  }

  handleChange(val, name) {
    this.setState({
      filterData: Object.assign(this.state.filterData, {
        [name]: val
      })
    })
  }

  handleSearch() {
    this.initializeData();
  }


  render() {

    const { loading, dialog ,selectedRows} = this.state
    const { transaction_category_list, transaction_type_list } = this.props
    const containerStyle = {
      zIndex: 1999
    }

    return (
      <div className="chart-account-screen">
        <div className="animated fadeIn">
          {dialog}
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-area-chart" />
                    <span className="ml-2">Chart of Accounts</span>
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
                            disabled={transaction_category_list.length === 0}

                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                            Export to CSV
                          </Button>
                          <Button
                            color="primary"
                            className="btn-square"
                            onClick={this.goToCreatePage}
                          >
                            <i className="fas fa-plus mr-1" />
                            New Account
                          </Button>
                          <Button
                            color="warning"
                            className="btn-square"
                            onClick={this.bulkDelete}
                            disabled={selectedRows.length === 0}
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button>
                        </ButtonGroup>
                      </div>
                      <div className="py-3">
                        <h5>Filter : </h5>
                        <form>
                          <Row>
                            <Col lg={3} className="mb-1">
                              <Input type="text" placeholder="Code" onChange={(e) => { this.handleChange(e.target.value, 'transactionCategoryCode') }} />
                            </Col>
                            <Col lg={3} className="mb-2">
                              <Input type="text" placeholder="Name" onChange={(e) => { this.handleChange(e.target.value, 'transactionCategoryName') }} />
                            </Col>
                            <Col lg={3} className="mb-1">
                              <FormGroup className="mb-3">

                                <Select
                                  options={transaction_type_list ? selectOptionsFactory.renderOptions('transactionTypeName', 'transactionTypeCode', transaction_type_list) : []}
                                  onChange={(val) => {
                                    this.handleChange(val['value'], 'transactionType')
                                    this.setState({ 'selectedTransactionType': val['value'] })
                                  }}
                                  className="select-default-width"
                                  placeholder="Transaction Type"
                                  value={this.state.selectedTransactionType}
                                />
                              </FormGroup>

                            </Col>
                            <Col lg={2} className="mb-1">
                              <Button type="button" color="primary" className="btn-square" onClick={this.handleSearch} disabled={transaction_category_list.length === 0}>
                                <i className="fa fa-search"></i>
                              </Button>
                            </Col>
                          </Row>
                        </form>
                      </div>
                      <div>
                        <BootstrapTable
                          selectRow={this.selectRowProp}
                          search={false}
                          options={this.options}
                          data={transaction_category_list ? transaction_category_list : []}
                          version="4"
                          hover
                          pagination
                          totalSize={transaction_category_list ? transaction_category_list.length : 0}
                          className="product-table"
                          trClassName="cursor-pointer"
                          csvFileName="Chart_Of_Account.csv"
                          ref={node => this.table = node}

                        >
                          <TableHeaderColumn
                            isKey
                            dataField="transactionCategoryCode"
                            dataSort
                          >
                            Code
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="transactionCategoryName"
                            dataSort
                          >
                            Name
                          </TableHeaderColumn>
                          <TableHeaderColumn
                            dataField="transactionType"
                            dataSort
                            dataFormat={this.typeFormatter}
                          >
                            Type
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

export default connect(mapStateToProps, mapDispatchToProps)(ChartAccount)
