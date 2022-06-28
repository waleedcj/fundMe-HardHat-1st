//network config

const networkConfig = {
    31337: {
        name: "localhost",
    },
    42: {
        name: "kovan",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    },
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALLS = 8; //constructor arguments from the Mock contract
const INITIAL_ANSWER = 200000000000; //what will be the price feed starting at

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALLS,
    INITIAL_ANSWER,
}; //module.export so that other JS scripts can interact with it
