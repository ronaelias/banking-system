// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const app = require('../server');
// const expect = chai.expect;

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

let testUser = {
    username: `testuser_${Date.now()}`, // ensures unique user
    password: 'password123',
};

let testUserId;

describe('Authentication API', function () {
    it('should register a new user', function (done) {
        chai.request(app)
            .post('/register')
            .send(testUser)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.success).to.be.true;
                done();
            });
    });

    it('should login a user and return user ID', function (done) {
        chai.request(app)
            .post('/login')
            .send(testUser)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.success).to.be.true;
                expect(res.body.userId).to.be.a('number');
                testUserId = res.body.userId; // save for later tests
                done();
            });
    });
});

describe('Balance Update API', function () {
    let oldBalance = 0;

    it('should update balance and add funds', function (done) {
        // Get old balance first
        chai.request(app)
            .get(`/balance/${testUserId}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                oldBalance = parseFloat(res.body.balance);

                const transaction = {
                    userId: testUserId,
                    amount: 100,
                    description: 'Deposit',
                };

                chai.request(app)
                    .post('/updateBalance')
                    .send(transaction)
                    .end((err, res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.success).to.be.true;

                        const expectedBalance = oldBalance + transaction.amount;
                        expect(parseFloat(res.body.newBalance)).to.equal(expectedBalance);
                        done();
                    });
            });
    });

    it('should return balance for a user', function (done) {
        chai.request(app)
            .get(`/balance/${testUserId}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.balance).to.be.a('number');
                done();
            });
    });
});
