import {
  Dashboard,
  GeneralSettings,
  VatCategory,
  Contact,
  User,
  Project,
  Product,
  Expense,
  Payment,
  Employee,
  CustomerInvoice,
  SupplierInvoice,
  Receipt,
  BankAccount,
  BankStatement,
  Taxes,
  TransactionCategory,
  UsersRoles,
  OrganizationProfile,
  Currency,
  Notification,
  DataBackup,
  Help,
  Faq,
  Profile,
  TransactionsReport,
  FinancialReport,


  CreateCustomerInvoice,
  CreateSupplierInvoice,
  CreateReceipt,
  CreateExpense,
  CreateProduct,
  CreateContact,
  CreateProject,
  CreateUser,
  CreatePayment,
  CreateBankAccount,
  CreateBankStatement,
  CreateVatCategory,
  CreateTranactionCategory,

  DetailBankAccount,
  DetailBankStatement,
  DetailCustomerInvoice,
  DetailSupplierInvoice,
  DetailReceipt,
  DetailExpense,
  DetailPayment,
  DetailContact,
  DetailProject,
  DetailProduct,
  DetailUser,
  DetailVatCategory,
  DetailTranactionCategory,

  ImportBankStatement
  
} from 'screens'

const adminRoutes = [

  // dashboard module
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard.screen
  },


  // profile module
  {
    path: '/admin/profile',
    name: 'Profile',
    component: Profile.screen
  },




  // revenue module
  {
    path: '/admin/revenue/customer-invoice/create',
    name: 'Create',
    component: CreateCustomerInvoice.screen
  },
  {
    path: '/admin/revenue/customer-invoice/detail',
    name: 'Detail',
    component: DetailCustomerInvoice.screen
  },
  {
    path: '/admin/revenue/customer-invoice',
    name: 'Customer Invoice',
    component: CustomerInvoice.screen
  },
  {
    path: '/admin/revenue/receipt/create',
    name: 'Create',
    component: CreateReceipt.screen
  },
  {
    path: '/admin/revenue/receipt/detail',
    name: 'Detail',
    component: DetailReceipt.screen
  },
  {
    path: '/admin/revenue/receipt',
    name: 'Receipt',
    component: Receipt.screen
  },
  {
    redirect: true,
    path: '/admin/revenue',
    pathTo: '/admin/revenue/customer-invoice',
    name: 'Revenue'
  },






  // expense module=
  {
    path: '/admin/expense/supplier-invoice/create',
    name: 'Create',
    component: CreateSupplierInvoice.screen
  },
  {
    path: '/admin/expense/supplier-invoice/detail',
    name: 'Detail',
    component: DetailSupplierInvoice.screen
  },
  {
    path: '/admin/expense/supplier-invoice',
    name: 'Supplier Invoice',
    component: SupplierInvoice.screen
  },
  {
    path: '/admin/expense/expense/create',
    name: 'Create',
    component: CreateExpense.screen
  },
  {
    path: '/admin/expense/expense/detail',
    name: 'Detail',
    component: DetailExpense.screen
  },
  {
    path: '/admin/expense/expense',
    name: 'Expense', 
    component: Expense.screen
  },
  {
    path: '/admin/expense/payment/create',
    name: 'Create',
    component: CreatePayment.screen
  },
  {
    path: '/admin/expense/payment/detail',
    name: 'Detail',
    component: DetailPayment.screen
  },
  {
    path: '/admin/expense/payment',
    name: 'Payment',
    component: Payment.screen
  },
  {
    redirect: true,
    path: '/admin/expense',
    pathTo: '/admin/expense/expense',
    name: 'Expense'
  },




  // bank account module
  {
    path: '/admin/bank/bank-account/create',
    name: 'Create',
    component: CreateBankAccount.screen
  },
  {
    path: '/admin/bank/bank-account/detail',
    name: 'Detail',
    component: DetailBankAccount.screen
  },
  {
    path: '/admin/bank/bank-account',
    name: 'Bank Account',
    component: BankAccount.screen
  },
  {
    path: '/admin/bank/bank-statement/import',
    name: 'Import',
    component: ImportBankStatement.screen
  },
  {
    path: '/admin/bank/bank-statement/create',
    name: 'Create',
    component: CreateBankStatement.screen
  },
  {
    path: '/admin/bank/bank-statement/detail',
    name: 'Detail',
    component: DetailBankStatement.screen
  },
  {
    path: '/admin/bank/bank-statement',
    name: 'Bank Statement',
    component: BankStatement.screen
  },
  {
    redirect: true,
    path: '/admin/bank',
    pathTo: '/admin/bank/bank-account',
    name: 'Bank'
  },




  // Taxes module
  {
    path: '/admin/taxes',
    name: 'Taxes',
    component: Taxes.screen
  },

  



  // report module
  {
    path: '/admin/report/transactions',
    name: 'Transactions', 
    component: TransactionsReport.screen
  },
  {
    path: '/admin/report/financial',
    name: 'Financial', 
    component: FinancialReport.screen
  },
  {
    redirect: true,
    path: '/admin/report',
    pathTo: '/admin/report/transactions',
    name: 'Report'
  },



  // master module
  {
    path: '/admin/master/contact/create',
    name: 'Create',
    component: CreateContact.screen
  },
  {
    path: '/admin/master/contact/detail',
    name: 'Detail',
    component: DetailContact.screen
  },
  {
    path: '/admin/master/contact',
    name: 'Contact',
    component: Contact.screen
  },
  {
    path: '/admin/master/project/create',
    name: 'Create',
    component: CreateProject.screen
  },
  {
    path: '/admin/master/project/detail',
    name: 'Detail',
    component: DetailProject.screen
  },
  {
    path: '/admin/master/project',
    name: 'Project',
    component: Project.screen
  },
  {
    path: '/admin/master/product/create',
    name: 'Create',
    component: CreateProduct.screen
  },
  {
    path: '/admin/master/product/detail',
    name: 'Detail',
    component: DetailProduct.screen
  },
  {
    path: '/admin/master/product',
    name: 'Product',
    component: Product.screen
  },
  {
    path: '/admin/master/user/create',
    name: 'Create',
    component: CreateUser.screen
  },
  {
    path: '/admin/master/user/detail',
    name: 'Detail',
    component: DetailUser.screen
  },
  {
    path: '/admin/master/user',
    name: 'User',
    component: User.screen
  },
  {
    redirect: true,
    path: '/admin/master',
    pathTo: '/admin/master/product',
    name: 'Master'
  },




  // settings module
  {
    path: '/admin/settings/general',
    name: 'General Settings',
    component: GeneralSettings.screen
  },
  {
    path: '/admin/settings/vat-category/create',
    name: 'Create',
    component: CreateVatCategory.screen
  },
  {
    path: '/admin/settings/vat-category/detail',
    name: 'Detail',
    component: DetailVatCategory.screen
  },
  {
    path: '/admin/settings/vat-category',
    name: 'Vat Category',
    component: VatCategory.screen
  },
  {
    path: '/admin/settings/transaction-category/create',
    name: 'Create',
    component: CreateTranactionCategory.screen
  },
  {
    path: '/admin/settings/transaction-category/detail',
    name: 'Detail',
    component: DetailTranactionCategory.screen
  },
  {
    path: '/admin/settings/transaction-category',
    name: 'Transaction Category',
    component: TransactionCategory.screen
  },
  {
    path: '/admin/settings/user-role',
    name: 'Users & Roles',
    component: UsersRoles.screen
  },
  {
    path: '/admin/settings/organization-profile',
    name: 'Organization Profile',
    component: OrganizationProfile.screen
  },
  {
    path: '/admin/settings/currency',
    name: 'Currencies',
    component: Currency.screen
  },
  {
    path: '/admin/settings/notification',
    name: 'Notifications',
    component: Notification.screen
  },
  {
    path: '/admin/settings/data-backup',
    name: 'Data Backup',
    component: DataBackup.screen
  },
  {
    path: '/admin/settings/help/Faq',
    name: 'Faq',
    component: Faq.screen
  },
  {
    path: '/admin/settings/help',
    name: 'Help',
    component: Help.screen
  },
  {
    redirect: true,
    path: '/admin/settings',
    pathTo: '/admin/settings/general',
    name: 'Settings'
  },





  // employee module
  {
    path: '/admin/employee',
    name: 'Employee',
    component: Employee.screen
  },





  {
    redirect: true,
    path: '/admin',
    pathTo: '/admin/dashboard',
    name: 'Admin'
  }
]

export default adminRoutes