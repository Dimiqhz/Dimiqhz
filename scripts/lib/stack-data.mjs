const group = (label, ...clusters) => [label, clusters.flat()];

export const STACK_GROUPS = [
  group('LANGUAGES',
    ['TypeScript', 'JavaScript'],
    ['Python'],
    ['Java', 'Kotlin', 'C#', 'C++'],
    ['PHP'],
    ['Bash']),

  group('INFRA & OPS',
    ['Docker', 'Podman'],
    ['Kubernetes', 'Helm', 'Argo CD'],
    ['Terraform', 'Ansible', 'Vagrant'],
    ['Vault', 'Consul', 'Nomad'],
    ['GitHub Actions', 'Jenkins'],
    ['Prometheus', 'Grafana'],
    ['AWS', 'Azure', 'GCP', 'Cloudflare'],
    ['Nginx'],
    ['Linux', 'Ubuntu', 'Debian']),

  group('DATA',
    ['PostgreSQL', 'MySQL'],
    ['ClickHouse'],
    ['MongoDB', 'Redis'],
    ['Elasticsearch'],
    ['Kafka', 'RabbitMQ']),

  group('FRAMEWORKS & LIBRARIES',
    ['Node.js', 'Express', 'Next.js', 'React'],
    ['jQuery', 'Bootstrap', 'Sass'],
    ['Django', 'FastAPI'],
    ['Spring', '.NET'],
    ['TensorFlow'],
    ['discord.js']),

  group('TOOLS',
    ['Git', 'GitHub', 'GitLab'],
    ['Gradle', 'Maven', 'npm'],
    ['IntelliJ IDEA', 'WebStorm', 'PyCharm', 'GoLand', 'CLion', 'Rider', 'PhpStorm', 'DataGrip', 'Android Studio', 'Qodana'],
    ['Visual Studio', 'VS Code'],
    ['Postman'],
    ['Figma'],
    ['Photoshop', 'Illustrator', 'After Effects', 'Premiere'],
    ['Blender'],
    ['Notion']),
];

export const ICON_SLUGS = {
  TypeScript: 'typescript', JavaScript: 'javascript', Python: 'python', Java: 'java',
  Kotlin: 'kotlin', 'C++': 'cplusplus', 'C#': 'csharp', PHP: 'php', Bash: 'bash',

  Ansible: 'ansible', 'Argo CD': 'argocd', AWS: 'amazonwebservices', Azure: 'azure',
  Cloudflare: 'cloudflare', Consul: 'consul', Debian: 'debian', Docker: 'docker',
  GCP: 'googlecloud', 'GitHub Actions': 'githubactions', Grafana: 'grafana', Helm: 'helm',
  Jenkins: 'jenkins', Kubernetes: 'kubernetes', Linux: 'linux', Nginx: 'nginx',
  Nomad: 'nomad', Podman: 'podman', Prometheus: 'prometheus', Terraform: 'terraform',
  Ubuntu: 'ubuntu', Vagrant: 'vagrant', Vault: 'vault',

  ClickHouse: 'clickhouse', Elasticsearch: 'elasticsearch', Kafka: 'apachekafka',
  MongoDB: 'mongodb', MySQL: 'mysql', PostgreSQL: 'postgresql', RabbitMQ: 'rabbitmq',
  Redis: 'redis',

  'Next.js': 'nextjs', React: 'react', 'Node.js': 'nodejs', Express: 'express',
  Spring: 'spring', '.NET': 'dotnetcore', Django: 'django', FastAPI: 'fastapi',
  TensorFlow: 'tensorflow', Sass: 'sass', Bootstrap: 'bootstrap', jQuery: 'jquery',
  'discord.js': 'discordjs',

  Git: 'git', GitHub: 'github', GitLab: 'gitlab', Postman: 'postman', Gradle: 'gradle',
  Maven: 'maven', npm: 'npm', 'VS Code': 'vscode', 'Visual Studio': 'visualstudio',
  'IntelliJ IDEA': 'intellij', WebStorm: 'webstorm', PyCharm: 'pycharm', GoLand: 'goland',
  CLion: 'clion', Rider: 'rider', PhpStorm: 'phpstorm', DataGrip: 'datagrip',
  'Android Studio': 'androidstudio', Qodana: 'qodana',
  Figma: 'figma', Photoshop: 'photoshop', 'After Effects': 'aftereffects',
  Illustrator: 'illustrator', Premiere: 'premierepro', Blender: 'blender',
  Notion: 'notion',
};
