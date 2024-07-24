export interface EntityAttributes {
  id: number,
}

export interface Entity<EA extends EntityAttributes> {
  state: EA,
}