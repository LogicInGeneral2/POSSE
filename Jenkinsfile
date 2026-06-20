pipeline {
    agent any

    environment {
        // Credentials
        DOCKERHUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_USERNAME = 'sirroastedpotato' 
        
        // Grabs the first 7 characters of the GitHub commit hash for versioning
        GIT_SHORT_HASH = "${env.GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 1. Parallel Execution of Linting
        stage('Code Quality') {
            parallel {
                stage('Backend (Django) Linting') {
                    steps {
                        echo "Running Flake8 Linting via Docker..."
                        // 1. Spins up a temporary Python Alpine container
                        // 2. Mounts your backend workspace code into it
                        // 3. Installs flake8 and runs the scan, then deletes itself
                        sh """
                        docker run --rm -v ${WORKSPACE}/backend:/app -w /app python:3.12-alpine \
                            sh -c "pip install flake8 && flake8 ."
                        """
                    }
                }
                stage('Frontend (React) Linting') {
                    steps {
                        echo "Running ESLint via Docker..."
                        // 1. Spins up a temporary Node Alpine container
                        // 2. Mounts your frontend workspace code into it
                        // 3. Runs npm install, then runs the linter, then deletes itself
                        sh """
                        docker run --rm -v ${WORKSPACE}/frontend:/app -w /app node:20-alpine \
                            sh -c "npm install && npm run lint"
                        """
                    }
                }
            }
        }

        // 2. Code Quality check
        stage('SonarQube Code Analysis') {
            steps {
                echo "Starting SonarQube Scan..."
                script {
                    def scannerHome = tool 'sonar-scanner'
                    // Send the code to SonarQube
                    withSonarQubeEnv('sonar-server') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        // 3. Quality Gate Check
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // 4. Parallel Building of Docker Images
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            // We build TWO tags: the specific commit hash AND 'latest'
                            sh """
                            docker build \
                                -t ${DOCKER_USERNAME}/posse-backend:${GIT_SHORT_HASH} \
                                -t ${DOCKER_USERNAME}/posse-backend:latest .
                            """
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh """
                            docker build \
                                -t ${DOCKER_USERNAME}/posse-frontend:${GIT_SHORT_HASH} \
                                -t ${DOCKER_USERNAME}/posse-frontend:latest .
                            """
                        }
                    }
                }
            }
        }

        // 5. DevSecOps: Image Vulnerability Scanning
        stage('Security Scan (Trivy)') {
            steps {
                echo "Scanning images for high/critical vulnerabilities..."
                
                // Backend Scan
                sh """
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image \
                    --no-progress \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    ${DOCKER_USERNAME}/posse-backend:${GIT_SHORT_HASH}
                """
                
                // Frontend Scan
                sh """
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image \
                    --no-progress \
                    --severity HIGH,CRITICAL \
                    --exit-code 1 \
                    ${DOCKER_USERNAME}/posse-frontend:${GIT_SHORT_HASH}
                """
            }
        }

        // 6. Push to Docker Hub
        stage('Push to Registry') {
            steps {
                // Log in once
                sh 'echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin'
                
                // Push Backend
                sh "docker push -q ${DOCKER_USERNAME}/posse-backend:${GIT_SHORT_HASH}"
                sh "docker push -q ${DOCKER_USERNAME}/posse-backend:latest"
                
                // Push Frontend
                sh "docker push -q ${DOCKER_USERNAME}/posse-frontend:${GIT_SHORT_HASH}"
                sh "docker push -q ${DOCKER_USERNAME}/posse-frontend:latest"
            }
        }
    }

    // 7. Post-Build Actions & Notifications
    post {
        success {
            echo "Pipeline completed successfully! Images pushed to Docker Hub."
        }
        failure {
            echo "Pipeline failed! Please check the logs."
        }
        always {
            // Secure the environment and free up disk space
            sh 'docker logout'
            cleanWs()
        }
    }
}