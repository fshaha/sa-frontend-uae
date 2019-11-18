import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Form,
  FormGroup,
  Label,
  Row,
  Col
} from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import _ from 'lodash'
import { Loader } from 'components'

import 'react-toastify/dist/ReactToastify.css'
import './style.scss'

import * as VatActions from './actions'


const mapStateToProps = (state) => {
  return ({
    vat_row: state.vat.vat_row
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    vatActions: bindActionCreators(VatActions, dispatch)
  })
}

class CreateVatCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vatData: {},
      loading: false
    }

    this.saveAndContinue = false;

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.success = this.success.bind(this)
  }

  componentDidMount() {
  }

  // Save Updated Field's Value to State
  handleChange(e, name) {
    this.setState({
      vatData: _.set(
        { ...this.state.vatData },
        e.target.name && e.target.name !== '' ? e.target.name : name,
        e.target.type === 'checkbox' ? e.target.checked : e.target.value
      )
    })
  }

  // Show Success Toast
  success() {
    toast.success('Vat Code Updated successfully... ', {
      position: toast.POSITION.TOP_RIGHT
    })
  }

  // Create or Edit Vat
  handleSubmit = (e, status) => {
    e.preventDefault()

    const { name, vat } = this.state.vatData

    let postObj = { name, vat }

    this.props.vatActions.createBat(postObj).then(res => {
      if (res.status === 200) {
        this.success()
        this.props.history.push('/admin/master/vat-code')
      }
    })
  }

  render() {
    const { loading } = this.state
    const { name, vat } = this.state.vatData ? this.state.vatData : {}

    console.log(name, vat)
    return (
      <div className="vat-code-create-screen">
        <div className="animated fadeIn">
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2">New Vat Code</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                      <Form onSubmit={this.handleSubmit} name="simpleForm">
                        <FormGroup>
                          <Label htmlFor="name">Vat Code Name</Label>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue={name}
                            placeholder="Enter Vat Code Name"
                            onChange={this.handleChange}
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="name">Percentage</Label>
                          <Input
                            type="number"
                            id="name"
                            name="vat"
                            defaultValue={vat}
                            placeholder="Enter Percentage"
                            onChange={this.handleChange}
                            required
                          />
                        </FormGroup>            
                        <FormGroup className="text-right mt-5">
                          <Button type="submit" name="submit" color="primary" className="btn-square mr-3">
                            <i className="fa fa-dot-circle-o"></i> Create
                          </Button>
                          <Button name="submit" color="primary" className="btn-square mr-3">
                            <i className="fa fa-refresh"></i> Create and More
                          </Button>
                          <Button type="submit" color="secondary" className="btn-square"
                            onClick={() => {this.props.history.push('/admin/master/vat-code')}}>
                            <i className="fa fa-ban"></i> Cancel
                          </Button>
                        </FormGroup>
                      </Form>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {loading ? (
            <Loader></Loader>
          ) : (
              ""
            )}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateVatCode)
