import mongoose, { Model, Mongoose, Schema, Types } from "mongoose";

mongoose.connect("mongodb://localhost:27017/second_brain");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

export const UserModel = mongoose.model("User", UserSchema);

const ContentSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag",
        },
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

export const ContentModel = mongoose.model("Content", ContentSchema);
