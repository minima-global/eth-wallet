export interface UserAccount {
    nickname: string;
    address: string;
    current: boolean;
    privatekey?: string;
    type: 'normal' | 'ledger' | 'normalmain';
    bip44Path?: string; // required for ledger accounts
  }