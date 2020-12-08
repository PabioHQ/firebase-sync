import axios from "axios";

export const postToSlack = async (data: any, id: string) => {
  if (data.dev) return;
  console.log("Triggering webhook");
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: data.realEstate
          ? `Real estate manager lead from *${data.name || "a user"}* (${data.email})`
          : `*${data.name || "A user"}* (${data.email}) just signed up for a *${
              data.numberOfRooms
            }-room* apartment in *${data.locationName}* for a period of *${
              data.period * 12
            } months* with a budget of *${data.budget} CHF/month*.`,
      },
    },
    data.realEstate
      ? undefined
      : {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Full lead details: https://koj.co/en-ch/admin/customers/${id}`,
          },
        },
  ];
  await axios.post(
    "https://slack.com/api/chat.postMessage",
    {
      channel: "C016A9X32KG",
      blocks,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.SLACK_BOT_ACCESS_TOKEN}`,
      },
    }
  );
};
