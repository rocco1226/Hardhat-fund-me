// import
//main function
//calling of main function

// 一种部署的方式
// async function deployFunc(hre) {函数内容}
// module.exports.default = deployFunc

//另一种部署的方式
// module.exports = async ({getNamedAccounts,deployments}) => {
//           函数内容
// }

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, deployments } = require("hardhat")
const { verify } = require("../utils/verify")

const chainId = network.config.chainId

// const ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments //从deployments对象中解构出两个方法
    const { deployer } = await getNamedAccounts()

    // if chainId is X use address Y
    // if chainId is Z use address A

    //hre.getNamedAccounts
    //hre.deployments

    //当使用本地主机或"Hardhat Network"时，我们要使用mock

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const FundMe = await deploy("FundMe", {
        //这里是"FundMe"，而不是"Fundme"，尽管artifacts/contracts/FundMe.sol中显示的是"FundMe"，Hardhat在编译合约时会生成对应的artifact文件，这些文件通常会根据合约的名称来命名，而不是合约的文件名。确保你的合约名称（在合约代码中定义的那个，例如 contract Fundme {...}）与你尝试加载的artifact名称完全一致。
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(FundMe.address, [ethUsdPriceFeedAddress])
    }

    log("------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
