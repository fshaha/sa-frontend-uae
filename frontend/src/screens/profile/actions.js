import { PROFILE } from 'constants/types'
import {
  api,
  authApi,
  authFileUploadApi
} from 'utils'

export const getUserById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/user/getById?id=${_id}`
    }

    return authApi(data).then(res => {
      return res
    }).catch(err => {
      throw err
    })
  }
}

export const getCompanyById = (_id) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/company/getById?id=${_id}`
    }

    return authApi(data).then(res => {
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
          type: PROFILE.CURRENCY_LIST,
          payload: res.data
        })
      }
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
          type: PROFILE.COUNTRY_LIST,
          payload: res.data
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const getIndustryTypeList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/datalist/getIndustryTypes`
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE.INDUSTRY_TYPE_LIST,
          payload: res.data
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const getCompanyTypeList = () => {
  return (dispatch) => {
    let data = {
      method: 'get',
      url: `/rest/company/getCompaniesForDropdown`
    }
    return authApi(data).then(res => {
      if (res.status === 200) {
        dispatch({
          type: PROFILE.COMPANY_TYPE_LIST,
          payload: res.data
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const updateUser = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'post',
      url: '/rest/user/update',
      data: obj
    }
    return authFileUploadApi(data).then(res => {
      return res
    }).catch(err => {
      throw err
    })
  }
}