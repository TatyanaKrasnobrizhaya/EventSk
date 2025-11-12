
#!/usr/bin/env bash
echo "$@"
MENO_HESLO="$@" docker compose up dev_cms_password --exit-code-from dev_cms_password 
docker compose --profile password down  dev_cms_password