const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) //this will only run on dev chain
    ? describe.skip //we can skip this is it is on a local HH network by using a turnery operator "?"
    : describe("FundMe", function () {
          let fundMe;
          let deployer;
          let MockV3Aggregator;
          const sendValue = ethers.utils.formatEther("10000000000000000"); //we need to give some value to the test and we parse it from 10^18 gewi to 1 ether
          beforeEach(async function () {
              // deploy our fundMe contract
              //using hardhat-deploy
              //const accounts = await ethers.getSigners()
              //const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer; //const {deployer} = await getNamedAccounts();
              await deployments.fixture("all"); //fixture deploys all the deployment scripts in which module.export.tags ("all") same as getContractFactory
              fundMe = await ethers.getContract("FundMe", deployer); //this getContract will get you the most recent contract deployed, when we call fundme it will be from the deployer
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              ); //to get the priceFeed
          });
          //tests only for constructor
          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, MockV3Aggregator.address);
              });
          });
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  ); //When you want fucntions to throw errors you use expect keyword expect things to fail
              });
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  ); //This goes to the mapping and identifies the amout that was funded through this address kinda making it a 2in1 test
                  assert.equal(response.toString(), sendValue.toString());
              });
              it("Adds funders to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });
          describe("Withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });
              it("withdraw ETH from a single founder", async function () {
                  //arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1); //we can get gasCost using transaction recipt

                  const { gasUsed, effectiveGasPrice } = transactionReceipt; //this was pulled out from the  transactionReceipt object using the debugger
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allows us to withdraw multiple funders", async function () {
                  //arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      ); //connect function because our fund me contract is connect to our deployer account so anytime a transaction is called the deployer account
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1); //we can get gasCost using transaction recipt

                  const { gasUsed, effectiveGasPrice } = transactionReceipt; //this was pulled out from the  transactionReceipt object using the debugger
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //make sure accounts are reset properly
                  expect(fundMe.getFunder(0)).to.be.revertedWith(
                      //we want this to throw an error we know that there is no funder address on the zeroth index but we still call it to confirm
                      "Its Okay dont worry"
                  );

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ), // we will now compare all the balances that they are equal to zero if pass then indeed they are
                          0
                      );
                  }
              });
              it("only allow the onwer to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  console.log(attackerConnectedContract.address);
                  console.log(deployer);
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
              it("allows us to Cheaper withdraw multiple funders", async function () {
                  //arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      ); //connect function because our fund me contract is connect to our deployer account so anytime a transaction is called the deployer account
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1); //we can get gasCost using transaction recipt

                  const { gasUsed, effectiveGasPrice } = transactionReceipt; //this was pulled out from the  transactionReceipt object using the debugger
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  //make sure accounts are reset properly
                  expect(fundMe.getFunder(0)).to.be.revertedWith(
                      //we want this to throw an error we know that there is no funder address on the zeroth index but we still call it to confirm
                      "Its Okay dont worry"
                  );

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ), // we will now compare all the balances that they are equal to zero if pass then indeed they are
                          0
                      );
                  }
              });
          });
          // BeforeEach(async function () {
          //     //
          // });

          // it("//", async function () {});
          // it("//", async function () {});
      });
