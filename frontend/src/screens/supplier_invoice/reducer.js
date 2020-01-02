import { SUPPLIER_INVOICE } from 'constants/types'

const initState = {
  supplier_invoice_list: [],
  project_list : [],
  contact_list : [],
  status_list : [],
  currency_list : [],
  vat_list : [],
  supplier_list: []
}

const SupplierInvoiceReducer = (state = initState, action) => {
  const { type, payload} = action
  
  switch(type) {

    case SUPPLIER_INVOICE.SUPPLIER_INVOICE_LIST:
      return {
        ...state,
        supplier_invoice_list: Object.assign([], payload.data)
      }

      case SUPPLIER_INVOICE.PROJECT_LIST:
      return {
        ...state,
        project_list: Object.assign([], payload.data)
      }

      case SUPPLIER_INVOICE.CONTACT_LIST:
      return {
        ...state,
        contact_list: Object.assign([], payload.data)
      }

      case SUPPLIER_INVOICE.STATUS_LIST:
      return {
        ...state,
        status_list: Object.assign([], payload.data)
      }
      
      case SUPPLIER_INVOICE.CURRENCY_LIST:
      return {
        ...state,
        currency_list: Object.assign([], payload.data)
      }

      case SUPPLIER_INVOICE.SUPPLIER_LIST:
        return {
          ...state,
          supplier_list: Object.assign([], payload.data)
        }

      case SUPPLIER_INVOICE.VAT_LIST:
      return {
        ...state,
        vat_list: Object.assign([], payload.data)
      }


    default:
      return state
  }
}

export default SupplierInvoiceReducer