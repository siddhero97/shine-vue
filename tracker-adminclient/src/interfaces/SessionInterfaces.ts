
// @TODO are these interfaces necessary?
// Once we move the interfaces in sequelize to a separate folder,
// should we just reference the interface from there? (Bad coupling)

export interface RawAuthenticationRequest {
  mobilePhone: string,
  password: string
}

export interface RawSessionResponse {
  accessToken: string,
  refreshToken: string,
  session: Session,
}

export interface Session {
  userId: number,
  userDisplayName: string,
  role?: string, // @TODO require a role later on
}