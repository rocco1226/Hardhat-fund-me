// SPDX-License-Identifier: MIT
//pragma
pragma solidity ^0.8.0;

//import
import "./PriceConverter.sol";

//Error codes
error FundMe__NotOwner(); //自定义错误类型

//Interfaces, Libraries, Contract

///或者/** */ NatSpec风格注释

/** @title A contract for crowd funding
 *  @author Rocco Zha
 *  @notice You can use this contract for crowd funding
 *  @dev This implements price feeds as our library
 */

contract FundMe {
    //Type Declarations
    using PriceConverter for uint256; //引入Library PriceConverter到uint

    //State Variables
    uint256 public constant MINIMUM_USD = 10 * 1e18;

    address[] public s_funders; //记录捐赠者的地址的数组
    mapping(address => uint256) public s_addressToAmountFunded; //映射，地址到数目

    address public immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "sender is not i_owner!");
        if (msg.sender != i_owner) revert FundMe__NotOwner(); //revert回滚交易，报出自定义错误类型FundMe_NotOwner
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress); //我们将helper-hardhat-config.js中的ethUsdPriceFeed传入01-deploy-fund-me.js的ethUsdPriceFeedAddress中，然后作为参数传入FundMe.sol的构造函数
    } //对于pricefeed的地址，我们可以在部署合约的时候传入(参数化设置)，将它保存进一个AggregatorV3Interface类型的全局变量中

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /** @notice This function allows you to fund the contract
     * @dev The contract will only fund if the conversion rate is greater than the MINIMUM_USD
     */

    function fund() public payable {
        require(
            PriceConverter.getConversionRate(msg.value, s_priceFeed) >=
                MINIMUM_USD,
            "Didn't send enough!"
        );
        s_funders.push(msg.sender); //记录地址
        s_addressToAmountFunded[msg.sender] = msg.value; //记录映射
    }

    function withdraw() public onlyOwner {
        /* starting index, ending index, step amount */
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex = funderIndex + 1
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0); //重置数组
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed!");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders; //一次性将storage中的s_funders读入memory中，可以节省gas
        //mapping不能存储于memory中
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
}

//order of layout
//1.pragma statements
//2.Import statements
//3.interfaces
//4.library
//5.contract

//inside contract,library or interface
//1.Type declarations
//2.state variables
//3.events
//4.modifers
//5.functions

//不是所有的state variables都需要public，我们可以修改成private或Internal，然后为他们增加一个函数返回其值
// 例：
// function getOwner() public view returns (address){
//     return i_owner;
// }
