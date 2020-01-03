import { EMPLOYEE } from 'constants/types'
import {
  api,
  authApi
} from 'utils'

export const getEmployeeList = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'GET',
      url: `/rest/employee/getList?name=${obj.name}&email=${obj.email}&pageNo=${obj.pageNo}&pageSize=${obj.pageSize}`
    }

    return authApi(data).then(res => {
      dispatch({
        type: EMPLOYEE.EMPLOYEE_LIST,
        payload: res.data
      })
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
          type: EMPLOYEE.CURRENCY_LIST,
          payload: res.data
        })
      }
    }).catch(err => {
      throw err
    })
  }
}

export const removeBulkEmployee = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'delete',
      url: 'rest/employee/deletes',
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
