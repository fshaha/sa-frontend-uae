import { VAT } from 'constants/types'
import {
  api,
  authApi
} from 'utils'


// Create & Save Bat
export const createVat = (obj) => {
  return (dispatch) => {
    let data = {
      method: 'POST',
      url: `/rest/vat/save`,
      data: obj
    }

    return authApi(data).then(res => {
      return res
    }).catch(err => {
      throw err
    })
  }
}