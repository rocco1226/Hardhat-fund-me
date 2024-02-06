//通过不同的chainId来配置不同的pricefeed地址
//如果部署至当地网络localhost，他没有pricefeed地址，所以我们要使用mock

const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    31337: {
        name: "localhost",
    },

    // chainId:{
    //     name:
    //     pricefeedAddress:
    // }
}

const developmentChains = ["hardhat", "localhost"] //wht test --network localhost error?
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
