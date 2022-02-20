import { Document } from "bson";
import { WithId } from "mongodb";
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from "remix";
import client from "~/db";
import { getUserId, requireUserId } from "~/sessions";
import { Club } from "./browse";
import styles from "~/styles/events.css"

type Event = {
    _id: string,
    name: string,
    date: string,
    description: string,
    club?: {name: Club['name'], chat: Club['chat']}
}

export let loader: LoaderFunction = async ({ request }) => {
    let email = await getUserId(request);
    if (!email) throw new Response("Unauthorized", { status: 401 });
    await client.connect();
    const db = client.db("users");
    const usersWithEmail = await db.collection("users").count({email});
    if(usersWithEmail == 0) {
        throw redirect("/onboarding");
    }

    const userTemp = await db.collection("users").findOne({email});
    const user = JSON.parse(JSON.stringify(userTemp)); // I am so sorry
    const results = await db.collection("events").find().toArray();
    const records = results.map(x => JSON.parse(JSON.stringify(x)));
    console.log(records);
    return {userId: email,user,records};
  };

export default function Browse() {
    const data = useLoaderData<{userId: string, user: WithId<Document>, records: Event[]}>();
    return (
        <>
                <nav>
            <h1>
                Strike a Chord
            </h1>
            <ul>
                <li>
                    <a href="/browse">
                        Groups
                    </a>
                </li>
                <li className="active">
                <a href="/events">
                        Events
                    </a>
                </li>
            </ul>
        </nav>
        <main>
            <table>
                <tr className="th">
                    <td>
                        What's happening?
                    </td>
                    <td>
                        When is it?
                    </td>
                    <td>
                        Learn more
                    </td>
                </tr>
                {data.records.map(event => {
                    return(
                        <tr key={event._id}>
                            <td>
                            <p>{event.description}</p>
                            </td>
                            <td>
                            <p>{event.date}</p>
                            </td>
                            <td>
                                <a className="chatlink" href={event.club?.chat}>Open Slack</a>
                            </td>
                        </tr>
                    )
                })}
            </table>
        </main>
        </>
    )
}

export const links = () => {
    return [{href: styles, rel: "stylesheet"}]
}