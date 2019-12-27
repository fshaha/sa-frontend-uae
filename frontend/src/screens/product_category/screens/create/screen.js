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
import {
  selectOptionsFactory
} from 'utils'
import {
  CommonActions
} from 'services/global'

import 'react-toastify/dist/ReactToastify.css'
import './style.scss'

import * as CreateProductCategoryActions from './actions'

import { Formik } from 'formik';
import * as Yup from "yup";


const mapStateToProps = (state) => {
  return ({
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
    commonActions: bindActionCreators(CommonActions, dispatch),
    createProductCategoryActions: bindActionCreators(CreateProductCategoryActions, dispatch)
  })
}

class CreateProductCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: {
        productCategoryCode : '',
        productCategoryName : ''
      },
      loading: false,
      readMore: false
    }

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
    toast.success('Product Category Created successfully... ', {
      position: toast.POSITION.TOP_RIGHT
    })
  }

  // Create or Edit Vat
  handleSubmit(data) {
    this.props.createProductCategoryActions.createProductCategory(data).then(res => {
      if (res.status === 200) {
        this.props.commonActions.tostifyAlert('success', 'New Product Category is created successfully!')

        if(this.state.readMore){
          this.setState({
            readMore: false
          })
        } else this.props.history.push('/admin/master/product-category')
      }
    }).catch(err => {
      this.props.commonActions.tostifyAlert('error', err.data.message)
    })
  }

  render() {
    const { loading , initValue} = this.state

    return (
      <div className="vat-code-create-screen">
        <div className="animated fadeIn">
          
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="h4 mb-0 d-flex align-items-center">
                    <i className="nav-icon icon-briefcase" />
                    <span className="ml-2">New Product Category</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg={6}>
                    <Formik
                          initialValues={initValue}
                          onSubmit={values => {
                            this.handleSubmit(values)
                          }}
                          // validationSchema={Yup.object().shape({
                          //   name: Yup.string()
                          //     .required("Product Category Name is Required"),
                          //   code: Yup.string()
                          //     .required("Code is Required")
                          // })}
                          >
                            {props => (
                              <Form onSubmit={props.handleSubmit} name="simpleForm">
                                <FormGroup>
                                  <Label htmlFor="productCategoryCode ">Product Category Code</Label>
                                  <Input
                                    type="text"
                                    id="productCategoryCode"
                                    name="productCategoryCode"
                                    placeholder="Enter Product Category Code"
                                    onChange={props.handleChange}
                                    // value={props.values.productCategoryCode}
                                    className={
                                      props.errors.productCategoryCode  && props.touched.productCategoryCode 
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.productCategoryCode  && props.touched.productCategoryCode  && (
                                    <div className="invalid-feedback">{props.errors.productCategoryCode }</div>
                                  )}
                                </FormGroup>
                                <FormGroup>
                                  <Label htmlFor="name">Product Category Name</Label>
                                  <Input
                                    type="text"
                                    id="productCategoryName"
                                    name="productCategoryName"
                                    placeholder="Enter Product Category Name"
                                    onChange={props.handleChange}
                                    // value={props.values.productCategoryName }
                                    className={
                                      props.errors.productCategoryName  && props.touched.productCategoryName 
                                        ? "is-invalid"
                                        : ""
                                    }
                                  />
                                  {props.errors.productCategoryName  && props.touched.productCategoryName  && (
                                    <div className="invalid-feedback">{props.errors.productCategoryName }</div>
                                  )}
                                </FormGroup>
                                <FormGroup className="text-right mt-5">
                                <Button type="submit" name="submit" color="primary" className="btn-square mr-3">
                                  <i className="fa fa-dot-circle-o"></i> Create
                                </Button>
                                <Button name="button" color="primary" className="btn-square mr-3" 
                                  onClick={() => {
                                    this.setState({readMore: true}, () => {
                                      props.handleSubmit()
                                    })
                                  }}>
                                  <i className="fa fa-refresh"></i> Create and More
                                </Button>
                                <Button type="submit" color="secondary" className="btn-square"
                                  onClick={() => {this.props.history.push('/admin/master/product-category')}}>
                                  <i className="fa fa-ban"></i> Cancel
                                </Button>
                              </FormGroup>
                              </Form>
                            )}
                          </Formik>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateProductCategory)
