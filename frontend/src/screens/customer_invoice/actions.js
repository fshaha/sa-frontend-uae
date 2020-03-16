import { CUSTOMER_INVOICE } from 'constants/types'
import {
  authApi
} from 'utils'
import moment from 'moment'

export const getCustomerInvoiceList = (postObj) => {
  let customerName = postObj ? postObj.customerId : ''
  let referenceNumber =  postObj ? postObj.referenceNumber : ''
  let invoiceDate =  postObj.invoiceDate
  let invoiceDueDate =  postObj.invoiceDueDate
  let amount =  postObj ? postObj.amount : ''
  let status =  postObj ? postObj.status : ''
  let contactType = postObj ? postObj.contactType : ''
  const { pageNo, pageSize} = postObj
  return (dispatch) => {
    let param = `rest/invoice/getList?contact=${customerName}&type=${contactType}&referenceNumber=${referenceNumber}&amount=${amount}&status=${status}&pageNo=${pageNo}&pageSize=${pageSize}`
    if(invoiceDate) {
      let date = moment(invoiceDate).format('DD-MM-YYYY')
      param = param +`&invoiceDate=${date}`
    }
    if(invoiceDueDate) {
      let date = moment(invoiceDueDate).format('DD-MM-YYYY')
      param = param + `&invoiceDueDate=${date}`
    }
    let data ={
      method: 'get',
      url: param
      // data: postObj
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.CUSTOMER_INVOICE_LIST,
          payload: {
            data: res.data
          }
        })
        return res
      }
    }).catch(err => {
      throw err
    })
  }
}
 
export const getProjectList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: 'rest/project/getProjectsForDropdown'
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.PROJECT_LIST,
          payload:  {
            data: res.data
          }
        })
      }
    }).catch(err => {
      throw err
    })
  }
}


export const getCustomerList = (nameCode) => {
  let contactType = nameCode ? nameCode : ""
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `rest/contact/getContactsForDropdown?contactType=${contactType}`
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.CUSTOMER_LIST,
          payload:  {
            data: res.data
          }
        })
      }
      return res
    }).catch(err => {
      throw err
    })
  }
}

export const getCurrencyList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: 'rest/bank/getcurrenncy'
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.CURRENCY_LIST,
          payload:  res
        })
        return res
      }
    }).catch(err => {
      throw err
    })
  }
}


export const getVatList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: 'rest/datalist/vatCategory'
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.VAT_LIST,
          payload:  {
            data: res.data
          }
        })
      }
    }).catch(err => {
      throw err
    })
  }
}


export const getContactList = (nameCode) => {
  let contactType = nameCode ? nameCode : ""
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `rest/contact/getContactList?contactType=${contactType}`
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.CONTACT_LIST,
          payload:  {
            data: res.data
          }
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const getStatusList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: '/rest/datalist/getInvoiceStatusTypes'
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.STATUS_LIST,
          payload: res
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const createCustomer = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: 'rest/contact/save',
      data: obj
    }
    return authApi(data).then(res => {
      return res
    }).catch(err => {
      throw err
    })
  }
}

export const removeBulk = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'delete',
      url: '/rest/invoice/deletes',
      data: obj
    }
    return authApi(data).then(res => {
        return res
    }).catch(err => {
      throw err
    })
  }
}

export const getCountryList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: 'rest/datalist/getcountry'
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: CUSTOMER_INVOICE.COUNTRY_LIST,
          payload: res.data
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const postInvoice = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/invoice/posting',
      data: obj
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        return res
      }
    }).catch(err => {
      throw err
    })
  }
}

export const getInvoiceById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/invoice/getInvoiceById?id=${_id}`
    }

    return authApi(data).then(res => {
      return res
    }).catch(err => {
      throw err
    })
  }
}

export const deleteInvoice = (id) => {
  return (dispatch) => {
    let data = {
      method: 'DELETE',
      url: `/rest/invoice/delete?id=${id}`
    }

    return authApi(data).then(res => {
      return res
    }).catch(err => {
      throw err
    })
  }
}