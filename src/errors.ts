export class VictorOpsError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message)
    this.name = 'VictorOpsError'
  }
}

export class DiscordError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DiscordError'
  }
}
