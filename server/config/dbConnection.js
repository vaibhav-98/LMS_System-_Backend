import mongoose from "mongoose";

mongoose.set("strictQuery", false); // ensures that values passed to our model constructor that were not specified in our schema do not get saved to the db

const connectionToDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGO_URI || `mongodb://127.0.0.1:27017/lms`
    );

    if (connection) {
      console.log(`connected to mongoDB: ${connection.host}`);
    }
  } catch (error) {
    console.log(error);
    process.exit(1); // It is useful in case of fatal exceptions not handled by the domain. It is an efficient method to terminate the process.
  }
};

export default connectionToDB;
