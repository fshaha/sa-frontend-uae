import React from "react";
import { connect } from "react-redux";
import {
    Button,
    Row,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    CardBody,
    ModalHeader,
} from "reactstrap";
import { Formik } from "formik";
import Select from "react-select";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import moment from "moment";
import { bindActionCreators } from "redux";
import { CommonActions } from "services/global";
import { toast } from "react-toastify";
import { data } from "../../../../Language/index";
import LocalizedStrings from "react-localization";
import "../style.scss";
import { Loader, CommonList } from "components";
import * as PayrollEmployeeActions from "../../../../payrollemp/actions";
import * as VatReportActions from "../actions";


const mapStateToProps = (state) => {
    return {
        contact_list: state.request_for_quotation.contact_list,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        commonActions: bindActionCreators(CommonActions, dispatch),
        payrollEmployeeActions: bindActionCreators(
            PayrollEmployeeActions,
            dispatch
        ),
        vatReportActions: bindActionCreators(VatReportActions, dispatch),
    };
};
const customStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
        boxShadow: state.isFocused ? null : null,
        "&:hover": {
            borderColor: state.isFocused ? "#2064d8" : "#c7c7c7",
        },
    }),
};

let strings = new LocalizedStrings(data);
class CTReport extends React.Component {
    constructor(props) {
        var date = new Date();
        var lastdayoflastmonth = new Date();

        var firstdayoflastmonth = new Date();
        firstdayoflastmonth.setDate(1);

        super(props);
        this.state = {
            language: window["localStorage"].getItem("language"),
            loading: false,
            selectedRows: [],
            actionButtons: {},
            startDate: '',
            reportPeriod: { label: 'Yearly', value: 1 },
            endDate: '',
            dueDate: '',
            ctReprtFor: '',
            ctReprtFor_list:'',
            dialog: null,
            view: false,
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        console.log("getDerivedStateFromProps state changed", prevState);
        console.log(nextProps);
        if (prevState.employee_list !== nextProps.employee_list) {
            return {
                getVRNPrefix: nextProps.getVRNPrefix,
                employee_list: nextProps.employee_list,
            };
        }
    }

    displayMsg = (err) => {
        toast.error(`${err.data}`, {
            position: toast.POSITION.TOP_RIGHT,
        });
    };
    _showDetails = (bool) => {
        this.setState({
            showDetails: bool,
        });
    };

    exportPDFWithComponent = () => {
        this.pdfExportComponent.save();
    };
    componentDidMount = () => {
        console.log(this.props);
        this.setState({ctReprtFor_list:[]})
    };
    setDates = (value) => {
        //debugger
        //value = '01-1-2024'
        const startDate = new Date(value);
        const endDate = new Date(moment(startDate).add(365, 'days'))
        const dueDate = new Date(moment(endDate).add(9, 'month'))
        console.log(startDate,endDate)
        this.setState({
            startDate:startDate,
            endDate:endDate,
            dueDate:dueDate,
        })
    }
    generateCTReport = () => {
        const { openModal, closeModal } = this.props;
        let notgererated = true;
        this.props.vatReportDataList.data.map(({ taxReturns }) => {
            let dateArr = taxReturns ? taxReturns.split("-") : [];
            let currenttartdate = moment(this.getStartDate());
            let currentenddate = moment(this.getEndDate(), "DD-MM-YYYY");
            let startDate = moment(dateArr[0]);
            let endDate = moment(dateArr[1], "DD/MM/YYYY");
            if (
                currenttartdate.diff(startDate, "days") === 0 ||
                currentenddate.diff(endDate, "days") === 0 ||
                (currenttartdate.diff(startDate, "days") >= 0 &&
                    currentenddate.diff(endDate, "days") <= 0)
            )
                notgererated = false;
        });
        if (!notgererated) {
            return this.props.commonActions.tostifyAlert(
                "error",
                "VAT Report is Already generated"
            );
        }
        this.setState({ disabled: true });
        const { initValue } = this.state;
        const postData = {
            // startDate: moment(this.state.initValue.startDate).format('DD/MM/YYYY'),
            // endDate: moment(this.state.initValue.endDate).format('DD/MM/YYYY'),
            vrn: this.state.VRN,
            startDate: this.getStartDate().replaceAll("-", "/"),
            endDate: this.getEndDate().replaceAll("-", "/"),
        };

        this.props.vatReportActions
            .generateCTReport(postData)
            .then((res) => {
                if (res.status === 200) {
                    this.props.commonActions.tostifyAlert(
                        "success",
                        res.data && res.data.message
                            ? res.data.message
                            : "VAT Report Generated Successfully"
                    );
                }
                closeModal(false);
            })
            .catch((err) => {
                this.props.commonActions.tostifyAlert(
                    "error",
                    err && err.data ? err.data.message : "Something Went Wrong"
                );
                closeModal(false);
            });
    };

    render() {
        strings.setLanguage(this.state.language);
        const { openModal, closeModal, monthOption, setState, state } = this.props;
        const { initValue, loading } = this.state;
        var firstdayoflastmonth = new Date();
        firstdayoflastmonth.setDate(1);

        return (
            <div className="contact-modal-screen">
                <Modal isOpen={openModal} className="modal-success contact-modal">
                    <ModalHeader>
                        <Row>
                            <Col lg={12}>
                                <div className="h4 mb-0 d-flex align-items-center">
                                    <span className="ml-2">
                                        {strings.GenerateCorporateTaxReport}
                                        {/* ( <b>{this.props.monthOption==0?"Monthly":"Quarterly"}</b> ) */}
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </ModalHeader>
                    <Formik
                        ref={this.formikRef}
                        initialValues={initValue}
                        onSubmit={(values, { resetForm, setSubmitting }) => {
                            this.handleSubmit(values, resetForm);
                        }}
                        validate={(values) => {
                            let errors = {};

                            return errors;
                        }}
                        validationSchema={Yup.object().shape({

                        })}
                    ></Formik>
                    <ModalBody style={{ padding: "15px 0px 0px 0px" }}>
                        <div style={{ padding: " 0px 1px" }}>
                            <div>
                                <CardBody>
                                    {loading ? (
                                        <Row>
                                            <Col lg={12}>
                                                <Loader />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <>
                                            {" "}
                                            <Formik initialValues={initValue}>
                                                {(props) => (
                                                    <Form>
                                                        <Row>
                                                            <Col lg={4} className=" pull-right ">
                                                                <Label>
                                                                    {strings.ReportingPeriod}
                                                                </Label>
                                                                <Select
                                                                    isDisabled={true}
                                                                    options={CommonList.reportPeriod}
                                                                    id="reportPeriod"
                                                                    name="reportPeriod"
                                                                    value={this.state.reportPeriod}
                                                                    placeholder="CT Reporting Period"
                                                                    onChange={(option) => {
                                                                        this.setState({ reportPeriod: option });
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col lg={4} className=" pull-right ">
                                                                <Label>
                                                                    <span className="text-danger">* </span>
                                                                    {strings.ReportingPeriod}
                                                                </Label>
                                                                <Select
                                                                    options={this.state.ctReprtFor_list}
                                                                    id="ctReprtFor"
                                                                    name="ctReprtFor"
                                                                    value={this.state.ctReprtFor}
                                                                    onChange={(option) => {
                                                                        this.setState({ ctReprtFor: option }, () => {
                                                                            this.setDates(option.value);
                                                                        });
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                        <Row style={{ marginTop: 20 }}>
                                                            <Col lg={4}>
                                                                <FormGroup className="mb-3">
                                                                    <Label htmlFor="startDate">
                                                                        {strings.StartDate}
                                                                    </Label>
                                                                    <DatePicker
                                                                        disabled
                                                                        id='startDate'
                                                                        name='startDate'
                                                                        selected={this.state.startDate}
                                                                        onChange={(date) => {
                                                                            this.setState({ startDate: date });
                                                                        }}
                                                                        value={this.state.startDate}
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        className={`form-control ${props.errors.startDate &&
                                                                            props.touched.startDate
                                                                            ? 'is-invalid'
                                                                            : ''
                                                                            }`}
                                                                    />
                                                                </FormGroup>
                                                            </Col>

                                                            <Col lg={4}>
                                                                <FormGroup className="mb-3">
                                                                    <Label htmlFor="endDate">
                                                                        {strings.EndDate}
                                                                    </Label>
                                                                    <DatePicker
                                                                        disabled
                                                                        id='endDate'
                                                                        name='endDate'
                                                                        selected={this.state.endDate}
                                                                        onChange={(date) => {
                                                                            this.setState({ endDate: date });
                                                                        }}
                                                                        value={this.state.endDate}
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        className={`form-control ${props.errors.endDate &&
                                                                            props.touched.endDate
                                                                            ? 'is-invalid'
                                                                            : ''
                                                                            }`}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                            <Col lg={4}>
                                                                <FormGroup className="mb-3">
                                                                    <Label htmlFor="endDate">
                                                                        {strings.DueDate}
                                                                    </Label>
                                                                    <DatePicker
                                                                        disabled
                                                                        id='dueDate'
                                                                        name='dueDate'
                                                                        selected={this.state.dueDate}
                                                                        onChange={(date) => {
                                                                            this.setState({ dueDate: date });
                                                                        }}
                                                                        value={this.state.dueDate}
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        dateFormat="dd-MM-yyyy"
                                                                        className={`form-control ${props.errors.dueDate &&
                                                                            props.touched.dueDate
                                                                            ? 'is-invalid'
                                                                            : ''
                                                                            }`}
                                                                    />
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Form>
                                                )}
                                            </Formik>{" "}
                                        </>
                                    )}
                                </CardBody>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Row className="mb-4 ">
                            <Col>
                                <Button
                                    color="primary"
                                    className="btn-square "
                                    title={this.state.monthlyDate ? "" : "Please Select Month"}
                                    onClick={this.generateCTReport}
                                    disabled={
                                        this.state.ctReprtFor === "" || !this.state.ctReprtFor
                                    }
                                >
                                    <i class="fas fa-check-double mr-1"></i>
                                    Generate
                                </Button>
                                <Button
                                    color="secondary"
                                    className="btn-square"
                                    onClick={() => {
                                        closeModal(false);
                                    }}
                                >
                                    <i className="fa fa-ban"></i> {strings.Cancel}
                                </Button>
                            </Col>
                        </Row>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    //

    getStartDate = () => {
        const { monthOption } = this.props;

        if (this.state.monthlyDate) {
            let date = moment(this.state.monthlyDate).format("DD-MM-YYYY");

            return date;
        }
    };

    //
    getEndDate = () => {
        const { monthOption } = this.props;
        let date = "";
        if (this.state.monthlyDate) {
            if (monthOption.value === 0) {
                date = moment(this.state.monthlyDate)
                    .add(1, "month")
                    .subtract(1, "day")
                    .format("DD-MM-YYYY");
            } else if (monthOption.value === 2) {
                date = moment(this.state.monthlyDate)
                    .add(3, "month")
                    .subtract(1, "day")
                    .format("DD-MM-YYYY");
            }

            return date;
        }
    };

    //
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CTReport);