import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

interface CsvRow
{
	filename: string;
	description: string;
}

class Postable
{
	images: string[];
	body: string;

	constructor(filenames: string[], description: string) {
		this.images = filenames;
		this.body = description;
	}
}

dotenv.config();

// Create a Bluesky Agent 
const agent = new BskyAgent({
    service: 'https://bsky.social',
  })

function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function shuffle(list: any[]) : any[]
{
	for (let i = 0; i < list.length - 1; i++)
	{
		const pivot = getRandomInt(i, list.length);
		[list[i], list[pivot]] = [list[pivot], list[i]];
	}

	return list;
}

function get_shuffle_posts() : Postable[]
{
	return shuffle(parse(readFileSync('./posts.csv', 'utf-8'), {
		columns: true,
		skip_empty_lines: true
	}).map((post: CsvRow) => new Postable(post.filename.split(" AND "), post.description)));
}

class ShuffleState
{
	private static posts: Postable[] = get_shuffle_posts();

	static get_next_post(): Postable
	{
		if (ShuffleState.posts.length === 0)
		{
			ShuffleState.posts = get_shuffle_posts();
			console.log("Reshufflin' over here!");
		}

		// we know this can't be undefined
		return ShuffleState.posts.pop() as Postable;
	}
}

async function main() {

	const post = ShuffleState.get_next_post();

	console.log(post);

	return;

    await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD!})
    await agent.post({
        text: post.body,
		langs: ["en-US"],
		createdAt: new Date().toISOString()
    });
    console.log("Just posted!")
}

main();

// Run this on a cron job
//const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
//const scheduleExpression = '0 */3 * * *'; // Run once every three hours in prod

//const job = new CronJob(scheduleExpressionMinute, main); // change to scheduleExpressionMinute for testing

//job.start();
