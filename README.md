# Discord On-Call Announcer

A Google Cloud Function that announces when a new support engineer is on-call and updates the @SupportEngineer role in Discord.

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the function locally](#running-the-function-locally)
- [Deployment](#deployment)
- [Testing the function in production](#testing-the-function-in-production)
- [Checking the logs](#checking-the-logs)

## Prerequisites

- Node.js (>=22.x)
- pnpm (>=9.x)

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/mento-protocol/discord-on-call-announcer.git
   cd discord-on-call-announcer
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Configure environment variables:

   - Create a `.env` file in the root directory via `cp .env.example .env`
   - Add the necessary environment variables for VictorOps and Discord services.

4. Build the project:

   ```sh
   pnpm run build
   ```

## Running the function locally

```sh
# Dev mode with hot-reloading via nodemon
pnpm dev
```

Now trigger the function by sending a request to it:

```sh
pnpm test
```

## Deployment

### First time deployment

If you are deploying the function for the first time, then please run:

```sh
pnpm deploy
```

This will first create the PubSub topic, then the Cloud Function, and lastly the Cloud Scheduler job that will trigger the function on a weekly basis.

### Deploying Updates

To deploy only the function, run:

```sh
pnpm deploy:function
```

If you want to change the schedule on which the function runs, update the `deploy:scheduler` npm task with the desired cronjob frequency and then run:

```sh
pnpm deploy:scheduler
```

## Testing the function in production

To manually trigger the deployed function in production, run:

```sh
# Will fire a PubSub event that the function will catch and trigger
pnpm test:prod
```

## Checking the logs

To view the last logs in your local terminal, run:

```sh
pnpm run logs
```

To get a URL to the full logs in the Google Cloud Console, run:

```sh
pnpm run logs:url
```
