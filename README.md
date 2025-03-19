# Git Hours Spent

Git Hours Spent is a CLI application that estimates the amount of time spent working on a project based on the Git commit history. It groups commits into sessions using configurable time thresholds and can filter commits based on work hours and weekends.

## Features

- **Estimate Work Time:** Calculates total work hours based on intervals between commits.
- **Session Grouping:** Groups commits into sessions if they occur within a configurable time frame.
- **Work Hour Filtering:** Includes only commits made during specified work hours (default: 09:00-17:00).
- **Weekend Exclusion:** Optionally skips commits made on weekends.
- **Configurable Parameters:** Easily adjust thresholds, work start/end times, and repository path via command-line options.

## Installation

To install the package globally, run:

```bash
npm install -g git-hours-spent
```

## Usage

After installing, run the command in any Git repository directory:

```bash
git-hours-spent
```

### CLI Options

- `-m, --max-diff <minutes>`: Maximum minutes between commits in the same session (default: 120).
- `-f, --first-add <minutes>`: Extra minutes added for the first commit in a session (default: 120).
- `-s, --work-start <time>`: Work start time in `HH:mm` format (default: 09:00).
- `-e, --work-end <time>`: Work end time in `HH:mm` format (default: 17:00).
- `--skip-weekends`: Exclude commits on weekends.
- `-p, --path <repoPath>`: Path to the Git repository (default: current directory).

### Examples

Estimate work hours using default settings:

```bash
git-hours-spent
```

Estimate work hours with a maximum 3-hour gap between commits and a 3-hour extra addition for the first commit:

```bash
git-hours-spent --max-diff 180 --first-add 180
```

Analyze a specific repository path and exclude weekends:

```bash
git-hours-spent --path /path/to/your/repo --skip-weekends
```

## Contributing

Contributions are welcome! Please fork this repository and submit your pull requests.

## License

This project is licensed under the MIT License.
