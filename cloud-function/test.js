const NodeRSA = require("node-rsa");
const Web3 = require("web3");
const request = require("request-promise");

//ここで病院の公開鍵で暗号化する
// managementから公開鍵を取得
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

// 患者側の共通鍵を暗号化
// messageをOwnerの公開鍵で暗号化
async function encryptByOwnerPublicKey(message) {
    // スマートコントラクトからサーバーの公開鍵を入手
    const web3 = new Web3(
        "wss://rinkeby.infura.io/ws/v3/cf93a80dccb7456d806de40695023f72"
    );
    let managementContract = new web3.eth.Contract(
        managementContractABI,
        managementContractAddress
    );

    let ownerPublicKey = await managementContract.methods
        .getOwnerPublicKey()
        .call();
    let ownerKey = new NodeRSA(ownerPublicKey);

    const ownerEncrypted = ownerKey.encrypt(message, "base64");
    console.log("ownerEncrypted: ", ownerEncrypted);
    return ownerEncrypted;
}

//
async function decryptByOwner(ownerEncrypted) {
    let options = {
        url: "https://asia-east2-remote-253306.cloudfunctions.net/reEncrypt",
        qs: {
            encrypted: ownerEncrypted,
            hospital: "0x5f527BD60061b937836526BAe83bB4581f9bAc01"
        }
    };
    let hospitalEncrypted = await request(options);
    console.log("reEncrypted: ", hospitalEncrypted);
    const hospitalPrivateKey =
        "-----BEGIN RSA PRIVATE KEY-----\nMIIBOwIBAAJBAKy8bRAXGLZmStIOYPk2vcN7WMql0YREBgJzvWx+hYxGChEQhkEC\nE1RehvC66Mn5m/sNaRAlJmSFXuOS7nvMnjUCAwEAAQJAfuQAPjSpS7yDNCGp7Qjg\nh8yBooQDEGWkAIMjYKLk2fCYUYSKwGFsB1ohfPwSkZlVdMKDnw13UXJzxFGfjnV8\nFQIhANt+W8/N64WvUEabreLKSXnsoHhUBesukdxx5XsqwUyPAiEAyXc3GJ2+fPcI\n2tpEWrPuI9ev/JGOFUP9mH81XxwTkvsCIQCEThZpnGZrntF0vkKCggzoQYo4/ezT\nZq7lgoIhTBRYYQIgMtOmzMkPQ8u3Ki+iyxdV3ykNNzUpmWfb1NtTBbm5nn0CIQDN\nlMGaHhmtDy8o8p5aPXujmkLL0NHXM+wmfHTaYgxjiQ==\n-----END RSA PRIVATE KEY-----";
    //復号
    const hospitalKey = new NodeRSA(hospitalPrivateKey);
    const decrypted = hospitalKey.decrypt(hospitalEncrypted, "utf8");
    console.log("last: ", decrypted);
    return decrypted;
}

async function test() {
    let encryptedString = await encryptByOwnerPublicKey("Hello,Text!!");
    // QRコード受け渡し
    decryptByOwner(encryptedString);
    return;
}

test();
