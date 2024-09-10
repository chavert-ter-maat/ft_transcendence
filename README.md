# ft_transcendence

## Summary

Welcome to the **ft_transcendence** project! This project involves creating a dynamic website for an online Pong contest, incorporating various web technologies and addressing several technical aspects.

**Version:** 12.1

## Contents

- [Preamble](#preamble)
- [Mandatory Part](#mandatory-part)
  - [Overview](#overview)
  - [Security Concerns](#security-concerns)
  - [User Account](#user-account)
  - [Chat](#chat)
  - [Game](#game)

## Preamble

This project is an opportunity to apply knowledge of web development in a novel context. The website will allow users to engage in real-time multiplayer Pong games, chat, and manage their profiles.

## Mandatory Part

### Overview

The task is to create a website that allows users to play Pong with others. The website includes a user-friendly interface, chat functionality, and real-time multiplayer gaming.

#### Requirements:

- **Backend:** Developed with NestJS.
- **Frontend:** Built using a TypeScript framework of choice.
- **Database:** PostgreSQL.
- **Application Type:** Single-page application with support for browser navigation (Back and Forward buttons).
- **Compatibility:** Latest stable versions of Google Chrome and an additional web browser of choice.
- **Error Handling:** No unhandled errors or warnings should be present.
- **Deployment:** All components should be launched with a single command: `docker-compose up --build`.

Note: When using Docker in rootless mode on Linux, ensure Docker runtime files are located in `/goinfre` or `/sgoinfre`, and avoid "bind-mount volumes" if non-root UIDs are used.

### Security Concerns

- **Password Storage:** All passwords must be hashed using a strong algorithm.
- **Protection:** Implement protection against SQL injections and server-side validation for all user inputs.
- **Sensitive Information:** Store credentials, API keys, and environment variables in a `.env` file and ensure it is ignored by version control (e.g., via `.gitignore`).

### User Account

- **Authentication:** Users must log in using the OAuth system of 42 intranet.
- **Profile Management:** Users can select a unique name, upload an avatar (or use a default one), and enable two-factor authentication.
- **Friends and Status:** Users can add friends, view their status (online, offline, in a game), and access match history and stats (wins, losses, ladder level, achievements).

### Chat

- **Channel Management:** Users can create public, private, or password-protected channels.
- **Direct Messaging:** Users can send direct messages, block other users, and manage channel membership.
- **Channel Administration:** Channel owners can set passwords, manage administrators, and perform moderation actions (kick, ban, mute).
- **Game Invitations:** Users can invite others to play Pong through the chat interface.
- **Profile Access:** Users can access profiles through the chat interface.

### Game

- **Gameplay:** Users should be able to play live Pong games against others.
- **Matchmaking:** Implement a matchmaking system where users join a queue and get matched with opponents.
- **Customization:** Provide options for game customization (e.g., power-ups, different maps) while offering a default version of the game.
- **Responsiveness:** Ensure the game is responsive and provides a good user experience, handling network issues like disconnections and lag.

---

Feel free to adjust the content or format as needed for the project!
