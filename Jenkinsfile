pipeline {
    agent { label 'containerd' }

    options {
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        APP_NAME = 'rejlers-hrms-frontend'
        NAMESPACE = 'prod'
        VITE_API_URL = 'https://biztras-test.odoo.com'
        BUILDKIT_HOST = 'unix:///run/buildkit/buildkitd.sock'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
                script {
                    def commit = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
                    env.IMAGE = "${env.APP_NAME}:${commit}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Check infrastructure') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-secret', variable: 'KUBECONFIG')]) {
                    sh '''
                        set -eu
                        command -v nerdctl
                        command -v kubectl
                        command -v sed
                        nerdctl --namespace k8s.io info >/dev/null
                        kubectl get namespace "$NAMESPACE" -o name
                        kubectl --namespace jenkins get gateways.networking.istio.io jenkins-gateway -o name
                    '''
                    script {
                        // A local Kubernetes container proves which node owns the image store.
                        env.KUBE_NODE_HOSTNAME = sh(returnStdout: true, script: '''
                            set -eu
                            container_ids=$(nerdctl --namespace k8s.io ps --quiet \
                                --filter label=io.kubernetes.pod.uid)
                            container_id=$(printf '%s\\n' "$container_ids" | sed -n '1p')
                            if [ -z "$container_id" ]; then
                                echo 'No running Kubernetes containers in local containerd. Use the Kubernetes node runtime socket.' >&2
                                exit 1
                            fi
                            pod_namespace=$(nerdctl --namespace k8s.io inspect --format \
                                '{{index .Config.Labels "io.kubernetes.pod.namespace"}}' "$container_id")
                            pod_name=$(nerdctl --namespace k8s.io inspect --format \
                                '{{index .Config.Labels "io.kubernetes.pod.name"}}' "$container_id")
                            pod_uid=$(nerdctl --namespace k8s.io inspect --format \
                                '{{index .Config.Labels "io.kubernetes.pod.uid"}}' "$container_id")
                            pod_info=$(kubectl --namespace "$pod_namespace" get pod "$pod_name" \
                                -o jsonpath='{.metadata.uid}{" "}{.spec.nodeName}')
                            if [ "${pod_info%% *}" != "$pod_uid" ]; then
                                echo 'Local container does not match the Kubernetes pod UID. Verify kubeconfig targets this cluster.' >&2
                                exit 1
                            fi
                            node_name=${pod_info#* }
                            if [ -z "$node_name" ]; then
                                echo 'Local pod has no assigned Kubernetes node.' >&2
                                exit 1
                            fi
                            kubectl get node "$node_name" \
                                -o go-template='{{index .metadata.labels "kubernetes.io/hostname"}}'
                        ''').trim()
                        if (!(env.KUBE_NODE_HOSTNAME ==~ /[a-z0-9]([a-z0-9.-]*[a-z0-9])?/)) {
                            error('Build node has no valid kubernetes.io/hostname label.')
                        }
                        echo "Detected build node hostname: ${env.KUBE_NODE_HOSTNAME}"
                    }
                    sh '''
                        set -eu
                        node_count=$(kubectl get nodes \
                            --selector "kubernetes.io/hostname=$KUBE_NODE_HOSTNAME" \
                            -o name | wc -l)
                        if [ "$node_count" -ne 1 ]; then
                            echo 'KUBE_NODE_HOSTNAME must identify exactly one build node.' >&2
                            exit 1
                        fi
                    '''
                }
            }
        }

        stage('Build image into containerd') {
            steps {
                sh '''
                    set -eu
                    nerdctl --namespace k8s.io build \
                        --build-arg VITE_API_URL="$VITE_API_URL" \
                        --tag "$IMAGE" .
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-secret', variable: 'KUBECONFIG')]) {
                    sh '''
                        set -eu
                        mkdir -p rendered-k8s
                        sed -e "s|[$]{IMAGE}|$IMAGE|g" \
                            -e "s|[$]{KUBE_NODE_HOSTNAME}|$KUBE_NODE_HOSTNAME|g" \
                            k8s/app.yaml > rendered-k8s/app.yaml
                        kubectl --namespace "$NAMESPACE" apply \
                            --dry-run=server -f rendered-k8s/
                        kubectl --namespace "$NAMESPACE" apply -f rendered-k8s/
                        kubectl --namespace "$NAMESPACE" rollout status \
                            "deployment/$APP_NAME" --timeout=180s
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployed Rejlers HRMS: https://syncme.biztras.com/rejlershrms/'
        }
    }
}
