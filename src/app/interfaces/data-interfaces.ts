
export interface MeetingTotals {
  credit?: number,
  balance?: number,
  cash?: number,
  loans?: number,
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