const NodeRSA = require("node-rsa");
const Web3 = require("web3");

let managementContractAddress = "0x159D04852e7D5dDC9A63816e3508C7caC5cF00e3";
let managementContractABI = [
    {
        constant: false,
        inputs: [
            {
                internalType: "string",
                name: "_publicKey",
                type: "string"
            },
            {
                internalType: "address",
                name: "_hospitaladdress",
                type: "address"
            }
        ],
        name: "setPublicKey",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            {
                internalType: "string",
                name: "_patientData",
                type: "string"
            },
            {
                internalType: "bytes",
                name: "_signature",
                type: "bytes"
            },
            {
                internalType: "string",
                name: "_patientPassPhrase",
                type: "string"
            }
        ],
        name: "startExamination",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "contractAddress",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "hospitalAddress",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "patientAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenAddress",
                type: "address"
            }
        ],
        name: "StartExamination",
        type: "event"
    },
    {
        constant: true,
        inputs: [],
        name: "getExaminationList",
        outputs: [
            {
                components: [
                    {
                        internalType: "contract Examination",
                        name: "examinationContract",
                        type: "address"
                    },
                    {
                        internalType: "uint256",
                        name: "start",
                        type: "uint256"
                    }
                ],
                internalType: "struct Management.ExaminationInfo[]",
                name: "",
                type: "tuple[]"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getOwnerPublicKey",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            {
                internalType: "address",
                name: "_hospitaladdress",
                type: "address"
            }
        ],
        name: "getPublicKey",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    }
];

exports.reEncrypt = async (req, res) => {
    //let ownerEncrypted = "WRrMwEjY0XKY2IvsI69G/xjHHT4/KQ+8/IWTKGBBFcI9yqrA1kPW6tc2nnr6MJqPL01wP8g4St1wF13JbltfZA==";//
    let ownerEncrypted = req.query["encrypted"];
    let hospitalAddress = req.query["hospital"];

    let ownerPriavateKey =
        "-----BEGIN RSA PRIVATE KEY-----\nMIIBOwIBAAJBAKy8bRAXGLZmStIOYPk2vcN7WMql0YREBgJzvWx+hYxGChEQhkEC\nE1RehvC66Mn5m/sNaRAlJmSFXuOS7nvMnjUCAwEAAQJAfuQAPjSpS7yDNCGp7Qjg\nh8yBooQDEGWkAIMjYKLk2fCYUYSKwGFsB1ohfPwSkZlVdMKDnw13UXJzxFGfjnV8\nFQIhANt+W8/N64WvUEabreLKSXnsoHhUBesukdxx5XsqwUyPAiEAyXc3GJ2+fPcI\n2tpEWrPuI9ev/JGOFUP9mH81XxwTkvsCIQCEThZpnGZrntF0vkKCggzoQYo4/ezT\nZq7lgoIhTBRYYQIgMtOmzMkPQ8u3Ki+iyxdV3ykNNzUpmWfb1NtTBbm5nn0CIQDN\nlMGaHhmtDy8o8p5aPXujmkLL0NHXM+wmfHTaYgxjiQ==\n-----END RSA PRIVATE KEY-----";
    let envPrivateKey = process.env.OWNER_PRIVATE_KEY;

    if (ownerPriavateKey === envPrivateKey) console.log("同一");
    else console.log("ハード", ownerPriavateKey, "環境変数", envPrivateKey);

    console.log(ownerEncrypted);
    const ownerKey = new NodeRSA(ownerPriavateKey);
    const decrypted = ownerKey.decrypt(ownerEncrypted, "utf8");

    const web3 = new Web3(
        "wss://rinkeby.infura.io/ws/v3/cf93a80dccb7456d806de40695023f72"
    );
    let managementContract = new web3.eth.Contract(
        managementContractABI,
        managementContractAddress
    );
    let hospitalPublicKey = await managementContract.methods
        .getPublicKey(hospitalAddress)
        .call();

    const hospitalKey = new NodeRSA(hospitalPublicKey);
    const hostpitalEncrypted = hospitalKey.encrypt(decrypted, "base64");
    res.status(200).send(hostpitalEncrypted);
};
