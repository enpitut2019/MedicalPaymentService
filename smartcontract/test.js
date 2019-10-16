let Web3 = require('web3');
let CryptoJS = require('crypto-js');

let Examination = require('./examination.js');

// ローカルで保存するデータ
let privateKey = "0x0D274BD5D6DC605137D958AC2DB9C9BD189FF86338150A04C7DB4B3E942FAC0C";
let passPhrase = "0x5f5278ef122e68c6a0d4e037289317178a0555aad18e5cd1366df39683483b1785bc632ac5c7981a9a98e5660ec35e";
// let hospitalAddress = "0x5f527BD60061b937836526BAe83bB4581f9bAc01";
let tokenAddress = "0x0abcd3eE0378B6BB406cFa8Ea4521E7B03b89713";

let hospital = new Examination(privateKey, passPhrase, true);
let patient = new Examination(privateKey, passPhrase, false);

function makeData() {
    let patientData = "Takashi 1998 Male";
    let _patientData = patient.encryptData(patientData);
    let _signature = patient.signMessage(_patientData);
    let patientPassPhrase = patient.getPassPhrase();
    // ここまでは患者側で行われる処理
    let _patientPassPhrase = CryptoJS.AES.encrypt(patientPassPhrase, hospital.getPassPhrase()).toString();
    console.log("_patientData " + _patientData);
    console.log("_signature " + _signature);
    console.log("_patientPassPhrase " + _patientPassPhrase);
    console.log("_hospitalAddress " + hospital.getAddress());
    console.log("_tokenAddress " + tokenAddress);
}

async function test() {
    let exam = new examination("0x5BDC0A2dD903956B1D06E6178c8217b5756bAe0a");
    await exam.init(hospitalPrivateKey, hospitalPassPhrase, true);
    console.log(await exam.getPatientInfo());
    console.log(exam.getTokenData());
    await exam.getUsedEther();
    await exam.getPaymentStatus();
    await exam.setMedicalCost(12354.1442);
    await exam.getPaymentStatus();
}

makeData();
//test();