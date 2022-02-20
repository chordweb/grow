import { ActionFunction, LoaderFunction, redirect, useLoaderData } from "remix";
import client from "~/db";
import { createUserSession, getUserId, requireUserId } from "~/sessions";
import styles from "~/styles/welcome.css";

export const action: ActionFunction = async ({
    request
  }) => {
    const email = await requireUserId(request);
    const formData = await request.formData();
    const bio = formData.get("bio");
    if(bio && typeof bio == "string") {
        await client.connect();
        const db = client.db("users");
        const usersWithEmail = await db.collection("users").count({email});
        if(usersWithEmail == 0) {
           throw redirect("/onboarding");
        }
        await db.collection("users").updateOne({email}, {"$set": {email, bio}});
    }

    return redirect("/browse");
}

export let loader: LoaderFunction = async ({ request }) => {
    let userId = await getUserId(request);
    if (!userId) throw new Response("Unauthorized", { status: 401 });
    return {userId};
  };

export default function Welcome() {
    const data = useLoaderData<{userId: string}>();
    return (
        <main>
            <section>
                <form action="/welcome" method="post">
                    <h2>Strike a Chord</h2>
                    <p>
                        Tell us a little about yourself: what
                        do you enjoy? How do you relax? We'd
                        love to get to know you better.
                        </p>
                    <textarea name="bio" autoFocus/>
                    <button type="submit">Join Chord</button>
                </form>
            </section>
        </main>
    )
}

export const links = () => {
    return [{rel: "stylesheet", href: styles}]
}