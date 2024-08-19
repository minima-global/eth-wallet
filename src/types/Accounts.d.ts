export interface UserAccount {
    nickname: string;
    address: string;
    current: boolean;
    privatekey?: string;
    type: 'normal' | 'ledger';
    bip44Path?: string; // required for ledger accounts
  }