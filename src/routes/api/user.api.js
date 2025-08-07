const express = require('express');
const _ = express.Router();
const userControllar = require('../../controller/user.controllar')
_.route("/registation").post(userControllar.registation);

module.exports = _;