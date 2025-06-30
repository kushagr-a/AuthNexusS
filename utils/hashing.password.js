const {createHmac} = require("crypto")

const { hash, compare } = require("bcrypt");

const doHash = async (value, saltValue) => {
  const result = await hash(value, saltValue);
  return result;
};

const doHashValidation = async (value, hashedValue) => {
  const result = await compare(value, hashedValue);
  return result;
};

const hamcprocess = (value, key)=>{
  const result = createHmac("sha256",key).update(value).digest('hex')
  return result
}

module.exports = { doHash, doHashValidation, hamcprocess };
