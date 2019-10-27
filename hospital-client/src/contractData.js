export let examinationContractABI = [
    {
        constant: false,
        inputs: [],
        name: "withDraw",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getPatientInfo",
        outputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "string", name: "", type: "string" },
            { internalType: "string", name: "", type: "string" }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getPatientAddress",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            {
                internalType: "uint256",
                name: "_medicalCost",
                type: "uint256"
            }
        ],
        name: "setMedicalCost",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "bytes", name: "_signature", type: "bytes" }],
        name: "signMedicalCost",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getUsedEther",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getPaymentStatus",
        outputs: [
            { internalType: "uint256", name: "", type: "uint256" },
            { internalType: "uint256", name: "", type: "uint256" },
            { internalType: "uint256", name: "", type: "uint256" },
            { internalType: "bool", name: "", type: "bool" }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "getTokenData",
        outputs: [
            { internalType: "string", name: "name", type: "string" },
            { internalType: "string", name: "symbol", type: "string" },
            { internalType: "uint8", name: "decimals", type: "uint8" }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_patientData",
                type: "string"
            },
            { internalType: "bytes", name: "_signature", type: "bytes" },
            {
                internalType: "string",
                name: "_patientPassPhrase",
                type: "string"
            },
            {
                internalType: "address",
                name: "_hospitalAddress",
                type: "address"
            },
            {
                internalType: "address",
                name: "_tokenAddress",
                type: "address"
            }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
    },
    { payable: false, stateMutability: "nonpayable", type: "fallback" },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "medicalCost",
                type: "uint256"
            }
        ],
        name: "SetMedicalCost",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bool",
                name: "signed",
                type: "bool"
            }
        ],
        name: "SignMedicalCost",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "unpaidCost",
                type: "uint256"
            }
        ],
        name: "WithDraw",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "Refund",
        type: "event"
    }
];

export let managementContractABI = [
    {
        constant: false,
        inputs: [
            { internalType: "string", name: "_patientData", type: "string" },
            { internalType: "bytes", name: "_signature", type: "bytes" },
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
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "contractAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "hospitalAddress",
                type: "address"
            },
            {
                indexed: false,
                internalType: "address",
                name: "patientAddress",
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
                    { internalType: "uint256", name: "start", type: "uint256" }
                ],
                internalType: "struct Management.ExaminationInfo[]",
                name: "",
                type: "tuple[]"
            }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
    }
];

export let managementContractAddress =
    "0x94Fc3D9d40C08Dd65F58E3883f878399D764B390";