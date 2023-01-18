#!/bin/zsh
workspaces=("packages" "sites")
paths=()
for folder in "${workspaces[@]}"; do
    subfolders=($folder/*/)
    for subfolder in "${subfolders[@]}"; do
        paths+=($subfolder)
    done
done

for i in "${paths[@]}";
do
  if [ -d "$i" ]
	then
	   cd $i
		 pnpm upgrade
		 pnpm test:ci
		 cd ../..
	fi
done
