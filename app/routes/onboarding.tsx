import { ActionFunction, redirect } from '@remix-run/server-runtime'
import { Form } from 'remix';
import client from '~/db';
import { createUserSession } from '~/sessions';
import styles from '../styles/onboarding/index.css'

export const action: ActionFunction = async ({
    request
  }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    if(email && typeof email == "string") {
        await client.connect();
        const db = client.db("users");
        const usersWithEmail = await db.collection("users").count({email});
        if(usersWithEmail == 0) {
            await db.collection("users").insertOne({email});
            return createUserSession(email, "/welcome");
        }
        return createUserSession(email, "/browse");
    }

    return redirect("/onboarding");
}

export default function Welcome() {
    return (
        <main>
            <section>
                <form action="/onboarding" method="post">
                    <h2>Strike a Chord</h2>
                    <p>Just enter your work email, and we'll connect
                        you with awesome coworkers. No password needed.</p>
                    <label htmlFor="email">What's your work email?</label>
                    <input type="email" autoFocus name="email" id="email"/>
                    <button type="submit">Let's go</button>
                </form>
            </section>
            {/* <aside>
                <h1>Chord</h1>
                <p>Chord connects you with your coworkers. This is a filler sentence. This
                    is another filler sentence. Chord is cool.
                </p>
            </aside> */}
        </main>
    )
}

export const links = () => {
    return [{rel: "stylesheet", href: styles}]
}