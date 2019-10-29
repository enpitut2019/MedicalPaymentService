import Web3 from "web3";

export default class {
    constructor() {
        this.web3 = new Web3(
            "wss://rinkeby.infura.io/ws/v3/cf93a80dccb7456d806de40695023f72"
        );
        let erc20TokenABI = [
            {
                constant: true,
                inputs: [],
                name: "name",
                outputs: [{ name: "", type: "string" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "spender", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                name: "approve",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "totalSupply",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "sender", type: "address" },
                    { name: "recipient", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                name: "transferFrom",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "decimals",
                outputs: [{ name: "", type: "uint8" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "spender", type: "address" },
                    { name: "addedValue", type: "uint256" }
                ],
                name: "increaseAllowance",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: true,
                inputs: [{ name: "account", type: "address" }],
                name: "balanceOf",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: true,
                inputs: [],
                name: "symbol",
                outputs: [{ name: "", type: "string" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "spender", type: "address" },
                    { name: "subtractedValue", type: "uint256" }
                ],
                name: "decreaseAllowance",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: false,
                inputs: [
                    { name: "recipient", type: "address" },
                    { name: "amount", type: "uint256" }
                ],
                name: "transfer",
                outputs: [{ name: "", type: "bool" }],
                payable: false,
                stateMutability: "nonpayable",
                type: "function"
            },
            {
                constant: true,
                inputs: [
                    { name: "owner", type: "address" },
                    { name: "spender", type: "address" }
                ],
                name: "allowance",
                outputs: [{ name: "", type: "uint256" }],
                payable: false,
                stateMutability: "view",
                type: "function"
            },
            {
                inputs: [
                    { name: "_name", type: "string" },
                    { name: "_symbol", type: "string" },
                    { name: "_decimals", type: "uint8" },
                    { name: "_value", type: "uint256" }
                ],
                payable: false,
                stateMutability: "nonpayable",
                type: "constructor"
            },
            {
                anonymous: false,
                inputs: [
                    { indexed: true, name: "from", type: "address" },
                    { indexed: true, name: "to", type: "address" },
                    { indexed: false, name: "value", type: "uint256" }
                ],
                name: "Transfer",
                type: "event"
            },
            {
                anonymous: false,
                inputs: [
                    { indexed: true, name: "owner", type: "address" },
                    { indexed: true, name: "spender", type: "address" },
                    { indexed: false, name: "value", type: "uint256" }
                ],
                name: "Approval",
                type: "event"
            }
        ];
        this.myContract = new this.web3.eth.Contract(erc20TokenABI);
    }

    setTokenAddress(tokenAddress) {
        this.myContract.options.address = tokenAddress;
    }

    async getTokenInfo() {
        let name = await this.myContract.methods.name().call();
        let symbol = await this.myContract.methods.symbol().call();
        let decimals = await this.myContract.methods.decimals().call();
        return { name, symbol, decimals };
    }

    privateKeyToAddress(privateKey) {
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        return this.account.address;
    }

    async tokenBalanceOf(owner) {
        return await this.myContract.methods.balanceOf(owner).call();
    }

    async etherBalancOf(owner) {
        let wei = await this.web3.eth.getBalance(owner);
        return this.web3.utils.fromWei(wei, "ether");
    }

    async transferERC20Token(_to, _value) {
        let decimals = this.web3.utils.toBN(
            await this.myContract.methods.decimals().call()
        );
        let value = this.web3.utils.toBN(_value);
        let hexValue =
            "0x" +
            value.mul(this.web3.utils.toBN(10).pow(decimals)).toString("hex");
        let encodedABI = this.myContract.methods
            .transfer(_to, hexValue)
            .encodeABI();
        let gasAmount =
            (await this.myContract.methods
                .transfer(_to, hexValue)
                .estimateGas({ from: this.account.address })) + 10000;
        let tx = {
            to: this.myContract.options.address,
            data: encodedABI,
            gas: gasAmount
        };
        let signedtx = await this.account.signTransaction(tx);
        let receipt = await this.web3.eth.sendSignedTransaction(
            signedtx.rawTransaction
        );
        console.log(receipt);
    }
}
