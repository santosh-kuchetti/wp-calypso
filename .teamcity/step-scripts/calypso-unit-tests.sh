#!/bin/bash
set -o nounset
set -o pipefail
shopt -s nullglob

tmp_dir=$(mktemp -d)

# "Fun hack" to flag when a cmd exited with non-zero exit code. If this file is
# created during the script, then we know at least one command failed and can exit
# the script. We do this because global variables can't be modified in subshells,
# and if we exit immediately on non-zero codes, we loose visibility into the output.
EXIT_STATUS_FLAG="$tmp_dir/exit-status.flag"
rm -f $EXIT_STATUS_FLAG

# Echos the message to teamcity if we're running in teamcity. Useful for service messages.
function tc_msg {
	if [ -n "${TEAMCITY_VERSION:+true}" ] ; then
		echo $1
	fi
}

function run_cmd {
	cmd="$1"
	name="${2-$1}"
	start=$(date +%s)

	stdout="$tmp_dir/$name-stdout.txt"
	stderr="$tmp_dir/$name-stderr.txt"

	echo "STARTING command: $name"
	eval "$cmd" 2> "$stderr" > "$stdout"
	exit_code=$?
	end=$(date +%s)

	echo -e "\nFINISHED command: $name in $((end-start))s. Exit code: $exit_code."
	
	tc_msg "##teamcity[blockOpened name='$name' description='Command output for $name']"
	if [ -s "$stdout" ] ; then
		echo -e "---------> Stdout:\n"
		cat "$stdout"
	fi

	if [ -s "$stderr" ] ; then
		echo -e "---------> Stderr:\n"
		cat "$stderr" >&2
	fi

	if [ $exit_code -ne 0 ]; then
		touch $EXIT_STATUS_FLAG
	fi

	tc_msg "##teamcity[blockClosed name='$name']"
}

function run_cmds {
	cmds=$1
	start=$(date +%s)

	# Run the commands in parallel, then wait for them to finish.
	for cmd in ${cmds[@]}; do
		run_cmd $cmd &
	done
	wait

	end=$(date +%s)
	echo "Finished running $cmds in $((end-start))s."

	if [ -f "$EXIT_STATUS_FLAG" ] ; then
		echo "At least one command failed. Exiting."
		exit 1
	fi
}

function prevent_uncommitted_changes {
	# Check for uncommitted changes
	export NODE_ENV="test"

	# Prevent uncommited changes
	DIRTY_FILES=$(git status --porcelain 2>/dev/null)
	if [ ! -z "$DIRTY_FILES" ]; then
		echo "Repository contains uncommitted changes: "
		echo "$DIRTY_FILES"
		echo "You need to checkout the branch, run 'yarn' and commit those files."
		return 1
	fi
}

function prevent_duplicated_packages {
	# Duplicated packages
	if ! DUPLICATED_PACKAGES=$(
		set +e
		yarn dedupe --check
	); then
		echo "Repository contains duplicated packages: "
		echo ""
		echo "$DUPLICATED_PACKAGES"
		echo ""
		echo "To fix them, you need to checkout the branch, run 'yarn dedupe',"
		echo "verify that the new packages work and commit the changes in 'yarn.lock'."
		return 1
	else
		echo "No duplicated packages found."
	fi
}



# # Couple short tests:
cmds=(prevent_uncommitted_changes prevent_duplicated_packages)
run_cmds $cmds

# #### Run Type Checks
# export NODE_ENV="test"

# echo "STARTING TSC"

# # Find all ts config files:
# ts_configs=(packages/*/tsconfig.json)
# ts_configs+=(apps/editing-toolkit/tsconfig.json)
# ts_configs+=(client/tsconfig.json)
# ts_configs+=(test/e2e/tsconfig.json)

# for config in "${ts_configs[@]}"; do
# 	echo "Starting tsc for $config..."
# 	yarn tsc --build $config &
# done

# # Waits for all tsc background jobs to finish
# # wait
# # echo "DONE WITH ALL TSC"

# #### Run unit tests
# unset NODE_ENV
# unset CALYPSO_ENV

# # Run this suite by itself, since it's very large.
# yarn test-client --maxWorkers=$JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent &

# # Run these in parallel, since they're smaller.
# yarn test-server --maxWorkers=$JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent &
# yarn test-packages --maxWorkers=$JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent &
# yarn test-build-tools --maxWorkers=$JEST_MAX_WORKERS --ci --reporters=default --reporters=jest-teamcity --silent &
# yarn workspaces foreach --verbose --parallel run storybook --ci --smoke-test &

# wait
