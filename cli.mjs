#!/usr/bin/env node

import simpleGit from "simple-git";
import moment from "moment";
import { Command } from "commander";

const program = new Command();

// Default configuration
const DEFAULT_MAX_SESSION_DIFF_MINUTES = 120; // 2 hours between commits in the same session
const DEFAULT_FIRST_COMMIT_ADDITION_MINUTES = 120; // 2 extra hours for the first commit
const DEFAULT_WORK_START = "09:00";
const DEFAULT_WORK_END = "17:00";

// CLI options
program
  .option(
    "-m, --max-diff <minutes>",
    "Max minutes between commits in the same session",
    DEFAULT_MAX_SESSION_DIFF_MINUTES
  )
  .option(
    "-f, --first-add <minutes>",
    "Extra minutes added for the first commit in a session",
    DEFAULT_FIRST_COMMIT_ADDITION_MINUTES
  )
  .option(
    "-s, --work-start <time>",
    "Work start time (HH:mm)",
    DEFAULT_WORK_START
  )
  .option("-e, --work-end <time>", "Work end time (HH:mm)", DEFAULT_WORK_END)
  .option("--skip-weekends", "Exclude commits on weekends", false)
  .option("-p, --path <repoPath>", "Path to Git repository", ".")
  .parse(process.argv);

const options = program.opts();
const MAX_SESSION_DIFF_MINUTES = parseInt(options.maxDiff, 10);
const FIRST_COMMIT_ADDITION_MINUTES = parseInt(options.firstAdd, 10);
const WORK_START = options.workStart;
const WORK_END = options.workEnd;
const SKIP_WEEKENDS = options.skipWeekends;
const REPO_PATH = options.path;

const git = simpleGit(REPO_PATH);

/**
 * Retrieve all commits and filter them by work hours and (optionally) weekends.
 */
async function getFilteredCommits() {
  const log = await git.log();
  return log.all
    .map((commit) => ({
      date: moment(commit.date),
      message: commit.message,
      author: commit.author_email,
    }))
    .filter((commit) => {
      // Filter by work hours: check if the commit falls within the specified work period
      const commitTime = commit.date.format("HH:mm");
      const workStart = moment(WORK_START, "HH:mm");
      const workEnd = moment(WORK_END, "HH:mm");
      const commitMoment = moment(commitTime, "HH:mm");
      const isWithinWorkHours = commitMoment.isBetween(
        workStart,
        workEnd,
        null,
        "[]"
      );

      // Filter weekends: Saturday (6) and Sunday (0)
      const dayOfWeek = commit.date.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWithinWorkHours) return false;
      if (SKIP_WEEKENDS && isWeekend) return false;
      return true;
    });
}

/**
 * Group commits into sessions based on a time interval.
 * If the time between commits is less than MAX_SESSION_DIFF_MINUTES, they are considered part of the same session.
 */
function estimateWorkHours(commits) {
  if (commits.length < 2) return 0;

  // Sort commits chronologically
  commits.sort((a, b) => a.date - b.date);

  let totalHours = 0;
  let sessionStart = commits[0].date;

  for (let i = 1; i < commits.length; i++) {
    const diffMinutes = commits[i].date.diff(commits[i - 1].date, "minutes");

    // If the time difference is too large, consider the previous block as one session
    if (diffMinutes > MAX_SESSION_DIFF_MINUTES) {
      totalHours += moment
        .duration(commits[i - 1].date.diff(sessionStart))
        .asHours();
      // Start a new session
      sessionStart = commits[i].date;
    }
  }

  // Add the last session
  totalHours += moment
    .duration(commits[commits.length - 1].date.diff(sessionStart))
    .asHours();

  // Add an estimate for the first commit in each session
  totalHours += FIRST_COMMIT_ADDITION_MINUTES / 60;

  return Math.round(totalHours);
}

(async () => {
  try {
    const commits = await getFilteredCommits();
    if (commits.length === 0) {
      console.log("No commits found within the specified work hours.");
      process.exit(0);
    }
    const totalHours = estimateWorkHours(commits);
    console.log(`Estimated work time: ${totalHours} hours`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
