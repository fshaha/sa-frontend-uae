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
  Input
} from 'reactstrap'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import {
  CommonActions
} from 'services/global'
import * as OpeningBalanceActions from './actions'
import OpeningBalanceModal from './sections/opening_balance_modal'
import './style.scss'
import DatePicker from "react-datepicker"
import moment from 'moment'

const mapStateToProps = (state) => {
  return ({
    transaction_category_list: state.opening_balance.transaction_category_list,
    profile: state.auth.profile
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    openingBalanceActions: bindActionCreators(OpeningBalanceActions, dispatch)
  })
}

class OpeningBalance extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      idCount: 0,
      // showOpeningBalanceModal: false,
      // selectedRowData: ""
      data: [],
      create: false,
      edit: false,
      tempArr: [],
      error: [],
      submitBtnClick: false
    }
    this.regEx = /^[0-9\d]+$/;
    this.selectRowProp = {
      mode: 'checkbox',
      bgColor: 'rgba(0,0,0, 0.05)',
      clickToSelect: false,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll
    }
  }

  componentDidMount = () => {
    // const { data } = this.state;
    this.props.openingBalanceActions.getTransactionCategoryList()
    this.initializeData()
  }

  initializeData = () => {
    this.props.openingBalanceActions.getOpeningBalanceList().then(res => {
      if(res.status === 200) {
        let tempData = []
        if(res.data.data.length > 0) {
          tempData = res.data.data.map(item => {
            item['id'] = item.transactionCategoryBalanceId
            item['disabled'] = true
            return item
          })
        }
        this.setState({
          data: tempData
      }, () => {
        let temp = [...this.state.data]
        temp = JSON.parse(JSON.stringify(temp));
        const idCount =
          this.state.data.length > 0
            ? Math.max.apply(
              Math,
              this.state.data.map((item) => {
                return item.id;
              })
            )
            : 0;
        this.setState({
          idCount,
          tempArr: temp
        });
      })
    }
  })
  
}

  deleteRow = () => {

  }

  renderActions = (cell, rows, props) => {
    return (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon"
        disabled={this.state.data.length === 1 ? true : false}
        onClick={(e) => { this.deleteRow(e, rows, props) }}
      >
        <i className="fas fa-trash"></i>
      </Button>
    )
  }

  // showOpeningBalanceModal = () => {
  //   if (this.props.bank_account_list && this.props.currency_list) {
  //     this.props.openingBalanceActions.getCurrencyList()
  //     this.props.openingBalanceActions.getBankList()
  //   }
  //   this.setState({ showOpeningBalanceModal: true })
  // }
  // Cloase Confirm Modal
  // closeOpeningBalanceModal = () => {
  //   this.setState({ showOpeningBalanceModal: false })
  // }

  // goToDetail = (row) => {
  //   this.setState({
  //     selectedRowData: row
  //   }, () => {
  //     this.showOpeningBalanceModal()
  //   })
  // }

  // resetData = () => {
  //   if (this.state.selectedRowData) {
  //     this.setState({
  //       selectedRowData: ''
  //     }, () => { this.showOpeningBalanceModal() })
  //   } else {
  //     this.showOpeningBalanceModal()
  //   }
  // }
  renderTransactionCategory = (cell, row) => {
    const { transaction_category_list } = this.props;
    const { submitBtnClick } = this.state
    let transactionCategoryList = transaction_category_list && transaction_category_list && transaction_category_list.length ? [{ transactionCategoryId: '', transactionCategoryName: 'Select Account' }, ...transaction_category_list] : transaction_category_list
    let idx
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index
      }
      return obj
    });

    return (

      <Input type="select" onChange={(e) => {
        this.selectItem(e, row, 'transactionCategoryId')
      }} value={row.transactionCategoryId} disabled={row['disabled']}
        className={`form-control ${row.transactionCategoryId === "" && submitBtnClick ? "is-invalid" : ""}`}
      >
        {transactionCategoryList ? transactionCategoryList.map((obj) => {
          return <option value={obj.transactionCategoryId} key={obj.transactionCategoryId} disabled={this.checkCategory(obj.transactionCategoryId)}>{obj.transactionCategoryName}</option>
        }) : ''}
      </Input>
    )
  }

  renderOpeningBalance = (cell, row) => {
    const { submitBtnClick } = this.state
    let idx
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index
      }
      return obj
    });

    return (
      <Input
        type="text"
        value={row['openingBalance'] !== '' ? row['openingBalance'] : ''}
        disabled={row['disabled']}
        onChange={(e) => {
          if (e.target.value === '' || this.regEx.test(e.target.value)) { this.selectItem(e, row, 'openingBalance') }
        }}
        placeholder="Opening Balance"
        className={`form-control ${row.openingBalance === "" && submitBtnClick ? "is-invalid" : ""}`}
      />
    )
  }

  renderCurrency = (cell, rows) => {
    return this.props.profile && this.props.profile.company.currencyCode.currencyIsoCode ? this.props.profile.company.currencyCode.currencyIsoCode : ''
  }

  addMore = () => {
    // const currency = this.props.profile.company.currencyCode.currencyIsoCode;
    let tempArr = [...this.state.tempArr]
    tempArr = JSON.parse(JSON.stringify(tempArr));
    this.setState({
      data: tempArr
    }, () => {
      const datas = [...this.state.data]
      this.setState({
        data: [{
          id: 0,
          transactionCategoryId: '',
          openingBalance: '',
          effectiveDate: new Date(),
          create: true
        }].concat(datas)
        , idCount: 0,
        submitBtnClick: false
      })
    })
  }

  selectItem = (e, row, name) => {
    const data = this.state.data
    // let idx;
    data.map((obj, index) => {
      if (obj.id === row.id) {
        obj[`${name}`] = name === 'effectiveDate' ? e : e.target.value;
        // idx = index
      }
      return obj
    })
    this.setState({
      data
    })
  }

  renderEdit = (cell, row) => {
    // let idx
    // this.state.data.map((obj, index) => {
    //   if (obj.id === row.id) {
    //     idx = index
    //   }
    //   return obj
    // });
    return (
      <div>
        {row['disabled'] ? <Button type="button" color="primary" className="btn-square mr-1" onClick={(e) => { this.enableEdit(row) }}>
          <i className={`fa fa-edit`}></i>
        </Button> : <Button type="button" color="primary" className="btn-square mr-1" onClick={(e) => { this.handleSave(row) }}>
            <i className={`fa fa-save`}></i>
          </Button>}
        {/* <Button type="button" color="secondary" className="btn-square mr-1" onClick={() => { this.deleteRow(row) }}>
          <i className="fa fa-trash"></i>
        </Button> */}
        {!row['disabled'] && !row['create'] ? (
          <Button type="button" color="secondary" className="btn-square mr-1" onClick={() => { this.refreshRow(row) }}>
            <i className="fa fa-refresh"></i>
          </Button>
        ) : null

        }
      </div>
    )
  }

  enableEdit = (row) => {
    let tempArr = [...this.state.tempArr]
    tempArr = JSON.parse(JSON.stringify(tempArr));
    this.setState({
      data: tempArr
    }, () => {
      const data = this.state.data
      data.map((obj, index) => {
        if (obj.id === row.id) {
          obj[`disabled`] = false;
        }
        return obj
      })
      this.setState({
        data
      })
    })
  }

  validateRow = (row) => {
    let temp = Object.values(row).indexOf("");
    this.setState({
      submitBtnClick: true
    })
    if (temp > -1) {
      return false;
    } else {
      return true;
    }
  }

  handleSave = (row) => {
    if (this.validateRow(row)) {
      const postData = {
        transactionCategoryId: row.transactionCategoryId,
        openingBalance: row.openingBalance,
        effectiveDate: moment(row.effectiveDate).format('DD/MM/YYYY')
      }
      this.props.openingBalanceActions.addOpeningBalance(postData).then(res => {
        if (res.status === 200) {
          this.props.commonActions.tostifyAlert("success","Opening Balance added Successfully.");
          this.initializeData()
          this.setState({
            submitBtnClick: false
          })
        }
      })
    }
  }

  refreshRow = (row) => {
    let tempArr = [...this.state.tempArr]
    tempArr = JSON.parse(JSON.stringify(tempArr));
    let data = this.state.data
    let idx, temp;
    tempArr.map((obj, index) => {
      if (obj.id === row.id) {
        temp = obj;
        idx = index
      }
      return obj
    })
    data[idx] = temp
    this.setState({
      data
    })
  }

  renderDate = (cell, row) => {
    const { submitBtnClick } = this.state
    let idx
    this.state.data.map((obj, index) => {
      if (obj.id === row.id) {
        idx = index
      }
      return obj
    });

    return (
      // <Input
      //   type="date"
      //   value={row['date'] !== '' ? row['date'] : ''}
      //   disabled={row['disabled']}
      //   onChange={(e) => {
      //     if (e.target.value === '' || this.regEx.test(e.target.value)) { this.selectItem(e, row, 'date') }
      //   }}
      //   placeholder="Opening Balance"
      //   className={`form-control ${row.date === "" && submitBtnClick ? "is-invalid" : ""}`}
      // />
      <DatePicker
        id={row['id']}
        name="endDate"
        className={`form-control`}
        placeholderText="Select Date"
        showMonthDropdown
        autoComplete="off"
        disabled={row['disabled']}
        showYearDropdown
        value={typeof row['effectiveDate'] === 'string' ? moment(row['effectiveDate'],'DD/MM/YYYY').format('DD/MM/YYYY') : moment(row['effectiveDate']).format('DD/MM/YYYY')}
        dropdownMode="select"
        dateFormat="dd/MM/yyyy"
        onChange={(val) => {
          this.selectItem(val, row, 'effectiveDate')
        }}
      />
    )
  }

  checkCategory = (id) => {
    const { data } = this.state
    let temp = data.filter(item => item.transactionCategoryId === id)
    if (temp.length > 0) {
      return true
    } else {
      return false
    }
  }

  render() {
    const { bank_account_list } = this.props;
    return (
      <div className="opening-balance-screen">
        <div className="animated fadeIn">
          <Card>
            <CardHeader>
              <Row>
                <Col lg={12}>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon fas fa-area-chart" />
                    <span className="ml-2">Opening Balance</span>
                  </div>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12} className="mb-3">
                  <Button color="primary" className={`btn-square mr-3 `} onClick={this.addMore}>
                    <i className="fa fa-plus"></i> Add More
                </Button>
                </Col>
              </Row>
              <Row>
                <Col lg={12}>
                  <BootstrapTable
                    // selectRow={this.selectRowProp}
                    options={this.options}
                    data={this.state.data ? this.state.data : []}
                    version="4"
                    hover
                    keyField="id"
                    className="invoice-create-table"
                  >
                    {/* <TableHeaderColumn
                      width="55"
                      dataAlign="center"
                      dataFormat={(cell, rows) => this.renderActions(cell, rows)}
                    >
                    </TableHeaderColumn> */}
                    <TableHeaderColumn
                      dataField="accountName"
                      dataFormat={this.renderTransactionCategory}
                      width="20%"
                    >
                      Account
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="openingBalance"
                      dataFormat={this.renderOpeningBalance}
                      width="20%"
                    >
                      Opening Balance
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="effectiveDate"
                      dataFormat={this.renderDate}
                      width="20%"
                    >
                      Effective Date
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="currency"
                      width="15%"
                      dataFormat={this.renderCurrency}
                    >
                      Currency
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataFormat={this.renderEdit}
                    >
                      Actions
                    </TableHeaderColumn>
                  </BootstrapTable>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <OpeningBalanceModal
            showOpeningBalanceModal={this.state.showOpeningBalanceModal}
            closeOpeningBalanceModal={this.closeOpeningBalanceModal}
            bankAccountList={bank_account_list}
            createOpeningBalance={this.props.openingBalanceActions.createOpeningBalance}
            selectedRowData={this.state.selectedRowData}
          />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OpeningBalance)
