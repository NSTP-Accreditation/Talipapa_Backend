const s3Client = require('../config/awsConfig')
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);  
    throw error;
  }
};

module.exports = { deleteFromS3 };