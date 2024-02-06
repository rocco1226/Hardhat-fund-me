//staging test，我们假定智能合约部署在testnet上，因此我们不需要fixture("all")和mockV3Aggregator
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name) //测试网or本地网？
    ? describe.skip //本地网
    : describe("FundMe Staging Test", async function () {
          //测试网
          let fundMe
          let deployer
          const sendValue = ethers.parseEther("0.1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target,
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
