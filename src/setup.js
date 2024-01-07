import fs from 'fs';
import YAML from 'js-yaml';
import inquirer from 'inquirer';

async function getUserInput() {
  const services = {};

  // Prompt the user for environment variables
  const { postgresUser, postgresPassword, postgresDb } = await inquirer.prompt([
    {
      type: 'input',
      name: 'postgresUser',
      message: 'Enter PostgreSQL username:',
    },
    {
      type: 'password',
      name: 'postgresPassword',
      message: 'Enter PostgreSQL password:',
    },
    {
      type: 'input',
      name: 'postgresDb',
      message: 'Enter PostgreSQL database name:',
    },
  ]);

  // Prompt the user for the Nest.js application port
  const { nestAppPort } = await inquirer.prompt([
    {
      type: 'input',
      name: 'nestAppPort',
      message: 'Enter port for the Nest.js application:',
      default: 3005,
    },
  ]);

  // Prompt the user for the Nest.js application port
  const { postgresPort } = await inquirer.prompt([
    {
      type: 'input',
      name: 'postgresPort',
      message: 'Enter port for the Postgres DB:',
      default: 5432,
    },
  ]);

  services['nest-backend'] = {
    build: {
      context: '.',
      dockerfile: 'thebinod7/nest-demo',
      target: 'development',
    },
    command: 'npm run dev',
    depends_on: ['postgres-db'],
    volumes: ['.:/usr/src/app', '/usr/src/app/node_modules'],
    ports: [`${nestAppPort}:3001`],
    environment: {
      POSTGRES_USER: postgresUser,
      POSTGRES_PASSWORD: postgresPassword,
      POSTGRES_DB: postgresDb,
    },
  };

  services['postgres-db'] = {
    image: 'postgres:13',
    volumes: ['postgres_data:/data/db'],
    ports: [`${postgresPort}:3001`],
    environment: {
      POSTGRES_USER: postgresUser,
      POSTGRES_PASSWORD: postgresPassword,
      POSTGRES_DB: postgresDb,
    },
  };

  return services;
}

async function generateDockerCompose() {
  // Get user input for services
  const userServices = await getUserInput();

  // Create the dynamic Docker Compose configuration
  const dynamicConfig = {
    version: '3',
    services: userServices,
    volumes: {
      postgres_data: {},
    },
  };

  // Convert the configuration to YAML
  const composeYaml = YAML.dump(dynamicConfig);

  // Write the YAML to a file (e.g., docker-compose.yml)
  const outputFilePath = 'docker-compose.yml';
  fs.writeFileSync(outputFilePath, composeYaml);

  console.log(`Docker Compose file generated at '${outputFilePath}'`);
}

// Call the main function to start the process
generateDockerCompose();
