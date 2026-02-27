
export interface MeetingTotals {
  creditdisponible?: number,
  credit?: number,
  debit?: number,
  balance?: number,
  loans?: number,
  reimbursements?: number,
  transactions?: any
};

export interface Transaction {
  meetingid: any,
  accountid: any,
  parameterid: any,
  parametername: any,
  amount: any,
  categories?: any,
  notes?: any,
  inputdate: any
}
