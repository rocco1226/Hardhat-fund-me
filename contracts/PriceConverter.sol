//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; //编译一个接口，我们就能引入外部ABI

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //ABI
        //Address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306 //我们在这里使用了硬编码来引入ABI，但是我们可以将其模块化，以便于应对不同的区块链（因为每个区块链对应的pricefeed的ABI都不一样，我们本来需要在合约内部修改，现在只许修改其参数)
        // );

        (, int256 price, , , ) = priceFeed.latestRoundData(); //pricefeed8位小数
        return uint(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethprice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethprice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }

    // function getVersion(
    //     AggregatorV3Interface priceFeed
    // ) internal view returns (uint256) {
    //     // AggregatorV3Interface priceFeed = AggregatorV3Interface(
    //     //     0x694AA1769357215DE4FAC081bf1f309aDC325306
    //     // ); //我们在这里使用了硬编码来引入ABI，但是我们可以将其模块化，以便于应对不同的区块链（因为每个区块链对应的pricefeed的ABI都不一样，我们本来需要在合约内部修改，现在只许修改其参数)

    //     return priceFeed.version();
    // } 这里是一个例子，我们可以通过ABI来获取pricefeed的版本号，我们不需要它
}
