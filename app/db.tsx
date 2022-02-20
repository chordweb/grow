import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://treehacks:treehacks@cluster0.jbdev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

export default client;