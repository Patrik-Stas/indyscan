function bump () {
  local project_directory="$1"
  local new_version="$2"
  jq ".version = \"$new_version\"" "$project_directory/package.json" > "$project_directory/new_package.json" && mv "$project_directory/new_package.json" "$project_directory/package.json"
}

cd "$(dirname $0)" || exit

NEW_VERSION="4.0.0-dev"
TARGET_PROJECTS=("indyscan-storage" "indyscan-txtype" "indyscan-daemon" "indyscan-daemon-ui" "indyscan-api" "indyscan-api-client" "indyscan-webapp" "indypool-client" )

for project in "${TARGET_PROJECTS[@]}";
do
  echo "Bumping $project to version $NEW_VERSION"
  bump "../$project" "$NEW_VERSION"
done
