import { getInput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";
import { config } from "dotenv";
import { credential, firestore, initializeApp, ServiceAccount } from "firebase-admin";
import { postToSlack } from "./slack";
config();

const token = getInput("token") || process.env.GH_PAT || process.env.GITHUB_TOKEN;
const FIREBASE_SERVICE_ACCOUNT: ServiceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT || ""
);
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

initializeApp({
  credential: credential.cert(FIREBASE_SERVICE_ACCOUNT),
  databaseURL: FIREBASE_DATABASE_URL,
});

const subscribers = firestore().collection("subscribers-v2");

export const run = async () => {
  if (!token) throw new Error("GitHub token not found");
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  const octokit = getOctokit(token);

  const runs = await octokit.actions.listWorkflowRunsForRepo({ owner, repo, status: "completed" });
  const lastRun = runs.data.workflow_runs.find((run) => run.workflow_id === 4116102);
  let lastDate = new Date("1970-01-01");
  if (lastRun) lastDate = new Date(lastRun.created_at);

  console.log("Last run was", lastDate);

  const docs = await subscribers.get();
  docs.forEach((doc) => {
    if (doc.updateTime.toDate().getTime() > lastDate.getTime()) {
      console.log("Got doc", doc.id);
      const data = doc.data();
      postToSlack(data, doc.id);
    }
  });

  console.log("All done!");
};

run()
  .then(() => {})
  .catch((error) => {
    console.error("ERROR", error);
    setFailed(error.message);
  });
