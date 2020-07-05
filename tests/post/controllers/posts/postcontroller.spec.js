const chai = require("chai");
const sinon = require('sinon');
const faker = require('faker');

const expect = chai.expect;
const assert = chai.assert;
const should = chai.should;


describe("Post Controller Test", () => {

    describe("create post", () => {
        let status, json, res;
        beforeEach(() => {
            status = sinon.stub();
            json = sinon.spy();
            res = { json, status };
            status.returns(res);
        })
    })
})
