const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

/* let variable = false
 let someVAR = variable ? "describe.skip" : "localHost"
 equal to 
 if (variable) {someVar = "describe.skip"} else {someVar = "localHost"}
 */

developmentChains.includes(network.name)
    ? describe.skip //we can skip this is it is on a local HH network by using a turnery operator "?"
    : describe("FundMe", function () {
          let fundMe;
          let deployer;
          const sendValue = ethers.utils.parseEther("1"); //we need to give some value to the test and we parse it from 10^18 gewi to 1 ether
          beforeEach(async function () {
              // deploy our fundMe contract
              //using hardhat-deploy
              //const accounts = await ethers.getSigners()
              //const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer; //const {deployer} = await getNamedAccounts();
              //"await deployments.fixture(all);" //we dont need fixture becuase we assume our contract is already deployed to the test net
              //fixture deploys all the deployment scripts in which module.export.tags ("all") same as getContractFactory
              fundMe = await ethers.getContract("FundMe", deployer); //this getContract will get you the most recent contract deployed, when we call fundme it will be from the deployer
          });

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw({
                  gasLimit: 100000,
              });

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              );
              assert.equal(endingFundMeBalance.toString(), "0");
          });
      });
