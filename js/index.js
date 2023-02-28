"use strict";
exports.__esModule = true;
var Pjax = require("pjax");
new Pjax({
    elements: '.link-pjax',
    selectors: ['title', '.body']
});
