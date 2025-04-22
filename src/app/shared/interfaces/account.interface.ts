export interface Account extends DraftAccount {
  readonly id: string;
}

export interface DraftAccount {
  name: string;
  type: string;
  amount: number;
}
