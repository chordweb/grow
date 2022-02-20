import { Document } from "bson";
import {  WithId } from "mongodb";
import { useState } from "react";
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from "remix";
import client from "~/db";
import { getUserId, requireUserId } from "~/sessions";
import styles from "~/styles/browse.css";

export type Club = {
    _id: string,
    name: string,
    image: string,
    description: string,
    chat: string
}

export const action: ActionFunction = async ({
    request
  }) => {
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("desc");
    const image = formData.get("image");
    const chat = formData.get("chat");
    await client.connect();
    const db = client.db("users");
    await db.collection("clubs").insertOne({image,name,description,chat});
    return redirect("/browse");
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
    const results = await db.collection("clubs").find().toArray();
    const userTemp = await db.collection("users").findOne({email});
    const user = JSON.parse(JSON.stringify(userTemp)); // I am so sorry
    const clubs = await fetch("http://localhost:7070", {method:"POST", body: JSON.stringify({bio: user.bio, groups: results}), headers: {"Content-Type": "application/json"}}).then(r=>r.json()).then(j=>j.matches);
    console.log(clubs);
    // const clubs = ["621007b3217aedd8a49353fe", "62115d2fdbcf536b044c89e7"];
    const records = results.map(x => JSON.parse(JSON.stringify(x))).filter(x => clubs.length == 0 || clubs.indexOf(x._id) != -1);
    console.log(records);
    return {userId: email,user,records};
  };

export default function Browse() {
    const data = useLoaderData<{userId: string, user: WithId<Document>, records: Club[]}>();
    const [adding, setAdding] = useState(false);
    return (
        <>
        <nav>
            <h1>
                Strike a Chord
            </h1>
            <ul>
                <li className="active">
                    <a href="/browse">
                        Groups
                    </a>
                </li>
                <li>
                <a href="/events">
                        Events
                    </a>
                </li>
            </ul>
        </nav>
        <main style={{marginTop: "25px"}}>
            <ul className="groups">
            {data.records.map(club => {
                return(
                    <li key={club._id} className="group">
                        <div>
                        <div className="imgcontainer">
                            <img src={club.image}/>
                        </div>
                        <h2>{club.name}</h2>
                        <p>{club.description}</p>
                        </div>
                        <a className="chatbtn">
                            Open Slack
                        </a>
                    </li>
                )
            })}
            <li className={`group ${adding ? "adding" : "create"} place`} onClick={() => setAdding(true)}>
                {!adding && "Create a group"}
                {adding &&
                    <form method="post">
                        <div>
                        <label htmlFor="name">Group Name</label>
                        <input name="name" placeholder="Name" id="name"/>
                        <label htmlFor="image">Image URL</label>
                        <input name="image" placeholder="Image URL" id="image"/>
                        <label htmlFor="chat">Slack Channel</label>
                        <input name="chat" placeholder="Slack URL" id="chat"/>
                        <label htmlFor="desc">Description</label>
                        <textarea id="desc" name="desc" placeholder="Tell us about your group..."/>
                        </div>
                        <button type="submit">Save</button>
                    </form>
                }
            </li>
            </ul>
        </main>
        </>
    )
}

export const links = () => {
    return [{href: styles, rel: "stylesheet"}]
}