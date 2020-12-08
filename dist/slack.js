"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToSlack = void 0;
const axios_1 = __importDefault(require("axios"));
const postToSlack = async (data, id) => {
    if (data.dev)
        return;
    console.log("Triggering webhook");
    const blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: data.realEstate
                    ? `Real estate manager lead from *${data.name || "a user"}* (${data.email})`
                    : `*${data.name || "A user"}* (${data.email}) just signed up for a *${data.numberOfRooms}-room* apartment in *${data.locationName}* for a period of *${data.period * 12} months* with a budget of *${data.budget} CHF/month*.`,
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
    await axios_1.default.post("https://slack.com/api/chat.postMessage", {
        channel: "C016A9X32KG",
        blocks,
    }, {
        headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_ACCESS_TOKEN}`,
        },
    });
};
exports.postToSlack = postToSlack;
//# sourceMappingURL=slack.js.map