cd "$(dirname $0)" || exit

TARGET_PROJECTS=("indyscan-storage" "indyscan-txtype" "indyscan-daemon" "indyscan-daemon-ui" "indyscan-api" "indyscan-api-client" "indyscan-webapp" "indypool-client" )

for project in "${TARGET_PROJECTS[@]}";
do
  echo "Installing $project"
  cd "../$project" && npm audit fix
done
