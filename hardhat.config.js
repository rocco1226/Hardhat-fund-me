require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-gas-reporter")
require("hardhat-deploy") //hardhat-deploy only supports ethers v5
require("solidity-coverage")
require("@nomiclabs/hardhat-ethers")

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: { chainId: 31337 },
        sepolia: {
            chainId: 11155111,
            url: SEPOLIA_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "CNY",
        // coinmarketcap: COINMARKETCAP_API_KEY,  //如果不看具体的法定货币价格的gas fee，只看gas used，将此API注释掉
        token: "Matic",
        // 默认为ethereum链，如果想部署到别的链，更改token
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        users: {
            default: 0,
        },
    }, //getNamedAccounts
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 500000,
    },
}
