const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) //测试网or本地网？
    ? describe.skip //测试网
    : describe("FundMe", async function () {
          //本地网
          let fundMe
          let deployer
          let MockV3Aggregator
          const sendValue = ethers.parseEther("1") //ethers v6
          // let sendValue = ethers.utils.parseEther("1") ethers v5
          //let sendValue ="1000000000000000000" 18个0为1eth
          beforeEach(async function () {
              //deploy our FundMe Contract
              //using Hardhat-deploy
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) //运行所有的部署文件
              fundMe = await ethers.getContract("FundMe", deployer)
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer,
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, await MockV3Aggregator.getAddress())
              })
          })
          //   describe("receive", async function () {
          //       const { deployerSigner } = await ethers.getSigners() //得到一个数组
          //       it("reverts if the value is under a certain amount", async function () {
          //           await expect(
          //               deployerSigner(0).sendTransaction({
          //                   value: 100,
          //                   to: fundMe.target,
          //               }),
          //           ).to.be.reverted
          //       })
          //       it("funds the contract", async function () {
          //           const startingBalance = await ethers.provider.getBalance(
          //               fundMe.target,
          //           )
          //           await deployerSigner(0).sendTransaction({
          //               value: sendValue,
          //               to: fundMe.target,
          //           })
          //           const endingBalance = await ethers.provider.getBalance(
          //               fundMe.target,
          //           )
          //           assert.equal(endingBalance - startingBalance, sendValue)
          //       })
          //   })
          //   describe("fallback", async function () {
          //       const { deployerSigner } = await ethers.getSigners() //beforeEach的局部变量deployerSigner不能用于it中
          //       it("reverts if the value is under 10USD", async () => {
          //           await expect(
          //               deployerSigner(0).sendTransaction({
          //                   value: 100,
          //                   to: fundMe.target,
          //               }),
          //           ).to.be.reverted
          //       })
          //       it("funds the contract", async function () {
          //           const startingBalance = await ethers.provider.getBalance(
          //               fundMe.target,
          //           )
          //           await deployerSigner(0).sendTransaction({
          //               value: sendValue,
          //               data: "0x1234",
          //               to: fundMe.target,
          //           })
          //           const endingBalance = await ethers.provider.getBalance(
          //               fundMe.target,
          //           )
          //           assert.equal(endingBalance - startingBalance, sendValue)
          //       })
          //   })
          describe("fund", function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough!",
                  )
                  //await fundMe.fund()//测试不传递ETH的情况下
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response =
                      await fundMe.s_addressToAmountFunded(deployer)
                  assert.equal(response, sendValue)
              })
              it("Adds s_funders to array of s_funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_funders(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              }) //在对withdraw进行测试前，我希望在账户里有一定的余额

              it("withdraw ETH from a single funder", async function () {
                  //Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const gasCost =
                      transactionReceipt.gasUsed * transactionReceipt.gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString(),
                  )
              })
              it("allows us to withdraw with multiple s_funders", async () => {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      ) //在循环内部，每次迭代都会调用fundMe合约的connect方法，并传入当前循环的账户(accounts[i])。connect方法返回一个新的合约实例，该实例使用提供的账户作为交易的发送方。这允许测试模拟多个不同用户与合约互动的情况。
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const gasCost =
                      transactionReceipt.gasUsed * transactionReceipt.gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString(),
                  )

                  //清空funders数组和addressToAmountFunded映射
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      )
                  }
              })
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[3]
                  const attackerConnectedContract =
                      await fundMe.connect(attacker)
                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner") //revertedWithCustomError(givenContract, 自定义错误类型)
              })
              //   revertedwith("字符串") 检查错误信息是否包含此字符串，现该方法已被弃用
              it("cheaperWithdraw", async () => {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      ) //在循环内部，每次迭代都会调用fundMe合约的connect方法，并传入当前循环的账户(accounts[i])。connect方法返回一个新的合约实例，该实例使用提供的账户作为交易的发送方。这允许测试模拟多个不同用户与合约互动的情况。
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const gasCost =
                      transactionReceipt.gasUsed * transactionReceipt.gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString(),
                  )

                  //清空funders数组和addressToAmountFunded映射
                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      )
                  }
              })
          })
      })

// 要和一个合约实例进行交互，我们需要创建一个合约对象，并将其连接到一个意图与之交互的账户。可以用getContract方法来创建一个合约对象，然后使用connect方法将其连接到一个账户。这样，我们就可以使用连接的合约对象来调用合约的方法，而这些方法将使用连接的账户作为发送方。这样，我们就可以模拟多个不同用户与合约互动的情况。
