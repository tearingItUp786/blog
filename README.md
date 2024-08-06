# Tarn's personal blog!

## Requirements

In order to get the repository up and running, you'll need the following
prerequisites.

- [Docker](https://www.docker.com/) - used for our redis cache
- Node - the current version is pinned via Volta

## Setup

Create a `.env` file based on the `env.example`.

## Commands

- `npm run dev` - get the dev server up and running on port 8080. We chose this
  port over the default because that's the port that fly wants to use! The
  `predev` command will run clean and try to start up docker!
- `npm run clean` - removes all the artifacts related to the build
