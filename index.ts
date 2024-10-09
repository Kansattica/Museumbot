import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

interface Postable
{
	images: string[];
	body: string;
}

dotenv.config();

// Create a Bluesky Agent 
const agent = new BskyAgent({
    service: 'https://bsky.social',
  })

function get_shuffle_posts() : Postable[]
{
	const posts = parse(readFileSync('./posts.csv', 'utf-8'), {
		columns: true,
		skip_empty_lines: true
	}).map((post) => {
		"images": post.filename.split(" AND ");
		"body": post.description;
	});

	return posts;
}

async function main() {

	const posts_to_make = get_shuffle_posts();

	console.log(posts_to_make);

	return;
	

    await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD!})
    await agent.post({
        text: "test time for you 🦨",
		langs: ["en-US"],
		createdAt: new Date().toISOString()
    });
    console.log("Just posted!")
}

main();

// Run this on a cron job
//const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
//const scheduleExpression = '0 */3 * * *'; // Run once every three hours in prod

//const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing

//job.start();
