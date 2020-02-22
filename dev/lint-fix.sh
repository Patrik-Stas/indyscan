cd "$(dirname $0)" || exit

TARGET_PROJECTS=("indyscan-storage" "indyscan-txtype" "indyscan-daemon" "indyscan-api" "indyscan-api-client" "indyscan-webapp")

for project in "${TARGET_PROJECTS[@]}";
do
  echo "Linting and fixing $project"
  cd "../$project" && npm run lint:fix
done
