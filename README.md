# Release Wars

Release Wars is a demo project showcasing the use of Semantic Release for automating versioning and package publishing. This project is built with Node.js and TypeScript, and uses Vite for development and testing.

## Features

- **Automated Releases**: Semantic Release automates the versioning and changelog generation based on commit messages.
- **TypeScript Support**: The project is written in TypeScript for type safety and better developer experience.
- **Vite Integration**: Vite is used for fast builds and development.
- **Testing**: Includes unit tests using Vitest.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (v7 or later)
- [Docker](https://www.docker.com/) (optional, for containerized development)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/release-wars.git
   cd release-wars
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Run tests:

   ```bash
   npm test
   ```

## Development

- **Linting**: Run `npm run lint` to check for code style issues using docker and the GitHub superlinter image.
- **Building**: Run `npm run build` to create a production build.
- **Testing**: Run `npm run test` to run the tests.
- **Starting**: Run `npm run start`to build and run the application in a container using docker.

## Semantic Release

Semantic Release is configured to automate the release process. Ensure your commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes or improvements.
