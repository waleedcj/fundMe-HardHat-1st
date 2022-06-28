//Mock priceFeed contract for a local hardhat network
const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALLS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

//When you require Hardhat (const hardhat = require("hardhat")) you're getting an instance of the HRE.
//nameless function
module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); //this helps name the accounts like privatekey01 into eg "deployer"
    const { chainId } = network.config.chainId; //adding the chainId

    if (developmentChains.includes(network.name)) {
        //is same as developmentChains.includes("localhost")
        log("Local network detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALLS, INITIAL_ANSWER],
        });
        console.log("Mocks Deployed!!!");
        console.log("----------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
