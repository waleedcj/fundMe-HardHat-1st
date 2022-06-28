//hardhat-deploy is gonna call a fucntion that we specify in this script and there is no main function used

const { network } = require("hardhat");
const { verify } = require("../utils/verify");

//instead of main we will create this parent function that will be called by "yarn hardhat deploy"
// function deployFunc() {
//     console.log("hi!");
//      hre.getNamedAccounts();
//        hre.deployments;
// }

// //this is where we assign the default function
// module.exports.default = deployFunc;

//if chainId is X use this address Y
//if chainId is Z use address A
//like yarn hardhat deploy --network rinkeby or kovan

//if the contract doesn't exsist, we deploy a minimal version of
// for our local testing

const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config"); //using the "{}" when importing is so that you extract a particular method from the file
//const helperConfig = require("../helper-hardhat-config");  this one without the method
//const  networkConfig =  helperConfig.networkConfigl;
//const { network } = require("hardhat");

//nameless function
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); //this helps name the accounts like privatekey01 into eg "deployer"
    const { chainId } = network.config.chainId; //adding the chainId

    //we use this function to the the pricefeed if we are working in a local hardhat network
    let ethUsdPriceFeedAdress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAdress = ethUsdAggregator.address;
    } else {
        console.log("THis is the chainID  " + chainId);

        ethUsdPriceFeedAdress = networkConfig[4]["ethUsdPriceFeed"]; //if not we go into helper-hardhat-config and access the chainID we need along with its address
    }
    const args = [ethUsdPriceFeedAdress];

    const fundMe = await deploy("FundMe", {
        from: deployer, //named accounts
        args: args, //put the priceFeed address of the network you want to work with
        log: true,
        waitConformations: network.config.blockConfirmations || 6, // if blockConfirmations is not specified wait for only 1 block
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }

    log("Deployed.....................");
};

module.exports.tags = ["all", "fundme"]; //u cannot run fundme without mockV3Aggregator becuase it needs the pricefeed 2 contracts are deployed
