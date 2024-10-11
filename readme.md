# CloudLaunch

### Description

Developed an advanced deployment pipeline component for Vercel that automated the deployment process of any project from a Git repository. This component ensured that each project was live with a unique link upon deployment and allowed for custom domain assignments. By streamlining the deployment workflow, it enhanced efficiency and ease of use for developers, providing seamless integration and immediate accessibility to their projects.

### Key Features
- **Automated Builds**: Clones repositories, builds projects in Docker, and stores the build in S3.
- **Containerized Deployments**: Provides isolated builds for enhanced security and reliability.
- **Domain Customization**: Offers routing through custom subdomains via a reverse proxy, keeping S3 URLs hidden.

### Services
- **API Server (`api-server`)**: Handles REST API requests.
- **Build Server (`build-server`)**: Clones repositories, builds Docker images, and pushes the build artifacts to S3.
- **S3 Reverse Proxy (`s3-reverse-proxy`)**: Routes requests from custom domains/subdomains to S3-hosted static assets.

### Configuration Details

- **AWS ECR**: Used for storing the Docker image from `build-server`.
- **AWS S3**: Stores the static build output for each deployment.
- **AWS ECS**: Manages the task definitions and container clusters for running the services.
- **Docker**: Used to build and run isolated containers for the `build-server`.

### Environment Variables
Ensure the following environment variables are set for proper configuration:

- **`API_PORT`**: Port on which the API server will run (default: `9000`).
- **`SOCKET_PORT`**: Port for the socket server (default: `9002`).
- **`PROXY_PORT`**: Port for the reverse proxy server (default: `8000`).
- **`AWS_ACCESS_KEY_ID`**: AWS access key for authenticating services.
- **`AWS_SECRET_ACCESS_KEY`**: AWS secret access key for secure operations.
- **`TASK_ARN`**: ARN of the task definition running the build server.
- **`CLUSTER_ARN`**: ARN of the ECS cluster managing tasks.
- **`S3_BUCKET`**: S3 bucket name where build artifacts will be stored.

### Local Setup

1. Install dependencies for all services:
   ```bash
   npm install
2. Build and push the `build-server` Docker image to AWS ECR:
   ```bash
   docker build -t <your-ecr-repo-url> .
   docker push <your-ecr-repo-url>
3. Configure and start the api-server by setting the environment variables (e.g., TASK ARN, CLUSTER ARN).
4. Start the api-server and s3-reverse-proxy using node index.js

### Demo

https://github.com/Devang2304/CloudLaunch/assets/69463638/b7c44ec5-36ea-4209-abb6-4478c71a1461



