import React from 'react'
import {connect} from 'react-redux'
import { bindActionCreators } from 'redux'
import { Card, CardHeader, CardBody, Button, Modal, ModalHeader, 
        ModalBody, ModalFooter, Row, Input, ButtonGroup, Col, Form, 
        FormGroup, Label} from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import { BootstrapTable, TableHeaderColumn, SearchField } from 'react-bootstrap-table'
import Loader from "components/loader"
import moment from 'moment'

import 'react-toastify/dist/ReactToastify.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
import './style.scss'

import * as TransactionActions from './actions'


import ImagesUploader from 'react-images-uploader';
import 'react-images-uploader/styles.css';
import 'react-images-uploader/font.css';
import Select from 'react-select'

const industryOptions = [
  { value: 'input', label: 'Input'},
  { value: 'output', label: 'Output'},
  { value: 'all', label: 'All'},
]


const mapStateToProps = (state) => {
  return ({
    transaction_list: state.transaction.transaction_list
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    transactionActions: bindActionCreators(TransactionActions, dispatch)
  })
}

class TransactionCategory extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      transactionCategoryList: [],
      openDeleteModal: false,
      loading: true,
    }

    this.selectRowProp = {
      mode: 'checkbox',
      bgColor: 'rgba(0,0,0, 0.05)',
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }

    this.deleteTransaction = this.deleteTransaction.bind(this)
    this.customSearchField = this.customSearchField.bind(this)
    this.success = this.success.bind(this)
    this.customTotal = this.customTotal.bind(this)
    this.getTransactionType = this.getTransactionType.bind(this)
    this.getparentTransactionCategory = this.getparentTransactionCategory.bind(this)
    this.getCategoryName = this.getCategoryName.bind(this)
  }

  // Table Custom Search Field
  customSearchField(props) {
    return (
      <SearchField
        defaultValue=''
        placeholder='Search ...'/>
    )
  }

  // Table Custom Pagination Label
  customTotal(from, to, size) {
    return (
      <span className="react-bootstrap-table-pagination-total">
        Showing {from} to {to} of {size} Results
      </span >
    )
  }

  // -------------------------
  // Data Table Custom Fields
  //--------------------------

  getTransactionType(cell, row) { 
    return(row.transactionType.transactionTypeName)
  }

  getparentTransactionCategory(cell, row) {
    return(row.parentTransactionCategory.transactionCategoryDescription)
  }

  getCategoryName(cell, row) {
    return (
      <label
        className="text-primary my-link mb-0"
        onClick={() => this.props.history.push('/admin/settings/transaction-category/detail')}
      >
        { row.transactionCategoryName }
      </label>
    )
  }

  // Show Success Toast
  success() {
    return toast.success('Transaction Category Deleted Successfully...', {
      position: toast.POSITION.TOP_RIGHT
    })
  }


  componentDidMount() {
    this.getTransactionListData()
  }

  // Get All Transaction Categories
  getTransactionListData() {
    this.setState({ loading: true })
    this.props.transactionActions.getTransactionList().then(res => {
      if (res.status === 200) {
        this.setState({ loading: false })
      }
    })
  }

  // Delete Transaction By ID
  deleteTransaction() {
    this.setState({ loading: true })
    this.setState({ openDeleteModal: false })
    this.props.transactionActions.deleteTransaction(this.state.selectedData.id).then(res => {
      if (res.status === 200) {
        this.setState({ loading: false })
        this.getTransactionListData()
      }
    })
  }

  // Cloase Confirm Modal
  closeModal() {
    this.setState({ openDeleteModal: false })
  }

  render() {
    const { loading } = this.state;
    const transactionList = this.props.transaction_list
    const containerStyle = {
      zIndex: 1999
    };

    return (
      <div className="transaction-category-screen">
        <div className="animated">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            style={containerStyle}
          />
          <Card>
            <CardHeader>
              <div className="h4 mb-0 d-flex align-items-center">
                <i className="nav-icon icon-graph" />
                <span className="ml-2">Transaction Category</span>
              </div>
            </CardHeader>
            <CardBody>
            {
              loading ?
                <Loader></Loader>: 
                <Row>
                  <Col lg='12'>
                    <div className="mb-2">
                        <ButtonGroup className="toolbar" size="sm">
                          <Button
                            color="success"
                            className="btn-square"
                          >
                            <i className="fa glyphicon glyphicon-export fa-download mr-1" />
                            Export to CSV
                          </Button>
                          <Button
                            color="info"
                            className="btn-square"
                          >
                            <i className="fa glyphicon glyphicon-export fa-upload mr-1" />
                            Import from CSV
                          </Button>
                          <Button
                            color="primary"
                            className="btn-square"
                            onClick={() => this.props.history.push(`/admin/settings/transaction-category/create`)}
                          >
                            <i className="fas fa-plus mr-1" />
                            New Category
                          </Button>
                          <Button
                            color="warning"
                            className="btn-square"
                          >
                            <i className="fa glyphicon glyphicon-trash fa-trash mr-1" />
                            Bulk Delete
                          </Button>
                        </ButtonGroup>
                        </div>
                        <div className="filter-panel my-3 py-3">
                          <Form inline>
                            <FormGroup className="pr-3">
                              <Input type="text" placeholder="Category Code" />
                            </FormGroup>
                            <FormGroup className="pr-3">
                              <Input type="text" placeholder="Category Name" />
                            </FormGroup>
                            <FormGroup className="pr-3">
                              <Input type="text" placeholder="Category Description" />
                            </FormGroup>
                            <FormGroup className="pr-3">
                              <Input type="text" placeholder="Paret Transaction Category Name " />
                            </FormGroup>
                            <FormGroup className="pr-3">
                              <Input type="text" placeholder="Transaction Type" />
                            </FormGroup>
                            <Button
                              type="submit"
                              color="primary"
                              className="btn-square"
                            >
                              <i className="fas fa-search mr-1"></i>Filter
                            </Button>
                          </Form>
                        </div>
                        <BootstrapTable 
                          data={transactionList} 
                          hover
                          pagination
                          version="4"
                          search={true}
                          selectRow={ this.selectRowProp }
                        >
                          <TableHeaderColumn isKey dataField="transactionCategoryCode">
                            Category Code
                          </TableHeaderColumn>
                          <TableHeaderColumn dataFormat={this.getCategoryName}>
                            Category Name
                          </TableHeaderColumn>
                          <TableHeaderColumn dataField="transactionCategoryDescription">
                            Category Description
                          </TableHeaderColumn>
                          <TableHeaderColumn dataFormat={this.getparentTransactionCategory}>
                            Parent Transaction Category Name
                          </TableHeaderColumn>
                          <TableHeaderColumn dataFormat={this.getTransactionType}>
                            Transaction Type
                          </TableHeaderColumn>
                          
                        </BootstrapTable>
                  </Col>
                </Row>
            }
            </CardBody>
          </Card>


          <Modal isOpen={this.state.openDeleteModal}
            className={"modal-danger " + this.props.className}
          >
            <ModalHeader toggle={this.toggleDanger}>Delete</ModalHeader>
            <ModalBody>Are you sure want to delete this record?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={this.deleteTransaction}>Yes</Button>&nbsp;
              <Button color="secondary"onClick={this.closeModal}>No</Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionCategory)
