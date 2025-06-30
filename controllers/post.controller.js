const { createPostSchema } = require("../middlewares/user.validator");
const Post = require("../models/post.models");

const getPost = async (req, res) => {
  const { page } = req.query;
  const postPerPage = 10;

  try {
    let pageNum = 10;
    if (page <= 1) {
      pageNum = 0;
    } else {
      pageNum = page - 1;
    }

    const result = await Post.find()
      .sort({ createdAt: -1 })
      .skip(pageNum * postPerPage)
      .limit(postPerPage)
      .populate({
        path: "userId",
        select: "email",
      });
    res.status(200).json({ success: true, message: "post", data: result });
  } catch (error) {
    console.log(error);
  }
};

const createPost = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user;

  try {
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const result = await Post.create({
      title,
      description,
      userId,
    });
    res.status(201).json({ success: true, message: "created", data: result });
  } catch (error) {
    console.log(error);
  }
};

const singlePost = async (req, res) => {
  const { _id } = req.query;

  try {
    const result = await Post.findOne({ _id }).populate({
      path: "userId",
      select: "email",
    });
    res
      .status(200)
      .json({ success: true, message: "single-post", data: result });
  } catch (error) {
    console.log(error);
  }
};

const updatePost = async (req, res) => {
  const { _id } = req.query;
  const { title, description } = req.body;
  const { userId } = req.user;

  try {
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existingPost = await Post.findOne({ _id });

    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post unvailable" });
    }
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "unauthorize" });
    }

    (existingPost.title = title), (existingPost.description = description);

    const result = await existingPost.save();
    res.status(200).json({ success: true, message: "Updated", data: result });
  } catch (error) {
    console.log(error);
  }
};

const deletePost = async (req, res) => {
  const { _id } = req.query;
  const { userId } = req.user;

  try {
    const existingPost = await Post.findOne({ _id });

    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post already unvailable" });
    }
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "unauthorize" });
    }

    await Post.deleteOne({_id})
    res.status(200).json({ success: true, message: "deleted"});
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getPost, createPost, singlePost, updatePost, deletePost };
