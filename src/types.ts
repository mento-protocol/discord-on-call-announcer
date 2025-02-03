export interface VictorOpsResponse {
  teamsOnCall: Array<{
    team: VictorOpsTeam
    oncallNow: Array<{
      escalationPolicy: VictorOpsEscalationPolicy
      users: Array<{
        onCalluser: VictorOpsUser
      }>
    }>
  }>
}

interface VictorOpsTeam {
  name: string
  slug: string
}

interface VictorOpsUser {
  username: string
}

interface VictorOpsEscalationPolicy {
  name: string
  slug: string
}
