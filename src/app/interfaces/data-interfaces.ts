
export interface MeetingTotals {
  newcreditdisponible?: number,
  newbalance?: number,
  credit?: number,
  debit?: number,
  loans?: number,
  loan_notes?: string,
  reimbursements?: number,
  transactions?: any
};

export interface Transaction {
  idmeeting: any,
  idaccount: any,
  idparameter: any,
  parametername: any,
  amount: any,
  categories?: any,
  notes?: any,
  inputdate: any
}
