// @format
import { expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";
import Web3 from "web3";

import { fetchTransactionsBatch } from "../../src/sagas/fetchTransactions";

expectSaga.DEFAULT_TIMEOUT = 500;

describe("transaction fetching", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  it("should process transactions correctly and return a token", async () => {
    const contractAddress = "0x9326f84fcca8a136da3a4f71bbffbde6635c58da";
    const address = "0x51Ff1fab76079d20418d1c74DA65653FfE3fD0aa";
    const tokenURI = "https://example.com";

    fetch
      .once(
        JSON.stringify({
          validTo: { "@value": "2100-11-05T15:49:37+01:00" }
        })
      )
      .once(
        JSON.stringify({
          validTo: { "@value": "2100-11-05T15:49:37+01:00" }
        })
      );
    const web3Mock = {
      eth: {
        net: {
          getId: jest.fn(() => 1)
        },
        Contract: jest.fn(() => {
          return {
            getPastEvents: jest
              .fn()
              .mockReturnValueOnce([
                {
                  returnValues: {
                    _tokenId: 1
                  }
                }
              ]) //outputs
              .mockReturnValueOnce([
                {
                  returnValues: {
                    _tokenId: 2
                  }
                }
              ]), //input
            methods: {
              tokenURI: jest.fn(() => jest.fn(() => tokenURI)),
              name: jest.fn(() => jest.fn(() => "name"))
            }
          };
        })
      }
    };

    const tokenURISplit = tokenURI.split("/");
    const tokenHash = tokenURISplit[tokenURISplit.length - 1];
    return expectSaga(fetchTransactionsBatch, {
      payload: { web3: web3Mock, address, contracts: [contractAddress] }
    })
      .put({
        type: "FETCH_TRANSACTIONS_SUCCESS",
        payload: {
          transactions: {
            [contractAddress]: [
              {
                _tokenId: 2,
                token: { validTo: { "@value": "2100-11-05T15:49:37+01:00" } },
                name: "name",
                contract: contractAddress,
                tokenHash
              }
            ]
          }
        }
      })
      .run();
  });

  it("should process transactions correctly and return no token", async () => {
    const contractAddress = "0x9326f84fcca8a136da3a4f71bbffbde6635c58da";
    const address = "0x51Ff1fab76079d20418d1c74DA65653FfE3fD0aa";
    fetch
      .once(
        JSON.stringify({
          validTo: { "@value": "2019-11-05T15:49:37+01:00" }
        })
      )
      .once(
        JSON.stringify({
          validTo: { "@value": "2019-11-05T15:49:37+01:00" }
        })
      );
    const web3Mock = {
      eth: {
        net: {
          getId: jest.fn(() => 1)
        },
        Contract: jest.fn(() => {
          return {
            getPastEvents: jest
              .fn()
              .mockReturnValueOnce([{ returnValues: { _tokenId: 1 } }]) //outputs
              .mockReturnValueOnce([{ returnValues: { _tokenId: 1 } }]), // inputs
            methods: {
              tokenURI: jest.fn(() => jest.fn(() => "https://example.com")),
              name: jest.fn(() => jest.fn(() => "name"))
            }
          };
        })
      }
    };

    return expectSaga(fetchTransactionsBatch, {
      payload: { web3: web3Mock, address, contracts: [contractAddress] }
    })
      .put({
        type: "FETCH_TRANSACTIONS_SUCCESS",
        payload: {
          transactions: {
            [contractAddress]: []
          }
        }
      })
      .run();
  });
  it("should process transactions correctly and not return expired tokens", async () => {
    const contractAddress = "0x9326f84fcca8a136da3a4f71bbffbde6635c58da";
    const address = "0x51Ff1fab76079d20418d1c74DA65653FfE3fD0aa";
    const tokenURI = "https://example.com";
    fetch
      .once(
        JSON.stringify({
          validTo: { "@value": "2018-11-05T15:49:37+01:00" }
        })
      )
      .once(
        JSON.stringify({
          validTo: { "@value": "2018-11-05T15:49:37+01:00" }
        })
      );
    const web3Mock = {
      eth: {
        net: {
          getId: jest.fn(() => 1)
        },
        Contract: jest.fn(() => {
          return {
            getPastEvents: jest
              .fn()
              .mockReturnValueOnce([
                {
                  returnValues: {
                    _tokenId: 1
                  }
                }
              ]) //outputs
              .mockReturnValueOnce([
                {
                  returnValues: {
                    _tokenId: 2
                  }
                }
              ]), // inputs
            methods: {
              tokenURI: jest.fn(() => jest.fn(() => tokenURI)),
              name: jest.fn(() => jest.fn(() => "name"))
            }
          };
        })
      }
    };

    const tokenURISplit = tokenURI.split("/");
    const tokenHash = tokenURISplit[tokenURISplit.length - 1];
    return expectSaga(fetchTransactionsBatch, {
      payload: { web3: web3Mock, address, contracts: [contractAddress] }
    })
      .put({
        type: "FETCH_TRANSACTIONS_SUCCESS",
        payload: {
          transactions: {
            [contractAddress]: []
          }
        }
      })
      .run();
  });
});
